-- ==============================================================================
-- MIGRATION: ENRICH DATABASE (OPÇÃO A) - CORRIGIDA
-- Alinha o banco de dados pós-reset com as necessidades do Frontend e dos Bots
-- ==============================================================================

-- 1. Adicionar temp_data em whatsapp_sessions para a máquina de estados do Coach
ALTER TABLE public.whatsapp_sessions ADD COLUMN IF NOT EXISTS temp_data JSONB DEFAULT '{}'::jsonb;

-- 2. Enriquecer a tabela food_analyses
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS total_calories NUMERIC;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS total_protein NUMERIC;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS total_carbs NUMERIC;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS total_fat NUMERIC;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS total_fiber NUMERIC;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS total_sodium_mg NUMERIC;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS nutrition_score INT;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS confidence_level TEXT;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS used_free_quota BOOLEAN DEFAULT false;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS source_message_id TEXT;
ALTER TABLE public.food_analyses ADD COLUMN IF NOT EXISTS ai_structured JSONB;

-- Sincronizar dados das colunas simples para as ricas caso necessário
UPDATE public.food_analyses 
SET total_calories = calories,
    total_protein = protein,
    total_carbs = carbs,
    total_fat = fat,
    nutrition_score = score
WHERE total_calories IS NULL;

-- 3. Enriquecer a tabela coach_assessments com as colunas ausentes
ALTER TABLE public.coach_assessments ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.coach_assessments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
ALTER TABLE public.coach_assessments ADD COLUMN IF NOT EXISTS ai_structured JSONB;
ALTER TABLE public.coach_assessments ADD COLUMN IF NOT EXISTS used_free_quota BOOLEAN DEFAULT false;
ALTER TABLE public.coach_assessments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. Criar VIEW coach_analyses para retrocompatibilidade com códigos legados
CREATE OR REPLACE VIEW public.coach_analyses AS 
SELECT 
    id,
    user_id,
    source,
    image_url,
    ai_raw_response,
    ai_structured,
    biotype,
    estimated_body_fat,
    muscle_mass_level,
    goal_suggestion,
    used_free_quota,
    created_at,
    updated_at
FROM public.coach_assessments;

-- 5. Criar VIEW user_entitlements para retrocompatibilidade com validações antigas
CREATE OR REPLACE VIEW public.user_entitlements AS
SELECT 
    user_id,
    plan AS entitlement_code,
    (status = 'trialing') AS is_trial,
    (status = 'active' OR status = 'trialing') AS is_active,
    valid_until,
    '{}'::jsonb AS usage,
    created_at,
    updated_at,
    plan AS plan_type
FROM public.subscriptions;
