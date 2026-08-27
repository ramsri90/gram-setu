# Supabase & PostgreSQL Setup Guide for Gram Setu

This guide provides clear step-by-step instructions to connect **Gram Setu** to your **Supabase** instance, set up PostgreSQL database tables, configure the `issue-images` storage bucket, and manage environment credentials.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New Project**.
3. Select your organization, enter a project name (e.g. `gram-setu`), choose a strong Database Password, and set your region.
4. Click **Create new project** and wait ~2 minutes for provision.

---

## Step 2: Execute PostgreSQL Schema Code

1. In your Supabase Dashboard left sidebar, click on **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the complete PostgreSQL SQL code below (also stored in `supabase/schema.sql`):

```sql
-- 1. ENUM Types
DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('water', 'road', 'electricity', 'sanitation', 'health', 'education');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE problem_status AS ENUM ('reported', 'noted', 'verified', 'scored', 'funded', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('official', 'field_staff', 'citizen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES Table (extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'citizen' NOT NULL,
    panchayat_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, panchayat_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
    new.raw_user_meta_data->>'panchayat_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. PROBLEMS Table (Citizen Grievances & Official Review)
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panchayat_id TEXT NOT NULL DEFAULT 'GP-SEHORE-01',
    panchayat_name TEXT NOT NULL,
    district TEXT NOT NULL,
    title TEXT NOT NULL,
    category category_type NOT NULL,
    location TEXT NOT NULL,
    estimated_cost NUMERIC(12, 2) NOT NULL,
    people_affected INT NOT NULL CHECK (people_affected >= 0),
    urgency INT NOT NULL CHECK (urgency BETWEEN 1 AND 5),
    safety_impact INT NOT NULL CHECK (safety_impact BETWEEN 1 AND 5),
    health_impact INT NOT NULL CHECK (health_impact BETWEEN 1 AND 5),
    current_condition INT NOT NULL CHECK (current_condition BETWEEN 1 AND 5),
    status problem_status DEFAULT 'reported' NOT NULL,
    reported_by TEXT NOT NULL,
    reported_date DATE DEFAULT CURRENT_DATE NOT NULL,
    verified_by TEXT,
    photo_url TEXT,
    priority_score NUMERIC(5, 2),
    score_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profile read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public problems read" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Citizens insert problems" ON public.problems FOR INSERT WITH CHECK (true);
CREATE POLICY "Officials update problems" ON public.problems FOR UPDATE USING (true);
```

4. Click **Run** to execute the script and create your tables, triggers, and RLS policies.

---

## Step 3: Set Up Image Storage Bucket

1. In Supabase Dashboard, click on **Storage** in the left sidebar.
2. Click **New Bucket**.
3. Enter Name: `issue-images`.
4. Toggle **Public Bucket** to **ON** (so images are viewable by official and public dashboards).
5. Click **Save**.

Alternatively, run this SQL query in the **SQL Editor**:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-images', 'issue-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Issue Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'issue-images');

CREATE POLICY "Citizen Image Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'issue-images');
```

---

## Step 4: Configure Environment Variables

1. Go to **Project Settings** -> **API** in your Supabase Dashboard.
2. Copy your **Project URL** and **`anon` `public` key**.
3. Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 5: How It Works in Gram Setu

- **Live Supabase Sync**: When `.env.local` credentials are active, citizen complaint submissions and file uploads immediately push to Supabase PostgreSQL and Storage.
- **Offline / Local Demo Fallback**: If environment variables are missing, the application automatically uses local state & Base64 image previews so you can test all features seamlessly without setting up credentials first.
- **Citizen Portal**: Citizens register at login, upload site photos, and submit issues.
- **Official Master Admin**: Officials view uploaded issue images, change complaint status to **"Marked as Noted"** or **"Work in Progress"**, and run 0/1 Knapsack optimization.
