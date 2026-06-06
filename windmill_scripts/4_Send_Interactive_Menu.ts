import * as wmill from "windmill-client";
/**
 * Windmill Script 4: Send Interactive Menu
 * 
 * Se o usuário mandar texto no estado IDLE (e não for uma foto de comida),
 * nós respondemos com um menu interativo nativo do WhatsApp, sem textão.
 * 
 * INPUTS REQUERIDOS DO FLOW:
 * - remote_jid (string)
 * 
 * VARIABLES DO WINDMILL REQUERIDAS:
 * - META_ACCESS_TOKEN
 * - META_PHONE_NUMBER_ID
 */

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
          // Atualiza o state no banco se for action_coach ou action_food
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

  // 2. Se não for click (for um "Oi" ou texto solto), envia o Menu
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
          footer: { text: "Toque em uma opção 👇" },
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
