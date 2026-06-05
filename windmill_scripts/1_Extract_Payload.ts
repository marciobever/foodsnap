import * as wmill from "windmill-client";
/**
 * Windmill Script 1: Extract Payload & Meta Webhook Verification
 * 
 * CONFIGURAÇÃO NO WINDMILL:
 * - Trigger: Webhook (Background execution desativada para a verificação funcionar, ou você pode deixar ativada e usar o schema padrão).
 * - Mapeamento: Ative "Pass all query parameters and body" no Windmill, ou apenas aceite os argumentos abaixo.
 */

export async function main(
  payload: any,
  hub_mode?: string,
  hub_challenge?: string,
  hub_verify_token?: string
) {
  // 1. VERIFICAÇÃO DA META (WEBHOOK SETUP)
  // Quando você cola a URL no painel da Meta, ela envia um GET com esses parâmetros.
  // O Windmill permite retornar uma resposta HTTP customizada usando "_http_response".
  if (hub_mode === "subscribe" && hub_challenge) {
    console.log("[META] Verificando Webhook...");
    return {
      _http_response: {
        status: 200,
        headers: { "Content-Type": "text/plain" },
        body: hub_challenge
      }
    };
  }

  // 2. PROCESSAMENTO DE MENSAGENS (POST)
  if (payload?.object !== "whatsapp_business_account") {
    return { is_valid_message: false, reason: "Not a whatsapp event" };
  }

  const entry = payload.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;
  const statuses = value?.statuses;

  if (!messages || !messages[0]) {
    if (statuses && statuses[0]?.status === "failed") {
      console.error("[META] Erro de entrega:", JSON.stringify(statuses[0].errors));
    }
    return { is_valid_message: false, reason: "Status update, not a message" };
  }

  const msg = messages[0];
  const remote_jid = msg.from;
  const is_image = msg.type === "image";
  const message_id = msg.image?.id || msg.id;
  const media_id = is_image ? msg.image?.id : null;

  let text_message = "";
  let interactive_id = "";

  if (msg.type === "text") text_message = msg.text?.body || "";
  if (msg.type === "button") text_message = msg.button?.text || "";
  
  if (msg.type === "interactive") {
    interactive_id = msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id || "";
    text_message = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || "";
  }

  const sender_number = remote_jid.replace(/\D/g, "");

  console.log(`[EXTRACT] sender=${sender_number}, isImage=${is_image}, text="${text_message}", id="${interactive_id}"`);

  return {
    is_valid_message: true,
    remote_jid,
    sender_number,
    message_id,
    media_id,
    text_message,
    interactive_id,
    is_image
  };
}
