import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 6: Process Coach Front Image
 * 
 * Acionado quando o state é COACH_FRONT e o usuário envia uma foto.
 * Baixa a imagem, salva no Storage, e envia botões perguntando o objetivo.
 * 
 * INPUTS REQUERIDOS: remote_jid, media_id, user_id, sender_number, conversation_id, temp_data
 */

export async function main(
  remote_jid: string, 
  media_id: string, 
  user_id: string, 
  sender_number: string,
  conversation_id: string,
  temp_data: any
) {
  const META_ACCESS_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN") as string;
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID") as string;
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL") as string;
  const SUPABASE_SERVICE_ROLE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY") as string;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

  // 1. BAIXAR IMAGEM
  const urlRes = await fetch(`${GRAPH_API_URL}/${media_id}`, { headers: { Authorization: `Bearer ${META_ACCESS_TOKEN}` } });
  const { url: mediaUrl } = await urlRes.json();
  const mediaRes = await fetch(mediaUrl, { headers: { Authorization: `Bearer ${META_ACCESS_TOKEN}` }});
  
  const arrayBuffer = await mediaRes.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  // 2. SALVAR NO STORAGE
  const fileName = `${user_id}_front_${Date.now()}.jpg`;
  await supabase.storage.from("coach-uploads").upload(fileName, buffer, { contentType: "image/jpeg" });

  // 3. ATUALIZAR STATE PARA COACH_GOAL
  const new_temp_data = { ...temp_data, front_image: fileName };
  await supabase
      .from("whatsapp_sessions")
      .update({ state: "COACH_GOAL", temp_data: new_temp_data })
      .eq("phone_number", sender_number);

  // 4. ENVIAR BOTÕES INTERATIVOS
  await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_ACCESS_TOKEN}` },
      body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: remote_jid,
          type: "interactive",
          interactive: {
              type: "button",
              body: { text: "📸 Imagem processada com sucesso!\n\nQual o seu objetivo principal?" },
              action: {
                  buttons: [
                      { type: "reply", reply: { id: "goal_hipertrofia", title: "💪 Hipertrofia" } },
                      { type: "reply", reply: { id: "goal_emagrecer", title: "🔥 Emagrecimento" } },
                      { type: "reply", reply: { id: "goal_definicao", title: "📐 Definição" } }
                  ]
              }
          }
      })
  });

  return { success: true, saved_image: fileName };
}
