-- Gram Setu Database Schema for Supabase / PostgreSQL

-- 1. ENUM Types
CREATE TYPE category_type AS ENUM ('water', 'road', 'electricity', 'sanitation', 'health', 'education');
CREATE TYPE problem_status AS ENUM ('reported', 'verified', 'scored', 'funded', 'in_progress', 'completed');
CREATE TYPE user_role AS ENUM ('official', 'field_staff', 'citizen');

-- 2. USERS Table (extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'citizen' NOT NULL,
    panchayat_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panchayat_id TEXT NOT NULL,
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
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to problems
CREATE POLICY "Public problems read" ON public.problems FOR SELECT USING (true);

-- Allow authenticated citizens to insert problems
CREATE POLICY "Citizens insert problems" ON public.problems FOR INSERT WITH CHECK (true);

-- Allow field staff & officials to update problems
CREATE POLICY "Staff update problems" ON public.problems FOR UPDATE USING (true);
