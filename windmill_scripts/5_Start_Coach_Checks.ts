import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 5: Start Coach & Checks
 * 
 * Este script é acionado quando o usuário clica em "Titan Coach" no menu,
 * ou quando digita "coach". Ele checa os limites de uso e pede a foto.
 * 
 * INPUTS REQUERIDOS DO FLOW:
 * - remote_jid (string)
 * - user_id (string)
 * - sender_number (string)
 */

export async function main(remote_jid: string, user_id: string, sender_number: string) {
  const META_ACCESS_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN") as string;
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID") as string;
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL") as string;
  const SUPABASE_SERVICE_ROLE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY") as string;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

  async function sendWhatsAppMessage(text: string) {
      await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_ACCESS_TOKEN}` },
          body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: remote_jid,
              type: "text",
              text: { body: text }
          })
      });
  }

  // 1. CHECAGEM DE LIMITES (1 Free Trial)
  const { count: coachUsed } = await supabase
      .from("coach_assessments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id);

  if ((coachUsed || 0) >= 1) {
      const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user_id)
          .maybeSingle();

      const isPaid = sub && sub.status === "active";

      if (!isPaid) {
          // Send CTA Message (Stripe Checkout via dashboard)
          await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_ACCESS_TOKEN}` },
              body: JSON.stringify({
                  messaging_product: "whatsapp",
                  recipient_type: "individual",
                  to: remote_jid,
                  type: "interactive",
                  interactive: {
                      type: "cta_url",
                      body: { text: "🔒 *A avaliação do Coach IA é um recurso do Plano PRO.*\n\nAssine por apenas R$ 5,00 no primeiro mês e desbloqueie avaliações de biotipo, treinos e cardápios completos! 🚀" },
                      footer: { text: "FoodSnap PRO" },
                      action: { name: "cta_url", parameters: { display_text: "⭐ Assinar por R$ 5", url: "https://foodsnap.com.br/dashboard" } }
                  }
              })
          });
          return { success: false, reason: "limit_reached" };
      }

      // 1.2 Checar Limite de Frequência do Coach (Uma avaliação a cada 3 dias - 72h)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: recentCoach } = await supabase
          .from("coach_assessments")
          .select("created_at")
          .eq("user_id", user_id)
          .gte("created_at", threeDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (recentCoach) {
          const createdDate = new Date(recentCoach.created_at);
          const nextAvailableDate = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
          
          const formattedDate = nextAvailableDate.toLocaleDateString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
          });

          await sendWhatsAppMessage(`🚨 *Limite de Avaliações!* 🚨\n\nVocê já gerou um Protocolo Titan recentemente. Para que você tenha tempo de aplicar as orientações e ver progresso, permitimos *uma nova avaliação a cada 3 dias*.\n\nSua próxima avaliação estará disponível em:\n📅 *${formattedDate}*`);
          return { success: false, reason: "coach_rate_limit" };
      }
  }

  // 2. ATUALIZAR ESTADO PARA COACH_FRONT
  await supabase
      .from("whatsapp_sessions")
      .update({ state: "COACH_FRONT", temp_data: {} })
      .eq("phone_number", sender_number);

  // 3. ENVIAR INSTRUÇÕES
  await sendWhatsAppMessage("🤖 *Coach IA Ativado!*\n\nVou analisar sua composição corporal e montar um protocolo *Titan 100% personalizado*.");
  
  await new Promise(r => setTimeout(r, 1000));

  await sendWhatsAppMessage("📸 *ENVIE SUA FOTO*\n\nTire uma selfie no espelho ou foto de frente do seu corpo.\n\n✅ Boa iluminação\n✅ Sem camisa (homens) ou de Top/Regata (mulheres)");

  return { success: true };
}
