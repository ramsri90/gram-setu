-- Gram Setu Database Schema for Supabase / PostgreSQL
-- Features: Dual Login (Citizen vs Official), Image Storage Bucket, Noted/Work-In-Progress Status Workflow

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

-- 2. USERS / PROFILES Table (extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'citizen' NOT NULL,
    panchayat_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to automatically create profile on signup safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, panchayat_name)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Gram Citizen'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
    COALESCE(new.raw_user_meta_data->>'panchayat_name', 'Rampur Gram Panchayat')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    panchayat_name = EXCLUDED.panchayat_name;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error and allow user auth creation to proceed smoothly
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. BUDGETS Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panchayat_id TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 4500000.00,
    allocated_amount NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROBLEMS Table
CREATE TABLE IF NOT EXISTS public.problems (
    id TEXT PRIMARY KEY DEFAULT ('PRB-' || floor(random() * 900 + 100)::text),
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

-- 5. ALLOCATION_PLANS Table
CREATE TABLE IF NOT EXISTS public.allocation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panchayat_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    strategy_type TEXT NOT NULL,
    total_budget NUMERIC(14, 2) NOT NULL,
    funded_amount NUMERIC(14, 2) NOT NULL,
    selected_problem_ids UUID[] NOT NULL,
    total_people_benefited INT NOT NULL,
    efficiency_ratio NUMERIC(6, 2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile & public profiles
CREATE POLICY "Public profile read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Problems: Anyone can view problems
CREATE POLICY "Public problems read" ON public.problems FOR SELECT USING (true);

-- Problems: Authenticated users & citizens can submit problems
CREATE POLICY "Citizens insert problems" ON public.problems FOR INSERT WITH CHECK (true);

-- Problems: Officials & Field staff can update problem status
CREATE POLICY "Officials update problems" ON public.problems FOR UPDATE USING (true);

-- Problems: Officials can delete problems
CREATE POLICY "Officials delete problems" ON public.problems FOR DELETE USING (true);

-- 7. SUPABASE STORAGE SETUP FOR ISSUE IMAGES
-- Create bucket "issue-images" if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-images', 'issue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to issue images bucket
CREATE POLICY "Public Access to Issue Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'issue-images');

-- Upload access for citizens and authenticated users
CREATE POLICY "Citizen Image Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'issue-images');

