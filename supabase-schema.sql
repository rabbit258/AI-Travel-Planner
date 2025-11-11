-- Travel AI Planner Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
	id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
	email TEXT,
	full_name TEXT,
	avatar_url TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Travel plans table
CREATE TABLE IF NOT EXISTS public.travel_plans (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
	title TEXT NOT NULL,
	destination TEXT NOT NULL,
	start_date DATE,
	days INTEGER,
	budget NUMERIC(10, 2),
	travelers INTEGER,
	preferences TEXT[],
	with_children BOOLEAN DEFAULT FALSE,
	language TEXT DEFAULT 'zh',
	-- Plan data (JSONB for flexibility)
	plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
	-- Metadata
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	is_active BOOLEAN DEFAULT TRUE
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	plan_id UUID REFERENCES public.travel_plans(id) ON DELETE CASCADE NOT NULL,
	user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
	category TEXT NOT NULL,
	amount_cny NUMERIC(10, 2) NOT NULL,
	notes TEXT,
	expense_date DATE,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON public.travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON public.travel_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_plan_id ON public.expenses(plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile"
	ON public.user_profiles FOR SELECT
	USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
	ON public.user_profiles FOR UPDATE
	USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
	ON public.user_profiles FOR INSERT
	WITH CHECK (auth.uid() = id);

-- Travel plans policies
CREATE POLICY "Users can view own plans"
	ON public.travel_plans FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
	ON public.travel_plans FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
	ON public.travel_plans FOR UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
	ON public.travel_plans FOR DELETE
	USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses"
	ON public.expenses FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
	ON public.expenses FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
	ON public.expenses FOR UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
	ON public.expenses FOR DELETE
	USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO public.user_profiles (id, email, full_name)
	VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
	RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
	AFTER INSERT ON auth.users
	FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
	BEFORE UPDATE ON public.user_profiles
	FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_plans_updated_at
	BEFORE UPDATE ON public.travel_plans
	FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
	BEFORE UPDATE ON public.expenses
	FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

