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
        const cardData = { ...foodData, image_url: uploadedImageUrl };
        const htmlTemplate = buildHtmlTemplate(cardData, coach_personality);
        const renderRes = await fetch("https://puppeteer.foodsnap.com.br/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                html: htmlTemplate,
                width: 1080,
                height: estimateCardHeight(cardData)
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

function buildHtmlTemplate(payload: any, _coach_personality?: string): string {
    const food_name = payload.food_name || 'Prato Identificado';
    const calories = Math.round(payload.calories || 0);
    const protein = Math.round(payload.protein || 0);
    const carbs = Math.round(payload.carbs || 0);
    const fat = Math.round(payload.fat || 0);
    const fiber = Math.round(payload.fiber || 0);
    const sodium = Math.round(payload.sodium || 0);
    const score = payload.score || 0;
    const weight = payload.estimated_weight_g || 0;
    const gi = payload.glycemic_index || 'médio';
    const goal = payload.goal_fit || { emagrecer: 0, ganhar_massa: 0, manter: 0 };
    const alerts = payload.alerts || [];
    const swaps = payload.swap_suggestions || [];
    const coach = payload.coach_humor || '';
    const image_url = payload.image_url || null;
    const meal = payload.meal_type || '';
    const cuisine = payload.cuisine_origin || '';

    let scoreClass = 'sc-yellow';
    if (score >= 8) scoreClass = 'sc-green';
    else if (score <= 4) scoreClass = 'sc-red';

    const I = {
        fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        prot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1M6 8H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1M2 11h2M20 11h2M6 12h12M12 4v16" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        carb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        fat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        fiber: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 7.7a7 7 0 0 1-10 10.3z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        sod: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        warn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        swap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        weight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.5 6.5h11l2 13h-15z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="4" r="2"/></svg>`,
        chef: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`
    };

    const macro = (cls: string, icon: string, val: string, lbl: string, sub?: string) => `
      <div class="m-box ${cls}">
        <div class="m-ico">${icon}</div>
        <div class="m-val">${val}</div>
        <div class="m-lbl">${lbl}</div>
        ${sub ? `<div class="m-sub">${sub}</div>` : ''}
      </div>`;

    const bar = (name: string, v: number, color: string) => `
      <div class="g-item">
        <div class="g-head"><span>${name}</span><span class="g-score">${v}/10</span></div>
        <div class="g-bg"><div class="g-bar" style="width:${v * 10}%;background:${color}"></div></div>
      </div>`;

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Plus Jakarta Sans',sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;}
    .wrap{width:1080px;background:#f1f5f9;padding:44px;}
    .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;}
    .brand{font-size:40px;font-weight:800;letter-spacing:-0.03em;}.brand .d{color:#10b981;}
    .score-badge{display:flex;align-items:center;gap:12px;padding:14px 26px;border-radius:18px;border:2px solid;font-weight:800;}
    .score-badge .n{font-size:42px;line-height:1;}.score-badge .t{font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;opacity:.85;}
    .sc-green{background:#ecfdf5;color:#047857;border-color:#6ee7b7;}.sc-yellow{background:#fffbeb;color:#b45309;border-color:#fcd34d;}.sc-red{background:#fef2f2;color:#b91c1c;border-color:#fca5a5;}
    .card{background:#fff;border-radius:32px;border:1px solid #e2e8f0;box-shadow:0 20px 50px -12px rgba(15,23,42,.12);padding:36px;display:flex;flex-direction:column;gap:30px;}
    .food-img{width:100%;height:380px;object-fit:cover;border-radius:24px;border:1px solid #e2e8f0;}
    .title{font-size:46px;font-weight:800;letter-spacing:-0.02em;line-height:1.12;}
    .pills{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;}
    .pill{display:flex;align-items:center;gap:8px;background:#f1f5f9;border:1px solid #e2e8f0;padding:10px 18px;border-radius:9999px;font-size:22px;font-weight:700;color:#475569;text-transform:capitalize;}.pill svg{width:22px;height:22px;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
    .m-box{border-radius:22px;border:2px solid;padding:24px 26px;display:flex;flex-direction:column;align-items:flex-start;}
    .m-ico{width:40px;height:40px;margin-bottom:10px;}.m-ico svg{width:40px;height:40px;}
    .m-val{font-size:52px;font-weight:800;line-height:1;}.m-lbl{font-size:24px;font-weight:700;color:#64748b;margin-top:8px;text-transform:uppercase;letter-spacing:.03em;}.m-sub{font-size:18px;font-weight:700;color:#7c3aed;margin-top:4px;}
    .cal{background:#fef2f2;border-color:#fee2e2;}.cal .m-ico,.cal .m-val{color:#ef4444;}
    .prot{background:#eff6ff;border-color:#dbeafe;}.prot .m-ico,.prot .m-val{color:#2563eb;}
    .carbb{background:#f5f3ff;border-color:#e9e5ff;}.carbb .m-ico,.carbb .m-val{color:#7c3aed;}
    .fatb{background:#fffbeb;border-color:#fef3c7;}.fatb .m-ico,.fatb .m-val{color:#d97706;}
    .fibb{background:#f0fdf4;border-color:#dcfce7;}.fibb .m-ico,.fibb .m-val{color:#16a34a;}
    .sodb{background:#ecfeff;border-color:#cffafe;}.sodb .m-ico,.sodb .m-val{color:#0891b2;}
    .section{background:#f8fafc;border:1px solid #eef2f7;border-radius:24px;padding:28px 30px;}
    .s-title{font-size:20px;font-weight:800;text-transform:uppercase;color:#64748b;letter-spacing:.08em;margin-bottom:22px;}
    .g-item{margin-bottom:22px;}.g-item:last-child{margin-bottom:0;}
    .g-head{display:flex;justify-content:space-between;font-size:24px;font-weight:600;color:#475569;margin-bottom:10px;}.g-score{font-weight:800;color:#0f172a;}
    .g-bg{height:18px;background:#e2e8f0;border-radius:9999px;overflow:hidden;}.g-bar{height:100%;border-radius:9999px;}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
    .note{border-radius:22px;padding:22px 24px;border:2px solid;}
    .note-h{display:flex;align-items:center;gap:10px;font-size:22px;font-weight:800;margin-bottom:12px;}.note-h svg{width:26px;height:26px;}
    .note ul{list-style:none;}.note li{font-size:21px;line-height:1.4;margin-bottom:8px;padding-left:18px;position:relative;}.note li:before{content:'';position:absolute;left:0;top:11px;width:8px;height:8px;border-radius:50%;}
    .alert{background:#fef2f2;border-color:#fecaca;}.alert .note-h{color:#b91c1c;}.alert li{color:#991b1b;}.alert li:before{background:#ef4444;}
    .swap{background:#f0fdf4;border-color:#dcfce7;}.swap .note-h{color:#15803d;}.swap li{color:#14532d;}.swap li:before{background:#22c55e;}
    .coach{background:#0f172a;border-radius:24px;padding:30px 32px;}
    .coach-h{display:flex;align-items:center;gap:14px;margin-bottom:16px;}.coach-av{width:48px;height:48px;border-radius:14px;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#10b981;}.coach-av svg{width:28px;height:28px;}.coach-name{font-size:22px;font-weight:800;color:#fff;}
    .coach-txt{font-size:25px;font-style:italic;line-height:1.45;color:#cbd5e1;border-left:4px solid #10b981;padding-left:18px;}
    .foot{text-align:center;color:#94a3b8;font-size:20px;font-weight:600;margin-top:26px;}
    </style></head><body><div class="wrap">
      <div class="top"><div class="brand">FoodSnap<span class="d">.ai</span></div><div class="score-badge ${scoreClass}"><span class="t">Nota</span><span class="n">${score}</span><span class="t">/10</span></div></div>
      <div class="card">
        ${image_url ? `<img class="food-img" src="${image_url}"/>` : ''}
        <div><div class="title">${food_name}</div><div class="pills"><span class="pill">${I.weight}${weight}g</span>${meal ? `<span class="pill">${meal}</span>` : ''}${cuisine ? `<span class="pill">${cuisine}</span>` : ''}</div></div>
        <div class="grid">${macro('cal', I.fire, String(calories), 'Calorias')}${macro('prot', I.prot, protein + 'g', 'Proteína')}${macro('carbb', I.carb, carbs + 'g', 'Carboidratos', 'IG: ' + gi)}${macro('fatb', I.fat, fat + 'g', 'Gordura')}${macro('fibb', I.fiber, fiber + 'g', 'Fibras')}${macro('sodb', I.sod, sodium + 'mg', 'Sódio')}</div>
        <div class="section"><div class="s-title">Adequação por Objetivo</div>${bar('Emagrecimento', goal.emagrecer || 0, '#10b981')}${bar('Ganho de Massa', goal.ganhar_massa || 0, '#6366f1')}${bar('Manutenção', goal.manter || 0, '#f59e0b')}</div>
        ${(alerts.length || swaps.length) ? `<div class="two">${alerts.length ? `<div class="note alert"><div class="note-h">${I.warn}Alertas</div><ul>${alerts.slice(0, 3).map((a: string) => `<li>${a.replace(/^[^A-Za-zÀ-ÿ0-9]+/, '')}</li>`).join('')}</ul></div>` : ''}${swaps.length ? `<div class="note swap"><div class="note-h">${I.swap}Substituições</div><ul>${swaps.slice(0, 3).map((s: string) => `<li>${s.replace(/^[^A-Za-zÀ-ÿ0-9]+/, '')}</li>`).join('')}</ul></div>` : ''}</div>` : ''}
        ${coach ? `<div class="coach"><div class="coach-h"><div class="coach-av">${I.chef}</div><div class="coach-name">Coach diz:</div></div><div class="coach-txt">"${coach}"</div></div>` : ''}
      </div>
      <div class="foot">Acesse foodsnap.com.br para seu plano completo de dieta e treino</div>
    </div></body></html>`;
}

function estimateCardHeight(payload: any): number {
    let h = 250;                          // topo + margens + padding do wrap + footer
    h += 72;                              // padding do card
    if (payload.image_url) h += 410;      // foto do prato
    h += 175;                             // título + pills
    h += 510;                             // 6 macros (3 linhas)
    h += 320;                             // barras de objetivo
    const a = (payload.alerts || []).slice(0, 3).length;
    const s = (payload.swap_suggestions || []).slice(0, 3).length;
    if (a || s) h += 70 + Math.max(a, s) * 40;
    if (payload.coach_humor) h += 120 + Math.ceil((payload.coach_humor.length) / 50) * 40;
    return Math.round(h);
}
