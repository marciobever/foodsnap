-- Create table for Coach AI analyses
create table if not exists public.coach_analyses (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    created_at timestamptz default now(),
    
    -- Metadata
    source text default 'whatsapp', -- 'web', 'whatsapp'
    image_url text,
    
    -- AI Data
    ai_raw_response text,
    ai_structured jsonb, -- Full JSON response
    
    -- Structured Fields for Analytics
    biotype text,             -- 'Ectomorph', 'Mesomorph', 'Endomorph'
    estimated_body_fat numeric,
    muscle_mass_level text,   -- 'Low', 'Medium', 'High'
    goal_suggestion text,     -- 'Cut', 'Bulk', 'Recomp'
    
    -- Plan Usage
    used_free_quota boolean default false
);

-- Enable RLS
alter table public.coach_analyses enable row level security;

-- Policies
create policy "Users can view their own coach analyses"
    on public.coach_analyses for select
    using (auth.uid() = user_id);

create policy "Service role insert coach analyses"
    on public.coach_analyses for insert
    with check (true);

create policy "Service role updates"
    on public.coach_analyses for update
    using (true);
