import * as wmill from "windmill-client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 7: Generate Coach Plan
 * 
 * Executa a IA pesada do Titan Coach, gera o PDF via n8n e entrega no WhatsApp.
 */

const COACH_SYSTEM_PROMPT = `Você é o "Titan Coach", um treinador olímpico de elite e nutricionista esportivo PhD.
Sua missão é analisar o físico de um usuário e criar um **Protocolo de Transformação** completo.
RETORNE APENAS JSON. NÃO use Markdown.`;

function buildCoachPdfHtml(plan: any): string {
  // Código simplificado para caber no arquivo único, você pode colar seu template.ts original aqui.
  return `<html><body><h1>Protocolo Titan</h1><p>Biótipo: ${plan.analysis?.somatotype}</p></body></html>`;
}

export async function main(
  remote_jid: string, 
  interactive_id: string, 
  text_message: string,
  user_id: string, 
  sender_number: string,
  conversation_id: string,
  temp_data: any
) {
  const META_ACCESS_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN") as string;
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID") as string;
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL") as string;
  const SUPABASE_SERVICE_ROLE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY") as string;
  const GEMINI_API_KEY = await wmill.getVariable("u/bevervansomarcio/GEMINI_API_KEY") as string;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

  async function sendWhatsAppMessage(text: string) {
      await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_ACCESS_TOKEN}` },
          body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: remote_jid, type: "text", text: { body: text }})
      });
  }

  // 1. DEFINIR OBJETIVO
  let goal = "Hipertrofia";
  if (interactive_id === "goal_emagrecer") goal = "Emagrecimento";
  else if (interactive_id === "goal_definicao") goal = "Definição";

  await sendWhatsAppMessage("🤖 Analisando seu físico e processando a estratégia nutricional...\n(Isso leva uns 10 segundos).");

  // 2. RECUPERAR IMAGEM DO STORAGE
  const { data: blob } = await supabase.storage.from("coach-uploads").download(temp_data.front_image);
  let base64 = "";
  if (blob) {
      const buffer = await blob.arrayBuffer();
      base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  // 3. CHAMAR GEMINI
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const result = await model.generateContent({
      contents: [{ role: "user", parts: [
          { text: COACH_SYSTEM_PROMPT },
          { text: `Objetivo: ${goal}` },
          { inlineData: { mimeType: "image/jpeg", data: base64 } }
      ]}],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
  });

  const plan = JSON.parse(result.response.text());

  // 4. MENSAGEM LUXO (WHATSAPP)
  const lines: string[] = [];
  lines.push("📱 *SEU PROTOCOLO TITAN*");
  lines.push("");
  lines.push(`🧬 *BIÓTIPO*: ${plan.analysis?.somatotype}`);
  lines.push(`🎯 *FOCO*: ${plan.workout?.focus}`);
  lines.push("");
  lines.push("🏋️ *TREINO*");
  lines.push(`▪ Divisão ${plan.workout?.split} (${plan.workout?.frequency_days}x/semana)`);
  lines.push("");
  lines.push("🥗 *DIETA*");
  lines.push(`▪ ${plan.diet?.total_calories} kcal (P: ${plan.diet?.macros?.protein_g}g)`);
  lines.push("");
  lines.push(`💡 _DICA:_ ${plan.motivation_quote}`);
  
  await sendWhatsAppMessage(lines.join('\n'));

  // 5. GERAÇÃO DO PDF (Gotenberg/n8n)
  try {
      const pdfFileName = `FoodSnap_Titan_${Date.now()}`;
      const pdfHtml = buildCoachPdfHtml(plan); // Em produção, usar seu template original aqui
      
      // Chamada para sua edge/webhook do N8N
      const pdfResponse = await fetch("https://n8n.seureview.com.br/webhook/pdf-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: pdfHtml, file_name: pdfFileName })
      });

      if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.arrayBuffer();
          const storagePath = `${user_id}/${pdfFileName}.pdf`;
          await supabase.storage.from("coach-pdfs").upload(storagePath, new Uint8Array(pdfBlob), { contentType: "application/pdf" });
          
          const { data: urlData } = await supabase.storage.from("coach-pdfs").createSignedUrl(storagePath, 3600);
          
          if (urlData?.signedUrl) {
              await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_ACCESS_TOKEN}` },
                  body: JSON.stringify({
                      messaging_product: "whatsapp", recipient_type: "individual", to: remote_jid,
                      type: "document", document: { link: urlData.signedUrl, filename: `${pdfFileName}.pdf`, caption: "📄 Seu Protocolo Titan em PDF!" }
                  })
              });
          }
      }
  } catch(e) { console.error("PDF Error", e); }

  // 6. SALVAR NO DB E RESETAR STATE
  await supabase.from("coach_assessments").insert({
      user_id: user_id,
      source: "whatsapp",
      goal_suggestion: goal,
      biotype: plan.analysis?.somatotype || null,
      estimated_body_fat: parseFloat(String(plan.analysis?.body_fat_percentage || 0)) || 0,
      muscle_mass_level: plan.analysis?.muscle_mass_level || null,
      workout_plan: typeof plan.workout === 'string' ? plan.workout : JSON.stringify(plan.workout),
      diet_plan: typeof plan.diet === 'string' ? plan.diet : JSON.stringify(plan.diet),
      ai_raw_response: result.response.text(),
      ai_structured: plan
  });

  await supabase.from("whatsapp_sessions").update({ state: "IDLE", temp_data: {} }).eq("phone_number", sender_number);

  return { success: true };
}
