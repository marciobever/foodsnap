import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 9: Ask User Name
 * 
 * Roda quando o estado é ASK_NAME.
 * Envia a mensagem de boas-vindas pedindo o nome e muda o status para AWAITING_NAME.
 */
export async function main(
  sender_number: string,
  remote_jid: string
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

  // 1. Atualizar state para IDLE (reset)
  await supabase
      .from("whatsapp_sessions")
      .update({ state: "IDLE" })
      .eq("phone_number", sender_number);

  // 2. Avisar que precisa criar a conta no site
  const text = "👋 Olá! Vi que você ainda não tem uma conta no FoodSnap.\n\nPara eu começar a analisar seus pratos e seu corpo com a nossa IA, você precisa criar sua conta no nosso site e ativar seu plano por apenas *R$ 5,00 no primeiro mês*!\n\n👉 Acesse agora: https://foodsnap.com.br\n\n*(Depois de criar a conta, é só voltar aqui e me mandar um Oi!)*";
  
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

  return { success: true, new_state: "IDLE" };
}
