import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 13: Asaas Webhook
 * 
 * Configurado no Asaas para receber notificações de pagamentos PIX e Cartão.
 * Atualiza a tabela subscriptions liberando o plano PRO.
 * 
 * INPUTS REQUERIDOS DO FLOW (WEBHOOK payload):
 * - event (string)
 * - payment (object)
 */
export async function main(
  event: string,
  payment: any
) {
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL") as string;
  const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY") as string;
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Caso o evento seja de cancelamento de assinatura
  if (event === "SUBSCRIPTION_DELETED") {
      if (!payment) {
          return { status: "error", reason: "No subscription object received" };
      }
      
      const subscription = payment;
      const user_id = subscription.externalReference;
      const subscriptionId = subscription.id;

      if (!subscriptionId) {
          return { status: "error", reason: "Missing subscription id" };
      }

      // Se tivermos o user_id (externalReference), atualizamos direto. 
      // Caso contrário, buscamos pelo asaas_subscription_id.
      let targetUserId = user_id;
      if (!targetUserId) {
          const { data: subData } = await supabase
              .from("subscriptions")
              .select("user_id")
              .eq("asaas_subscription_id", subscriptionId)
              .maybeSingle();
          if (subData) {
              targetUserId = subData.user_id;
          }
      }

      if (!targetUserId) {
          return { status: "ignored", reason: "Could not map subscription to any user_id" };
      }

      // Atualiza o status no banco de dados para cancelado
      const { error: cancelError } = await supabase
          .from("subscriptions")
          .update({
              status: "canceled",
              plan: "free",
              updated_at: new Date().toISOString()
          })
          .eq("user_id", targetUserId);

      if (cancelError) {
          console.error("Erro ao cancelar assinatura no banco de dados", cancelError);
          throw cancelError;
      }

      return { status: "success", user_id: targetUserId, canceled: true };
  }

  // Apenas nos importamos se o pagamento foi confirmado ou recebido
  if (event !== "PAYMENT_CONFIRMED" && event !== "PAYMENT_RECEIVED") {
      return { status: "ignored", reason: "Event not relevant for activation" };
  }

  if (!payment) {
      return { status: "error", reason: "No payment object received" };
  }

  // externalReference contém o nosso user_id que passamos ao criar a cobrança/cliente
  const user_id = payment.externalReference;
  const subscriptionId = payment.subscription;

  if (!user_id) {
      return { status: "error", reason: "Missing externalReference (user_id)" };
  }

  // Libera 30 dias de acesso a partir de hoje
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  // Upsert na nova tabela subscriptions
  const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
          user_id: user_id,
          plan: "pro", 
          status: "active",
          valid_until: validUntil.toISOString(),
          asaas_subscription_id: subscriptionId || null,
          updated_at: new Date().toISOString()
      });

  if (subError) {
      console.error("Erro ao atualizar Supabase subscriptions", subError);
      throw subError;
  }

  // Registrar na tabela payments
  const amount = payment.value || 14.99;
  const billingType = payment.billingType === 'CREDIT_CARD' ? 'credit_card' : (payment.billingType === 'PIX' ? 'pix' : 'boleto');

  const { error: payError } = await supabase
      .from("payments")
      .insert({
          user_id: user_id,
          amount: amount,
          status: 'completed',
          plan_type: 'monthly',
          payment_method: billingType
      });

  if (payError) {
      console.error("Erro ao registrar pagamento na tabela payments", payError);
      // Não trava a liberação do plano, apenas loga o erro
  }

  return { status: "success", user_id, activated: true };
}
