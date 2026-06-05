-- Migration: Integração de Pagamentos Asaas
-- Fase 7

-- 1. Adicionar ID do Cliente do Asaas na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- 2. Adicionar ID da Assinatura do Asaas na tabela user_entitlements
ALTER TABLE public.user_entitlements
ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;
