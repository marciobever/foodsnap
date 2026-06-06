import * as wmill from "windmill-client";
/**
 * Windmill Script 4: Send Interactive Menu
 *
 * Menu interativo do WhatsApp. O corpo é a saudação limpa; o resumo do dia
 * (kcal/proteína de hoje) aparece de forma discreta no RODAPÉ, se o usuário
 * tiver conta e refeições registradas.
 */

function generatePhoneCandidates(raw: string): string[] {
  if (!raw) return [];
  const candidates: string[] = [];
  const num = raw.replace(/\D/g, "");
  if (!num) return candidates;
  candidates.push(num);
  const withoutDDI = num.startsWith("55") ? num.slice(2) : num;
  if (withoutDDI !== num) candidates.push(withoutDDI);
  if (!num.startsWith("55")) candidates.push("55" + num);
  const ddd = withoutDDI.slice(0, 2);
  const rest = withoutDDI.slice(2);
  if (rest.length === 8) { const w = ddd + "9" + rest; candidates.push(w); candidates.push("55" + w); }
  if (rest.length === 9 && rest.startsWith("9")) { const w = ddd + rest.slice(1); candidates.push(w); candidates.push("55" + w); }
  return [...new Set(candidates)];
}

export async function main(remote_jid: string, interactive_id?: string) {
  const META_ACCESS_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN") as string;
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID") as string;
  const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

  const url = `${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`;

  async function sendWhatsAppMessage(payload: any) {
      const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_ACCESS_TOKEN}` },
          body: JSON.stringify(payload)
      });
      if (!res.ok) console.error("Falha ao enviar msg", await res.text());
  }

  // 1. Tratar Clicks nos Botões
  if (interactive_id) {
      let replyText = "";
      let newState = "";

      if (interactive_id === "action_food") {
          replyText = "🥗 *Para iniciar, me envie uma foto do seu prato de comida!*";
          newState = "IDLE";
      } else if (interactive_id === "action_coach") {
          replyText = "🏋️ *Para gerar sua Dieta e Treino personalizados, me envie uma foto do seu corpo inteiro (de preferência de frente, com roupa de treino).*";
          newState = "AWAITING_BODY_PHOTO";
      } else if (interactive_id === "action_dashboard") {
          replyText = "📊 *Acesse o seu Dashboard Completo aqui:*\n👉 https://foodsnap.com.br";
      }

      if (replyText) {
          if (newState) {
              const { createClient } = require('@supabase/supabase-js');
              const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL");
              const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY");
              const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

              await supabase
                  .from("whatsapp_sessions")
                  .update({ state: newState })
                  .eq("phone_number", remote_jid.replace(/\D/g, ""));
          }

          await sendWhatsAppMessage({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: remote_jid,
              type: "text",
              text: { body: replyText }
          });
          return { success: true, handled_click: true, new_state: newState };
      }
  }

  // 2. Resumo do dia (rodapé discreto, se tiver conta + refeições hoje)
  let resumoFooter = "";
  try {
      const { createClient } = require('@supabase/supabase-js');
      const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL");
      const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const cands = generatePhoneCandidates(remote_jid.replace(/\D/g, ""));
      let uid: string | null = null;
      for (const c of cands) {
          const { data } = await supabase.from("profiles").select("id").eq("phone", c).maybeSingle();
          if (data) { uid = data.id; break; }
      }
      if (uid) {
          const startBR = new Date(Date.now() - 3 * 60 * 60 * 1000);
          startBR.setUTCHours(3, 0, 0, 0);
          const { data: rows } = await supabase
              .from("food_analyses")
              .select("total_calories, total_protein, calories, protein")
              .eq("user_id", uid)
              .gte("created_at", startBR.toISOString());
          if ((rows || []).length) {
              let k = 0, p = 0;
              for (const r of rows) { k += Number((r as any).total_calories ?? (r as any).calories ?? 0); p += Number((r as any).total_protein ?? (r as any).protein ?? 0); }
              resumoFooter = `📊 Hoje: ${Math.round(k)} kcal · ${Math.round(p)}g proteína`;
          }
      }
  } catch (e) {
      console.error("Resumo do menu falhou:", e);
  }

  // 3. Enviar o Menu
  const MENU_BANNER_URL = "https://mnhgpnqkwuqzpvfrwftp.supabase.co/storage/v1/object/public/consultas/assets/menu_banner.png";

  const menuPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: remote_jid,
      type: "interactive",
      interactive: {
          type: "button",
          header: { type: "image", image: { link: MENU_BANNER_URL } },
          body: { text: "Oi! 👋 Eu sou o *FoodSnap*, seu nutricionista e personal de bolso.\n\n🥗 Mande a *foto de um prato* que eu analiso as calorias e macros.\n🏋️ Ou crie sua *dieta e treino* personalizados.\n\nO que você quer fazer agora?" },
          footer: { text: resumoFooter || "Toque em uma opção 👇" },
          action: {
              buttons: [
                  { type: "reply", reply: { id: "action_food", title: "🥗 Avaliar Prato" } },
                  { type: "reply", reply: { id: "action_coach", title: "🏋️ Dieta e Treino" } },
                  { type: "reply", reply: { id: "action_dashboard", title: "📊 Meu Painel" } }
              ]
          }
      }
  };

  await sendWhatsAppMessage(menuPayload);
  return { success: true, menu_sent: true };
}
