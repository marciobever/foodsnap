import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 8: Register Ghost User (WhatsApp First)
 *
 * Este script roda quando o state = "AWAITING_NAME".
 * Ele pega o texto digitado (nome) e cria uma conta fantasma.
 */
export async function main(
  sender_number: string,
  remote_jid: string,
  user_name: string
) {
  const META_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN");
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL");
  const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY");
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID");

  if (!META_TOKEN || !SUPABASE_URL || !SUPABASE_KEY || !META_PHONE_NUMBER_ID) {
    throw new Error("Missing variables");
  }

  const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string);
  const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

  async function sendWhatsAppMessage(text: string) {
      await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
          body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: remote_jid,
              type: "text",
              text: { body: text }
          })
      });
  }

  // Nome capturado da mensagem do usuário
  const fullName = (user_name || "").trim() || "Usuário";
  const fakeEmail = `${sender_number}@whatsapp.foodsnap.com.br`;
  const randomPassword = Math.random().toString(36).slice(-10) + "FoodSnap2026!";

  // 1. Criar Auth User via Admin API (Ignora confirmação de email)
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName }
  });

  if (authErr) {
      console.error("Erro ao criar Auth User:", authErr);
      await sendWhatsAppMessage("Desculpe, tivemos um problema ao criar sua conta. Tente novamente mais tarde.");
      return { success: false, error: authErr };
  }

  const userId = authData.user.id;

  // 2. Atualizar o Profile com o Telefone
  // O trigger do Supabase já deve ter criado o profile vazio. Vamos dar update.
  await supabase.from("profiles").update({
      full_name: fullName,
      phone: sender_number,
      coach_personality: 'gordon_ramsay' // Padrão
  }).eq("id", userId);

  // 3. Atualizar o status da conversa para IDLE
  await supabase.from("whatsapp_sessions").update({
      state: "IDLE"
  }).eq("phone_number", sender_number);

  // 4. Enviar mensagem de Boas Vindas
  const welcomeText = `Prontinho, ${fullName}! 🎉\n\nSua conta foi criada.\n\nMas para você continuar usando o seu Personal e Nutri de bolso, você precisa *ativar seu plano por apenas R$ 5,00 no primeiro mês* no nosso painel.\n\n👉 Acesse: https://foodsnap.com.br/dashboard e ative seu plano agora mesmo!`;

  await sendWhatsAppMessage(welcomeText);

  return { success: true, user_id: userId };
}
