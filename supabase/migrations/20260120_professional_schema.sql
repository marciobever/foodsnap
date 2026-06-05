-- =============================================
-- MIGRATION: PROFESSIONAL SAAS MODULE
-- Description: Creates tables for Professionals, Students, Assessments, and Workouts.
-- =============================================

-- 1. PROFESSIONALS TABLE (Extends Profile for Pro Users)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT,
    cref_crn TEXT, -- License number
    bio TEXT,
    specialties TEXT[],
    logo_url TEXT,
    primary_color TEXT DEFAULT '#059669', -- Brand Color
    
    contacts JSONB DEFAULT '{}'::jsonb, -- { "whatsapp": "...", "instagram": "..." }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Policies for Professionals
CREATE POLICY "Professionals can view/edit own profile" 
ON public.professionals 
FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view professionals (optional, for directory)" 
ON public.professionals 
FOR SELECT 
USING (true);


-- 2. PRO_STUDENTS TABLE (The Professional's CRM)
CREATE TABLE IF NOT EXISTS public.pro_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    -- Optional: Link to a real app user if they convert
    linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    goals TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pro_students ENABLE ROW LEVEL SECURITY;

-- Policies for Pro Students
CREATE POLICY "Professionals can manage own students" 
ON public.pro_students 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Students can view their own record" 
ON public.pro_students 
FOR SELECT 
USING (auth.uid() = linked_user_id);


-- 3. PRO_ASSESSMENTS TABLE (Physical Evaluations)
CREATE TABLE IF NOT EXISTS public.pro_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.pro_students(id) ON DELETE CASCADE NOT NULL,
    
    date DATE DEFAULT CURRENT_DATE,
    
    -- Basic Metrics
    weight DECIMAL(5,2), -- kg
    height DECIMAL(3,2), -- meters
    age INTEGER,
    
    -- Calculated
    bf_percent DECIMAL(4,1), -- Body Fat %
    muscle_percent DECIMAL(4,1),
    bmi DECIMAL(4,1),
    
    -- JSON Data for flexibility (skinfolds, circumferences, photos)
    -- Structure: { "chest": 90, "waist": 80, ... }
    measurements JSONB DEFAULT '{}'::jsonb, 
    
    -- Structure: { "method": "pollock7", "folds": { ... } }
    methodology JSONB DEFAULT '{}'::jsonb,
    
    -- Structure: ["url1", "url2"]
    photos TEXT[], 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pro_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for Assessments
CREATE POLICY "Professionals can manage assessments" 
ON public.pro_assessments 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Students can view their own assessments" 
ON public.pro_assessments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.pro_students 
        WHERE id = pro_assessments.student_id 
        AND linked_user_id = auth.uid()
    )
);


-- 4. PRO_WORKOUTS TABLE (Workout Library)
CREATE TABLE IF NOT EXISTS public.pro_workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Structure: [{ "name": "Supino", "sets": 3, "reps": "10-12", "video": "..." }]
    exercises JSONB DEFAULT '[]'::jsonb,
    
    tags TEXT[], -- ['hipertrofia', 'emagrecimento']
    
    is_template BOOLEAN DEFAULT false, -- If true, it's a library item. If false, assigned to a specific student? 
    -- Actually, let's keep it simple: Workouts are templates or assigned.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pro_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage own workouts" 
ON public.pro_workouts 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);


-- 5. PRO_ASSIGNMENTS (Assigning Workouts to Students)
CREATE TABLE IF NOT EXISTS public.pro_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.pro_students(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES public.pro_workouts(id) ON DELETE CASCADE NOT NULL,
    
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pro_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage assignments" 
ON public.pro_assignments 
FOR ALL 
USING (auth.uid() = professional_id) 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Students can view their assignments" 
ON public.pro_assignments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.pro_students 
        WHERE id = pro_assignments.student_id 
        AND linked_user_id = auth.uid()
    )
);
