-- ==============================================================================
-- O GRANDE RESET (FASE 8)
-- Atenção: Isso apaga todos os dados do projeto para recriar a arquitetura limpa
-- ==============================================================================

-- 1. Destruição Limpa (Cuidado!)
DROP TABLE IF EXISTS public.coach_assessments CASCADE;
DROP TABLE IF EXISTS public.food_analyses CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE; -- resquício antigo
DROP TABLE IF EXISTS public.whatsapp_sessions CASCADE;
DROP TABLE IF EXISTS public.whatsapp_conversations CASCADE; -- resquício antigo
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_entitlements CASCADE; -- resquício antigo
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpar todos os usuários de autenticação para zerar de verdade
DELETE FROM auth.users;

-- ==============================================================================
-- 2. Criação das Tabelas Otimizadas
-- ==============================================================================

-- Tabela: profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    phone TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    is_admin BOOLEAN DEFAULT false,
    coach_personality TEXT DEFAULT 'gordon_ramsay',
    asaas_customer_id TEXT
);

-- Tabela: subscriptions (Substitui user_entitlements)
CREATE TABLE public.subscriptions (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    plan TEXT DEFAULT 'free', -- 'free' ou 'pro'
    status TEXT DEFAULT 'inactive', -- 'active', 'trialing', 'past_due', 'canceled'
    valid_until TIMESTAMPTZ,
    asaas_subscription_id TEXT
);

-- Tabela: whatsapp_sessions (Substitui whatsapp_conversations)
CREATE TABLE public.whatsapp_sessions (
    phone_number TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    state TEXT DEFAULT 'IDLE'
);

-- Tabela: food_analyses
CREATE TABLE public.food_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    food_name TEXT,
    calories INT,
    protein INT,
    carbs INT,
    fat INT,
    score INT,
    ai_raw_response TEXT,
    image_url TEXT
);

-- Tabela: coach_assessments
CREATE TABLE public.coach_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    biotype TEXT,
    estimated_body_fat INT,
    muscle_mass_level TEXT,
    goal_suggestion TEXT,
    workout_plan TEXT,
    diet_plan TEXT,
    ai_raw_response TEXT
);

-- ==============================================================================
-- 3. Triggers Automáticas
-- ==============================================================================

-- Atualizar o trigger de perfil para também já criar o registro em subscriptions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'phone', new.email, new.raw_user_meta_data->>'full_name');

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'free', 'inactive');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para auto-atualizar o updated_at na tabela whatsapp_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_sessions_modtime
BEFORE UPDATE ON whatsapp_sessions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
