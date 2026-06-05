-- 1. Garante que o RLS está habilitado na tabela principal
ALTER TABLE public.coach_assessments ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.coach_assessments;
DROP POLICY IF EXISTS "Service role can insert" ON public.coach_assessments;
DROP POLICY IF EXISTS "Service role can update" ON public.coach_assessments;

-- 3. Cria a política de leitura para que o usuário logado possa ver apenas suas próprias avaliações
CREATE POLICY "Users can view their own assessments" 
ON public.coach_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Cria a política para inserção (necessário para o bot do Windmill inserir)
CREATE POLICY "Service role can insert" 
ON public.coach_assessments 
FOR INSERT 
WITH CHECK (true);

-- 5. Cria a política para atualização
CREATE POLICY "Service role can update" 
ON public.coach_assessments 
FOR UPDATE 
USING (true);

-- 6. Recria a VIEW de retrocompatibilidade com 'security_invoker = true' 
-- Isso garante que qualquer consulta à VIEW também respeite as políticas de RLS da tabela original.
CREATE OR REPLACE VIEW public.coach_analyses 
WITH (security_invoker = true) 
AS 
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
