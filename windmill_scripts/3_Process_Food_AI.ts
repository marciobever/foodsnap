//nobundling
import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 3: Process Food Image with OpenAI
 */
export async function main(
  sender_number: string,
  remote_jid: string,
  message_id: string,
  media_id: string,
  coach_personality: string = "gordon_ramsay"
) {
  const META_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN");
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL");
  const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY");
  const OPENAI_API_KEY = await wmill.getVariable("u/bevervansomarcio/OPENAI_API_KEY");
  const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID");

  if (!META_TOKEN || !SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY || !META_PHONE_NUMBER_ID) {
    throw new Error("Missing required environment variables.");
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

  async function sendWhatsAppImage(imageUrl: string, caption?: string) {
      const payload: any = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: remote_jid,
          type: "image",
          image: {
              link: imageUrl
          }
      };
      if (caption) {
          payload.image.caption = caption;
      }
      const res = await fetch(`${GRAPH_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
          body: JSON.stringify(payload)
      });
      console.log("Send image response status:", res.status);
  }


  // 1. Identificar Usuário e Checar Paywall (Novo Sistema)
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

    // Adiciona 9º dígito se tem 8 dígitos após DDD
    if (rest.length === 8) {
        const with9 = ddd + "9" + rest;
        candidates.push(with9);
        candidates.push("55" + with9);
    }

    // Remove 9º dígito se tem 9 dígitos após DDD
    if (rest.length === 9 && rest.startsWith("9")) {
        const without9 = ddd + rest.slice(1);
        candidates.push(without9);
        candidates.push("55" + without9);
    }

    return [...new Set(candidates)];
  }

  const phoneCandidates = generatePhoneCandidates(sender_number);
  let user: any = null;
  for (const candidate of phoneCandidates) {
      const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone", candidate)
          .maybeSingle();

      if (data) {
          user = data;
          break;
      }
  }

  if (!user) {
      await sendWhatsAppMessage("⚠️ Conta não encontrada. Por favor, registre-se no site primeiro.");
      return { success: false, error: "User not found" };
  }

  const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

  if (!sub || sub.status !== "active") {
      await sendWhatsAppMessage("🚨 *Assinatura Inativa!*\n\nPara eu analisar seus pratos e seu corpo, você precisa estar com sua assinatura ativa.\n\n👉 Acesse o seu painel e ative seu plano por apenas R$ 5,00 no primeiro mês:\nhttps://foodsnap.com.br/dashboard");
      return { success: false, error: "Limit reached" };
  }

  // 1.2 Checar Limite Diário de Verificações de Prato (Máximo 5 por dia no horário de Brasília)
  const now = new Date();
  const startOfTodayBrazil = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  startOfTodayBrazil.setUTCHours(3, 0, 0, 0);

  const { count: dailyScansCount } = await supabase
      .from("food_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfTodayBrazil.toISOString());

  if (dailyScansCount !== null && dailyScansCount >= 5) {
      await sendWhatsAppMessage("🚨 *Limite Diário Atingido!*\n\nVocê já realizou as *5 verificações de prato* permitidas hoje. Volte amanhã para continuar acompanhando sua alimentação! 🍽️");
      return { success: false, error: "Daily limit reached" };
  }

  // Enviar feedback imediato de carregamento para evitar que o bot fique mudo
  await sendWhatsAppMessage("⏳ *Analisando o seu prato...* (Isso pode levar alguns segundos).");

  console.log(`Baixando mídia ${media_id}...`);
  const mediaUrlRes = await fetch(`https://graph.facebook.com/v19.0/${media_id}`, {
    headers: { "Authorization": `Bearer ${META_TOKEN}` }
  });
  const mediaUrlData = await mediaUrlRes.json();
  if (!mediaUrlData.url) throw new Error("Falha ao obter URL da imagem.");

  const imageRes = await fetch(mediaUrlData.url, { headers: { "Authorization": `Bearer ${META_TOKEN}` } });
  const arrayBuffer = await imageRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString('base64');
  const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

  // 2. Personalidades
  let personalityInstruction = "";
  switch (coach_personality) {
      case "gordon_ramsay":
          personalityInstruction = "Personalidade do Cheff Titã. Seja extremamente rigoroso, dê broncas pesadas, faça piadas ácidas e seja sarcástico se a comida for ruim.";
          break;
      case "vovo":
          personalityInstruction = "Personalidade de uma Vovó Carinhosa. Seja muito gentil, chame de 'meu neto(a)', encha de elogios, seja doce e reconfortante.";
          break;
      case "cientifico":
          personalityInstruction = "Personalidade do Dr. Científico Frio. Zero brincadeiras. Seja educado, mas use muitos termos técnicos focando na ciência e nos dados.";
          break;
      case "militar":
          personalityInstruction = "Personalidade de um Sargento do Exército. Grite muito, chame de 'recruta', foque na disciplina extrema, não aceite desculpas.";
          break;
      case "maromba":
          personalityInstruction = "Personalidade do Parceiro Maromba. Use gírias de academia ('monstro', 'bora crescer!', 'tá bombando'), seja extremamente animado e energético, foque em proteína e hipertrofia, faça comentários bem-humorados sobre a dieta do atleta.";
          break;
      case "nutri_gentil":
          personalityInstruction = "Personalidade da Nutri Empática. Seja acolhedora, positiva e sem julgamentos. Foque no bem-estar e equilíbrio, evite extremismos, elogie as boas escolhas e sugira melhorias de forma suave e encorajadora.";
          break;
      case "ironico":
          personalityInstruction = "Personalidade do Robô Sarcástico. Use humor ácido e comentários irônicos inteligentes sobre a dieta. Seja engraçado mas informativo, faça observações perspicazes com uma pitada de cinismo bem-humorado.";
          break;
      default:
          personalityInstruction = "Personalidade do Cheff Titã. Seja rigoroso e ácido.";
  }

  const promptSystem = `Você é um Analista Nutricional e Coach Esportivo.
Sua tarefa é analisar a FOTO do prato e retornar EXATAMENTE um JSON, sem blocos de código ou markdown em volta.

COMPORTAMENTO DO COACH (MUITO IMPORTANTE):
${personalityInstruction}
Fale ESTRITAMENTE em Português do Brasil.

REGRAS NUTRICIONAIS:
1. Avalie com extremo cuidado o TAMANHO DA PORÇÃO. Observe atentamente a proporção dos alimentos em relação ao prato, talheres e o espaço vazio ao redor.
2. Se o prato contiver pouquíssima comida, restos ou porções minúsculas (por exemplo, apenas alguns pedaços isolados de macarrão ou carne em um prato quase limpo/vazio), estime o peso real como baixíssimo (ex: 30g-80g total) e calcule as calorias e macros de forma proporcionalmente baixa (ex: 80kcal a 150kcal no total). Não assuma uma porção padrão/completa de restaurante se o prato estiver vazio ou com apenas restos!
3. Não exagere nas calorias! Calcule com precisão cirúrgica de acordo com o que é visível na foto.
4. caso o prato possua alimentos menos saudáveis (industrializados, frituras, excesso de açúcar ou sódio), sugira alternativas mais saudáveis de forma construtiva e prática no campo "swap_suggestions". Se o prato já for excelente, retorne o array vazio.
5. O campo "score" deve ser uma nota inteira de 1 a 10 avaliando a qualidade nutricional (onde 8+ é excelente/nutritivo, 5-7 é intermediário/aceitável, e 1-4 é pouco saudável/processado ou muito desbalanceado/restos).
6. No objeto "goal_fit", as notas de 1 a 10 devem ser muito precisas:
   - "emagrecer": notas altas se a densidade calórica for baixa e houver boa proteína/fibras; notas baixas para pratos calóricos, gordurosos ou ricos em carboidratos simples.
   - "ganhar_massa": notas altas se houver boa quantidade de proteína e carboidratos de qualidade.
   - "manter": baseado no equilíbrio geral de macronutrientes do prato.
7. Retorne apenas o JSON puro.

Formato OBRIGATÓRIO:
{
  "food_name": "Nome resumido do prato",
  "calories": 250,
  "protein": 25,
  "carbs": 20,
  "fat": 8,
  "fiber": 4,
  "sodium": 320,
  "score": 7,
  "meal_type": "almoço",
  "cuisine_origin": "brasileira",
  "estimated_weight_g": 180,
  "satiety_index": "médio" | "alto" | "baixo",
  "glycemic_index": "médio" | "alto" | "baixo",
  "energy_duration_minutes": 90,
  "goal_fit": {
    "emagrecer": 5,
    "ganhar_massa": 8,
    "manter": 7
  },
  "alerts": ["⚠️ Alto teor de sódio", "⚠️ Baixa quantidade de vegetais"],
  "coach_humor": "Comentário baseado na personalidade.",
  "swap_suggestions": ["Substituição 1", "Substituição 2"],
  "is_food": true
}`;

  try {
    const openaiUrl = "https://api.openai.com/v1/chat/completions";
    
    const aiResponse = await fetch(openaiUrl, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: promptSystem
                },
                {
                    role: "user",
                    content: [
                        { 
                            type: "image_url", 
                            image_url: { 
                                url: `data:${mimeType};base64,${base64Image}`,
                                detail: "high"
                            } 
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0
        })
    });

    const aiData = await aiResponse.json();
    let aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) throw new Error("Sem resposta válida da OpenAI.");

    const foodData = JSON.parse(aiContent);
    console.log("JSON da OpenAI:", foodData);

    if (!foodData.is_food) {
        const replyMsg = `⚠️ *Isto não parece comida!* \n\n🗣️ *Coach diz:* "${foodData.coach_humor}"`;
        await sendWhatsAppMessage(replyMsg);
        return { success: false, error: "Not food" };
    }

    let replyMessage = `🍽️ *Prato Identificado:* ${foodData.food_name}\n` +
                         `⚖️ *Peso Estimado:* ${foodData.estimated_weight_g || 0}g\n\n` +
                         `🔥 *Calorias:* ${foodData.calories} kcal\n` +
                         `🍗 *Proteína:* ${foodData.protein}g\n` +
                         `🍞 *Carboidratos:* ${foodData.carbs}g (IG: ${foodData.glycemic_index || "médio"})\n` +
                         `🥑 *Gordura:* ${foodData.fat}g\n` +
                         `🌾 *Fibras:* ${foodData.fiber || 0}g\n` +
                         `🧂 *Sódio:* ${foodData.sodium || 0}mg\n\n` +
                         `📊 *Índice de Saciedade:* ${foodData.satiety_index || "médio"}\n` +
                         `⚡ *Duração da Energia:* ~${foodData.energy_duration_minutes || 90} min\n\n` +
                         `🎯 *Adequação por Objetivo:*\n` +
                         `▪️ Emagrecimento: ${foodData.goal_fit?.emagrecer || 0}/10\n` +
                         `▪️ Ganho de Massa: ${foodData.goal_fit?.ganhar_massa || 0}/10\n` +
                         `▪️ Manutenção: ${foodData.goal_fit?.manter || 0}/10\n\n`;

    if (foodData.alerts && foodData.alerts.length > 0) {
        replyMessage += `⚠️ *Alertas da Refeição:*\n` +
                        foodData.alerts.map((a: string) => `▪️ ${a}`).join('\n') + `\n\n`;
    }

    if (foodData.swap_suggestions && foodData.swap_suggestions.length > 0) {
        replyMessage += `🔄 *Substituições Saudáveis:*\n` +
                        foodData.swap_suggestions.map((s: string) => `▪️ _${s}_`).join('\n') + `\n\n`;
    }

    replyMessage += `🗣️ *Coach diz:* "${foodData.coach_humor}"`;

    // Upload da foto para o bucket público 'consultas' do Supabase Storage
    let uploadedImageUrl = null;
    try {
        const fileExt = mimeType.split('/')[1] || 'jpg';
        const fileName = `food_${Date.now()}.${fileExt}`;
        const storagePath = `${user.id}/${fileName}`;
        
        console.log(`Enviando foto da comida para Supabase Storage: consultas/${storagePath}...`);
        const { error: uploadErr } = await supabase.storage
            .from('consultas')
            .upload(storagePath, buffer, {
                contentType: mimeType,
                upsert: true
            });

        if (uploadErr) {
            console.error("Erro no upload da foto da comida:", uploadErr);
        } else {
            const { data: urlData } = supabase.storage
                .from('consultas')
                .getPublicUrl(storagePath);
            
            uploadedImageUrl = urlData?.publicUrl || null;
            console.log("Foto de comida enviada com sucesso. URL pública:", uploadedImageUrl);
        }
    } catch (uploadException) {
        console.error("Exceção durante upload de foto de comida:", uploadException);
    }

    // 3. Gerar imagem do card de análise usando o VPS Puppeteer
    let cardImageUrl = null;
    try {
        console.log("Gerando card de análise visual...");
        const htmlTemplate = buildHtmlTemplate({ ...foodData, image_url: uploadedImageUrl }, coach_personality);
        const renderRes = await fetch("https://puppeteer.foodsnap.com.br/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                html: htmlTemplate,
                width: 720,
                height: 1280
            })
        });

        if (renderRes.ok) {
            const cardArrayBuffer = await renderRes.arrayBuffer();
            const cardBuffer = Buffer.from(cardArrayBuffer);
            const cardFileName = `card_${Date.now()}.png`;
            const cardStoragePath = `${user.id}/${cardFileName}`;
            
            console.log(`Enviando card de análise renderizado para Supabase Storage: consultas/${cardStoragePath}...`);
            const { error: cardUploadErr } = await supabase.storage
                .from('consultas')
                .upload(cardStoragePath, cardBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (!cardUploadErr) {
                const { data: cardUrlData } = supabase.storage
                    .from('consultas')
                    .getPublicUrl(cardStoragePath);
                cardImageUrl = cardUrlData?.publicUrl || null;
                console.log("Card de análise enviado com sucesso. URL pública:", cardImageUrl);
            } else {
                console.error("Erro no upload do card:", cardUploadErr);
            }
        } else {
            console.error("Erro na renderização do card pelo VPS:", renderRes.status, await renderRes.text());
        }
    } catch (renderEx) {
        console.error("Exceção durante a geração do card visual:", renderEx);
    }

    // 4. Salvar na Tabela Correta: food_analyses
    const richAiStructured = {
        ...foodData,
        card_image_url: cardImageUrl
    };

    await supabase.from("food_analyses").insert({
        user_id: user.id,
        food_name: foodData.food_name,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        score: foodData.score,
        total_calories: foodData.calories,
        total_protein: foodData.protein,
        total_carbs: foodData.carbs,
        total_fat: foodData.fat,
        total_fiber: foodData.fiber || 0,
        total_sodium_mg: foodData.sodium || 0,
        nutrition_score: foodData.score,
        ai_raw_response: foodData.coach_humor,
        ai_structured: richAiStructured,
        image_url: uploadedImageUrl,
        source: "whatsapp"
    });

    // 5. Enviar resposta para o WhatsApp (Imagem com legenda se gerada, senão texto simples)
    if (cardImageUrl) {
        await sendWhatsAppImage(cardImageUrl);
    } else {
        await sendWhatsAppMessage(replyMessage);
    }

    return { success: true, analysis: foodData };

    } catch (error: any) {
        console.error("Erro na OpenAI ou Supabase:", error);
        return { success: false, error: error.message };
    }
}

