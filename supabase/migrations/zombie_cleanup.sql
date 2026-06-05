-- Remoção das tabelas zumbis antigas (Restos do Stripe e de versões anteriores)
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.coach_analyses CASCADE;
DROP TABLE IF EXISTS public.food_analysis_items CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.stripe_customers CASCADE;
DROP TABLE IF EXISTS public.stripe_events CASCADE;
