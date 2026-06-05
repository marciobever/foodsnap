import * as wmill from "windmill-client";

/**
 * Windmill Script 10: Send Limit Reached Message
 * 
 * Roda quando o estado é LIMIT_REACHED.
 * Envia uma mensagem informando que a cota gratuita acabou e oferece o plano PRO.
 */
export async function main(
  remote_jid: string
) {
  const META_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN");
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID");

  if (!META_TOKEN || !META_PHONE_NUMBER_ID) {
    throw new Error("Missing Meta API variables");
  }

  const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

  const text = "🚨 *Assinatura Inativa!*\n\nPara eu analisar seus pratos e seu corpo, você precisa estar com sua assinatura ativa.\n\n👉 Acesse o seu painel e ative seu plano por apenas R$ 5,00 no primeiro mês:\nhttps://foodsnap.com.br/dashboard";
  
  const res = await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
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

  if (!res.ok) {
      console.error("Erro ao enviar limit_msg", await res.text());
      return { success: false };
  }

  return { success: true };
}