function buildHtmlTemplate(payload: any, coach_personality: string): string {
    const food_name = payload.food_name || 'Prato Identificado';
    const calories = Math.round(payload.calories || 0);
    const protein = Math.round(payload.protein || 0);
    const carbs = Math.round(payload.carbs || 0);
    const fat = Math.round(payload.fat || 0);
    const fiber = Math.round(payload.fiber || 0);
    const sodium = Math.round(payload.sodium || 0);
    const score = payload.score || 0;
    const estimated_weight_g = payload.estimated_weight_g || 0;
    const satiety_index = payload.satiety_index || 'médio';
    const glycemic_index = payload.glycemic_index || 'médio';
    const energy_duration_minutes = payload.energy_duration_minutes || 0;
    const goal_fit = payload.goal_fit || { emagrecer: 0, ganhar_massa: 0, manter: 0 };
    const alerts = payload.alerts || [];
    const swap_suggestions = payload.swap_suggestions || [];
    const coach_humor = payload.coach_humor || '';
    const image_url = payload.image_url || null;
    const meal_type = payload.meal_type || '';
    const cuisine_origin = payload.cuisine_origin || '';

    let scoreClass = 'score-yellow';
    if (score >= 8) {
        scoreClass = 'score-green';
    } else if (score <= 4) {
        scoreClass = 'score-red';
    }

    // Coach Display Name & Emoji Mapping
    let coachName = 'Chef Gordon';
    let coachEmoji = '👨‍🍳';
    const coachPers = (coach_personality || "gordon_ramsay").toLowerCase();
    if (coachPers.includes('vovo') || coachPers.includes('grandma') || coachPers.includes('carinhosa')) {
        coachName = 'Vovó Carinhosa';
        coachEmoji = '👵';
    } else if (coachPers.includes('cientifico') || coachPers.includes('science') || coachPers.includes('dr')) {
        coachName = 'Dr. Científico Frio';
        coachEmoji = '🔬';
    } else if (coachPers.includes('militar') || coachPers.includes('military') || coachPers.includes('sargento')) {
        coachName = 'Sargento Militar';
        coachEmoji = '🪖';
    } else {
        coachName = 'Chef Gordon (Cheff Titã)';
        coachEmoji = '👨‍🍳';
    }

    const fireIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const proteinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1M6 8H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1M2 11h2M20 11h2M6 12h12M12 4v16" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const carbIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const fatIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const zapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const fiberIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 7.7a7 7 0 0 1-10 10.3z" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21c0-4.5 3.5-8 8-8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const sodiumIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const satietyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 .5 3.1 1 1 0 0 0 1.4.3h0a1 1 0 0 0 .3-1.4A8 8 0 1 1 20.8 14a1 1 0 0 0 .3 1.4h0a1 1 0 0 0 1.4-.3A10 10 0 0 0 12 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13l4-4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13" r="1.5"/></svg>`;
    const warningIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const swapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const coachIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                background: #f8fafc;
                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                color: #0f172a;
                -webkit-font-smoothing: antialiased;
            }
            
            .capture-wrapper {
                width: 720px;
                height: 1280px;
                padding: 32px 32px 24px 32px;
                background: #f8fafc;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: hidden;
            }
            
            .brand-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .brand {
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -0.03em;
                color: #0f172a;
                display: flex;
                align-items: center;
            }
            
            .brand-dot {
                color: #10b981;
            }
            
            .brand-subtitle {
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 6px 14px;
                border-radius: 10px;
                border-width: 1px;
                border-style: solid;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .brand-subtitle.score-green {
                background: #ecfdf5;
                color: #047857;
                border-color: #a7f3d0;
            }
            .brand-subtitle.score-yellow {
                background: #fef3c7;
                color: #b45309;
                border-color: #fde68a;
            }
            .brand-subtitle.score-red {
                background: #fef2f2;
                color: #b91c1c;
                border-color: #fecaca;
            }
            
            .card {
                background: #ffffff;
                border-radius: 24px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08);
                padding: 24px;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                gap: 20px;
                flex: 1;
                margin-bottom: 16px;
            }
            
            /* Food Profile */
            .food-banner-img {
                width: 100%;
                height: 220px;
                border-radius: 16px;
                object-fit: cover;
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                background-color: #f8fafc;
            }
            
            .food-info-header {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .food-title {
                font-size: 28px;
                font-weight: 800;
                color: #0f172a;
                letter-spacing: -0.02em;
                line-height: 1.2;
            }
            
            .food-meta-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .meta-pill {
                display: flex;
                align-items: center;
                gap: 6px;
                background-color: #f1f5f9;
                border: 1px solid #e2e8f0;
                padding: 6px 12px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 700;
                color: #475569;
                text-transform: capitalize;
            }
            
            /* Metrics Grid (8 boxes) */
            .macros-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }
            
            .macro-box {
                border-radius: 12px;
                padding: 12px 4px;
                text-align: center;
                border-width: 1px;
                border-style: solid;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 98px;
            }
            
            .macro-box.cal { background-color: #fef2f2; border-color: #fee2e2; }
            .macro-box.prot { background-color: #eff6ff; border-color: #dbeafe; }
            .macro-box.carb { background-color: #f5f3ff; border-color: #e0e7ff; }
            .macro-box.fat { background-color: #fffbeb; border-color: #fef3c7; }
            .macro-box.fib { background-color: #f0fdf4; border-color: #dcfce7; }
            .macro-box.sod { background-color: #ecfeff; border-color: #cffafe; }
            .macro-box.sac { background-color: #fff7ed; border-color: #ffedd5; }
            .macro-box.ene { background-color: #fefce8; border-color: #fef9c3; }
            
            .macro-icon { display: flex; justify-content: center; margin-bottom: 4px; }
            .macro-icon svg { width: 18px; height: 18px; }
            
            .font-red { color: #ef4444; }
            .font-blue { color: #2563eb; }
            .font-purple { color: #7c3aed; }
            .font-amber { color: #d97706; }
            .font-green { color: #16a34a; }
            .font-cyan { color: #0891b2; }
            .font-orange { color: #ea580c; }
            .font-gold { color: #ca8a04; }
            
            .macro-num { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
            .macro-lbl { font-size: 8.5px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            .macro-sub-lbl { font-size: 7.5px; font-weight: 750; text-transform: uppercase; color: #7c3aed; margin-top: 1px; }
            
            /* Details Col (Objectives) */
            .details-col {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 16px;
                padding: 20px 24px;
            }
            
            .section-title {
                font-size: 10.5px;
                font-weight: 800;
                text-transform: uppercase;
                color: #64748b;
                letter-spacing: 0.08em;
                margin-bottom: 16px;
            }
            
            /* Goal Bars */
            .goal-bars { display: flex; flex-direction: column; gap: 16px; }
            .goal-item { font-size: 12px; }
            .goal-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .goal-name { color: #475569; font-weight: 600; font-size: 12px; }
            .goal-score { font-weight: 750; color: #0f172a; font-size: 12px; }
            .goal-progress-bg { height: 10px; background-color: #e2e8f0; border-radius: 9999px; overflow: hidden; }
            .goal-progress-bar { height: 100%; border-radius: 9999px; }
            
            .bg-emerald { background-color: #10b981; }
            .bg-indigo { background-color: #6366f1; }
            .bg-amber { background-color: #f59e0b; }
            
            /* Alerts & Swaps */
            .alerts-swaps-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .alert-box, .swap-box { border-radius: 12px; padding: 10px 12px; border-width: 1px; border-style: solid; }
            
            .alert-box { background-color: #fef2f2; border-color: #fecaca; }
            .swap-box { background-color: #f0fdf4; border-color: #dcfce7; }
            
            .alert-title-box, .swap-title-box { display: flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; margin-bottom: 6px; }
            .alert-title-box svg, .swap-title-box svg { width: 14px; height: 14px; flex-shrink: 0; }
            .alert-title-box { color: #b91c1c; }
            .swap-title-box { color: #15803d; }
            
            .alert-list, .swap-list { list-style: none; font-size: 9.5px; line-height: 1.4; }
            .alert-list li { position: relative; padding-left: 10px; color: #991b1b; margin-bottom: 2px; }
            .swap-list li { position: relative; padding-left: 10px; color: #14532d; margin-bottom: 2px; }
            
            /* Coach Card Box (Integrated inside the card) */
            .coach-card-box {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .coach-card-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            /* Coach Quote Box */
            .coach-quote-box {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .coach-header {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .coach-icon-speech {
                font-size: 16px;
            }
            
            .coach-name-label {
                font-size: 11px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .coach-text {
                font-size: 13px;
                font-weight: 500;
                font-style: italic;
                color: #334155;
                line-height: 1.45;
                border-left: 3px solid #10b981;
                padding-left: 12px;
            }
            
            .poster-footer {
                text-align: center;
                color: #94a3b8;
                letter-spacing: 0.05em;
                font-weight: 600;
                font-size: 10.5px;
                margin-top: 10px;
            }
            .score-badge-val {
                font-size: 13px;
                font-weight: 800;
            }
        </style>
    </head>
    <body>
        <div class="capture-wrapper" id="capture">
            <!-- Header -->
            <div class="brand-header">
                <div class="brand">
                    <span>FoodSnap</span><span class="brand-dot">.ai</span>
                </div>
                <div class="brand-subtitle ${scoreClass}">
                    Nota Nutricional: <span class="score-badge-val">${score}</span>/10
                </div>
            </div>
            
            <!-- Card content -->
            <div class="card">
                ${image_url ? `<img src="${image_url}" class="food-banner-img" alt="${food_name}" />` : ''}
                
                <div class="food-info-header">
                    <h2 class="food-title">${food_name}</h2>
                    <div class="food-meta-row">
                        <span class="meta-pill weight">⚖️ ${estimated_weight_g}g</span>
                        ${meal_type ? `<span class="meta-pill meal">🍽️ ${meal_type}</span>` : ''}
                        ${cuisine_origin ? `<span class="meta-pill origin">📍 ${cuisine_origin}</span>` : ''}
                    </div>
                </div>
                
                <div class="macros-grid">
                    <div class="macro-box cal"><div class="macro-icon font-red">${fireIcon}</div><div class="macro-num font-red">${calories}</div><div class="macro-lbl">Calorias</div></div>
                    <div class="macro-box prot"><div class="macro-icon font-blue">${proteinIcon}</div><div class="macro-num font-blue">${protein}g</div><div class="macro-lbl">Proteína</div></div>
                    <div class="macro-box carb">
                        <div class="macro-icon font-purple">${carbIcon}</div>
                        <div class="macro-num font-purple">${carbs}g</div>
                        <div class="macro-lbl">Carboidratos</div>
                        <div class="macro-sub-lbl">IG: ${glycemic_index}</div>
                    </div>
                    <div class="macro-box fat"><div class="macro-icon font-amber">${fatIcon}</div><div class="macro-num font-amber">${fat}g</div><div class="macro-lbl">Gordura</div></div>
                    <div class="macro-box fib"><div class="macro-icon font-green">${fiberIcon}</div><div class="macro-num font-green">${fiber}g</div><div class="macro-lbl">Fibras</div></div>
                    <div class="macro-box sod"><div class="macro-icon font-cyan">${sodiumIcon}</div><div class="macro-num font-cyan">${sodium}mg</div><div class="macro-lbl">Sódio</div></div>
                    <div class="macro-box sac"><div class="macro-icon font-orange">${satietyIcon}</div><div class="macro-num font-orange">${satiety_index}</div><div class="macro-lbl">Saciedade</div></div>
                    <div class="macro-box ene"><div class="macro-icon font-gold">${zapIcon}</div><div class="macro-num font-gold">~${energy_duration_minutes}m</div><div class="macro-lbl">Energia</div></div>
                </div>
                
                <div class="details-col">
                    <div class="section-title">Adequação por Objetivo</div>
                    <div class="goal-bars">
                        <div class="goal-item"><div class="goal-header"><span class="goal-name">Emagrecimento</span><span class="goal-score">${goal_fit.emagrecer || 0}/10</span></div><div class="goal-progress-bg"><div class="goal-progress-bar bg-emerald" style="width:${(goal_fit.emagrecer || 0) * 10}%"></div></div></div>
                        <div class="goal-item"><div class="goal-header"><span class="goal-name">Ganho de Massa</span><span class="goal-score">${goal_fit.ganhar_massa || 0}/10</span></div><div class="goal-progress-bg"><div class="goal-progress-bar bg-indigo" style="width:${(goal_fit.ganhar_massa || 0) * 10}%"></div></div></div>
                        <div class="goal-item"><div class="goal-header"><span class="goal-name">Manutenção</span><span class="goal-score">${goal_fit.manter || 0}/10</span></div><div class="goal-progress-bg"><div class="goal-progress-bar bg-amber" style="width:${(goal_fit.manter || 0) * 10}%"></div></div></div>
                    </div>
                </div>
                
                ${(alerts && alerts.length > 0) || (swap_suggestions && swap_suggestions.length > 0) ? `
                <div class="alerts-swaps-row">
                    ${alerts && alerts.length > 0 ? `
                    <div class="alert-box">
                        <div class="alert-title-box">${warningIcon}<span>Alertas da Refeição</span></div>
                        <ul class="alert-list">${alerts.slice(0, 3).map(a => `<li>${a.replace(/^[⚠️\s▪️\-\*]+/, '')}</li>`).join('')}</ul>
                    </div>` : ''}
                    ${swap_suggestions && swap_suggestions.length > 0 ? `
                    <div class="swap-box">
                        <div class="swap-title-box">${swapIcon}<span>Substituições Saudáveis</span></div>
                        <ul class="swap-list">${swap_suggestions.slice(0, 3).map(s => `<li>${s.replace(/^[🔄\s▪️\-\*]+/, '')}</li>`).join('')}</ul>
                    </div>` : ''}
                </div>` : ''}
                
                ${coach_humor ? `
                <div class="coach-quote-box">
                    <div class="coach-header">
                        <span class="coach-icon-speech">${coachEmoji}</span>
                        <span class="coach-name-label">${coachName} diz:</span>
                    </div>
                    <p class="coach-text">"${coach_humor}"</p>
                </div>
                ` : ''}
            </div>
            
            <div class="poster-footer">
                Acesse foodsnap.com.br para o seu plano completo de dieta e treino
            </div>
        </div>
    </body>
    </html>
    `;
}

function estimateCardHeight(foodData: any): number {
    let height = 550; // Base layout height (Header, title, image, macros grid, glycemic row, goal bars column)

    const alertsCount = foodData.alerts?.length || 0;
    const swapsCount = foodData.swap_suggestions?.length || 0;

    if (alertsCount > 0 || swapsCount > 0) {
        // Height for the side-by-side alerts & swaps box
        const maxItems = Math.max(alertsCount, swapsCount);
        height += 50 + (maxItems * 22); // Header padding + item list heights
    }

    if (foodData.coach_humor) {
        // Base coach box layout (avatar, title, paddings)
        height += 90;
        // Estimate lines of coach humor text (approx 65 characters per line inside container)
        const charCount = foodData.coach_humor.length;
        const estimatedLines = Math.ceil(charCount / 65);
        height += estimatedLines * 18;
    }

    // Add extra padding safety margin
    height += 30;

    return Math.max(500, Math.min(1500, Math.round(height)));
}
