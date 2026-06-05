-- Migration: Create Coach Assessments table
CREATE TABLE IF NOT EXISTS public.coach_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    biotype TEXT,
    estimated_body_fat NUMERIC,
    muscle_mass_level TEXT,
    goal_suggestion TEXT,
    workout_plan TEXT,
    diet_plan TEXT,
    ai_raw_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coach_assessments ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own assessments
CREATE POLICY "Users can view their own assessments" 
ON public.coach_assessments 
FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert (from Windmill)
CREATE POLICY "Service role can insert" 
ON public.coach_assessments 
FOR INSERT WITH CHECK (true);

-- Allow service role to update
CREATE POLICY "Service role can update" 
ON public.coach_assessments 
FOR UPDATE USING (true);
