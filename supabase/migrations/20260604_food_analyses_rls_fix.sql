-- ==============================================================================
-- MIGRATION: FOOD ANALYSES RLS FIX
-- Habilita RLS na tabela food_analyses e cria as políticas de acesso corretas
-- para que o painel web (com a anon key do usuário logado) consiga ler o histórico
-- ==============================================================================

-- 1. Garante que o RLS está habilitado na tabela food_analyses
ALTER TABLE public.food_analyses ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own food analyses" ON public.food_analyses;
DROP POLICY IF EXISTS "Service role can insert food analyses" ON public.food_analyses;
DROP POLICY IF EXISTS "Service role can update food analyses" ON public.food_analyses;
DROP POLICY IF EXISTS "Anyone can insert food analyses" ON public.food_analyses;

-- 3. Cria a política de leitura para que o usuário logado possa ver apenas seu histórico
CREATE POLICY "Users can view their own food analyses" 
ON public.food_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Cria a política de inserção (necessário para o bot do Windmill ou webhooks)
CREATE POLICY "Service role can insert food analyses" 
ON public.food_analyses 
FOR INSERT 
WITH CHECK (true);

-- 5. Cria a política de atualização
CREATE POLICY "Service role can update food analyses" 
ON public.food_analyses 
FOR UPDATE 
USING (true);
