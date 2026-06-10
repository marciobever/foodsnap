//nobundling
import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 11: Process Body AI (Dieta e Treino) with OpenAI
 *
 * Salva a foto enviada no bucket coach-uploads e compara o físico atual
 * com a avaliação anterior do usuário (evolution_notes).
 */

function buildCoachPdfHtml(plan: any): string {
  const a = plan.analysis || {};
  const w = plan.workout || {};
  const diet = plan.diet || {};
  const quote = plan.motivation_quote || "";

  const li = (arr: string[], c: string) => (arr || []).map((x: string) => `<li><span class="dot" style="background:${c}"></span>${x}</li>`).join("") || '<li>—</li>';

  const days = (w.routine || []).map((d: any) => {
    const rows = (d.exercises || []).map((ex: any) => `<tr><td class="ex">${ex.name}</td><td class="sr">${ex.sets}x ${ex.reps}</td><td class="tc">${ex.technique || "—"}</td></tr>`).join("");
    return `<div class="daycard"><div class="dayhead"><span class="daytag">${d.day}</span><span class="daymg">${d.muscle_group}</span></div><table class="extbl"><thead><tr><th>Exercício</th><th>Séries</th><th>Técnica</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join("");

  const meals = (diet.meal_plan_example || []).map((m: any) => {
    const opts = (m.options || []).map((o: string) => `<li>${o}</li>`).join("");
    return `<div class="meal"><div class="mealhead"><h4>${m.name || "Refeição"}</h4><span class="time">${m.time_range || ""}</span></div><ul class="opts">${opts}</ul>${m.substitution_suggestion ? `<div class="subs"><b>Troca:</b> ${m.substitution_suggestion}</div>` : ""}</div>`;
  }).join("");

  const supps = (diet.supplements || []).map((s: any) => {
    const n = typeof s === 'string' ? s : (s.name || "");
    const dg = typeof s === 'string' ? '' : (s.dosage || '');
    const r = typeof s === 'string' ? '' : (s.reason || '');
    return `<div class="supp"><div class="sn">${n}${dg ? ` <span class="sd">${dg}</span>` : ''}</div>${r ? `<div class="sr2">${r}</div>` : ''}</div>`;
  }).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @page{size:A4;margin:0;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Plus Jakarta Sans',sans-serif;color:#0f172a;-webkit-print-color-adjust:exact !important;}
  .doc{width:794px;min-height:1123px;margin:0 auto;background:#fff;padding:36px 42px;}
  .doc.pagebreak{page-break-before:always;}
  .brandbar{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #4f46e5;padding-bottom:12px;margin-bottom:18px;}
  .brand{font-size:24px;font-weight:800;letter-spacing:-.02em;}.brand .d{color:#6366f1;}
  .doctype{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#6366f1;margin-bottom:2px;}
  .date{font-size:10px;color:#94a3b8;font-weight:600;text-align:right;}
  .h2{font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#1e293b;margin:18px 0 12px;display:flex;align-items:center;gap:8px;}
  .h2:before{content:'';width:5px;height:18px;background:#6366f1;border-radius:3px;}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
  .stat{background:#f8fafc;border:1px solid #e8edf5;border-radius:12px;padding:12px 14px;}
  .stat .l{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:3px;}
  .stat .v{font-size:18px;font-weight:800;}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .panel{background:#f8fafc;border:1px solid #e8edf5;border-radius:12px;padding:13px 15px;}
  .panel h3{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
  .panel.good h3{color:#15803d;}.panel.bad h3{color:#b45309;}
  .panel ul{list-style:none;}.panel li{font-size:12px;margin-bottom:5px;padding-left:16px;position:relative;color:#334155;line-height:1.35;}
  .dot{position:absolute;left:0;top:5px;width:7px;height:7px;border-radius:50%;}
  .posture{background:#eef2ff;border:1px solid #e0e7ff;border-radius:12px;padding:13px 15px;margin-top:12px;}
  .posture h3{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#4f46e5;margin-bottom:6px;}
  .posture div{font-size:12px;color:#3730a3;white-space:pre-line;line-height:1.45;}
  .daycard{border:1px solid #e8edf5;border-radius:12px;overflow:hidden;margin-bottom:11px;page-break-inside:avoid;}
  .dayhead{background:#1e1b4b;display:flex;justify-content:space-between;align-items:center;padding:8px 14px;}
  .daytag{background:#6366f1;color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;padding:3px 9px;border-radius:7px;}
  .daymg{color:#fff;font-size:13px;font-weight:800;text-transform:uppercase;}
  .extbl{width:100%;border-collapse:collapse;}
  .extbl th{text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;color:#94a3b8;padding:6px 14px;border-bottom:1px solid #eef2f7;}
  .extbl th:nth-child(2){text-align:center;width:80px;}.extbl th:nth-child(3){text-align:right;}
  .extbl td{padding:7px 14px;border-bottom:1px solid #f4f6fb;font-size:12px;}
  .extbl tr:last-child td{border-bottom:0;}
  .extbl .ex{font-weight:700;color:#1e293b;}
  .extbl .sr{text-align:center;font-weight:800;color:#4f46e5;}
  .extbl .tc{text-align:right;font-size:11px;font-style:italic;color:#64748b;}
  .dietbar{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;background:#0f172a;border-radius:14px;overflow:hidden;}
  .dietbar .c{padding:14px 16px;border-right:1px solid #1e293b;}.dietbar .c:last-child{border-right:0;}
  .dietbar .l{font-size:9px;font-weight:700;text-transform:uppercase;margin-bottom:3px;}
  .dietbar .cal .l{color:#fca5a5;}.dietbar .p .l{color:#a5b4fc;}.dietbar .cb .l{color:#6ee7b7;}.dietbar .f .l{color:#fcd34d;}
  .dietbar .v{font-size:20px;font-weight:800;color:#fff;}.dietbar .v small{font-size:10px;font-weight:500;color:#94a3b8;}
  .meal{border:1px solid #e8edf5;border-radius:12px;padding:12px 16px;margin-bottom:10px;page-break-inside:avoid;}
  .mealhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;border-bottom:1px solid #f1f5f9;padding-bottom:6px;}
  .mealhead h4{font-size:13px;font-weight:800;text-transform:uppercase;color:#1e293b;}
  .time{font-size:10px;font-weight:700;color:#16a34a;background:#f0fdf4;border:1px solid #dcfce7;padding:2px 9px;border-radius:9999px;}
  .opts{list-style:none;}.opts li{font-size:12px;color:#334155;margin-bottom:4px;padding-left:15px;position:relative;}
  .opts li:before{content:'';position:absolute;left:0;top:6px;width:6px;height:6px;border-radius:50%;background:#10b981;}
  .subs{margin-top:6px;font-size:11px;color:#92400e;background:#fffbeb;border-left:3px solid #f59e0b;padding:6px 11px;border-radius:0 7px 7px 0;}
  .suppwrap{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .supp{background:#f8fafc;border:1px solid #e8edf5;border-radius:10px;padding:10px 13px;}
  .sn{font-size:12px;font-weight:800;color:#1e293b;}.sd{font-size:10px;font-weight:700;color:#4f46e5;background:#eef2ff;padding:1px 6px;border-radius:5px;}
  .sr2{font-size:11px;color:#64748b;margin-top:2px;font-style:italic;}
  .hydro{margin-top:10px;background:#0f172a;border-radius:10px;padding:11px 15px;display:flex;justify-content:space-between;align-items:center;}
  .hydro .l{color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;}.hydro .v{color:#fff;font-size:15px;font-weight:800;}
  .quote{margin-top:16px;text-align:center;padding:14px;border-top:1px solid #e8edf5;}
  .quote p{font-size:12.5px;font-style:italic;color:#475569;}
  </style></head><body>

  <div class="doc">
    <div class="brandbar"><div><div class="doctype">Protocolo Titan • Treino</div><div class="brand">FoodSnap<span class="d">.ai</span></div></div><div class="date">Emitido em<br>${new Date().toLocaleDateString('pt-BR')}</div></div>
    <div class="stats"><div class="stat"><div class="l">Biótipo</div><div class="v">${a.somatotype || "—"}</div></div><div class="stat"><div class="l">Gordura Est.</div><div class="v">~${a.body_fat_percentage || "—"}%</div></div><div class="stat"><div class="l">Massa</div><div class="v">${a.muscle_mass_level || "—"}</div></div><div class="stat"><div class="l">Foco</div><div class="v">${w.focus || "—"}</div></div></div>
    <div class="h2">Análise Física</div>
    <div class="two"><div class="panel good"><h3>Pontos Fortes</h3><ul>${li(a.strengths || [], '#22c55e')}</ul></div><div class="panel bad"><h3>A Desenvolver</h3><ul>${li(a.weaknesses || [], '#f59e0b')}</ul></div></div>
    ${a.posture_analysis ? `<div class="posture"><h3>Análise Postural</h3><div>${a.posture_analysis}</div></div>` : ''}
    <div class="h2">Divisão de Treino — ${w.split || ""} (${w.frequency_days || 0}x/semana)</div>
    ${days}
  </div>

  <div class="doc pagebreak">
    <div class="brandbar"><div><div class="doctype">Protocolo Titan • Dieta</div><div class="brand">FoodSnap<span class="d">.ai</span></div></div><div class="date">Meta Calórica<br><b style="color:#0f172a;font-size:13px">${diet.total_calories || 0} kcal</b></div></div>
    <div class="dietbar"><div class="c cal"><div class="l">Calorias / Dia</div><div class="v">${diet.total_calories || 0} <small>kcal</small></div></div><div class="c p"><div class="l">Proteínas</div><div class="v">${diet.macros?.protein_g || 0}<small>g</small></div></div><div class="c cb"><div class="l">Carboidratos</div><div class="v">${diet.macros?.carbs_g || 0}<small>g</small></div></div><div class="c f"><div class="l">Gorduras</div><div class="v">${diet.macros?.fats_g || 0}<small>g</small></div></div></div>
    <div class="h2">Cardápio do Dia</div>
    ${meals}
    <div class="h2">Suplementação</div>
    <div class="suppwrap">${supps}</div>
    <div class="hydro"><div class="l">Meta de Hidratação</div><div class="v">${diet.hydration_liters || 3.0} L / dia</div></div>
    ${quote ? `<div class="quote"><p>"${quote}"</p></div>` : ''}
  </div>

  </body></html>`;
}

export async function main(
  sender_number: string,
  remote_jid: string,
  message_id: string,
  media_id: string
) {
  const META_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN") as string;
  const META_PHONE_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID") as string;
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL") as string;
  const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY") as string;
  const OPENAI_API_KEY = await wmill.getVariable("u/bevervansomarcio/OPENAI_API_KEY") as string;

  if (!META_TOKEN || !SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY || !META_PHONE_ID) {
    throw new Error("Missing required environment variables.");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const GRAPH_API = "https://graph.facebook.com/v19.0";

  // 1. Mensagem de Carregamento
  await fetch(`${GRAPH_API}/${META_PHONE_ID}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
      body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: remote_jid,
          type: "text",
          text: { body: "⏳ *Analisando seu biótipo e criando sua dieta e treino...* (Isso pode levar alguns segundos)." }
      })
  });

  // 2. Baixar Imagem da Meta
  const mediaRes = await fetch(`${GRAPH_API}/${media_id}`, {
      headers: { Authorization: `Bearer ${META_TOKEN}` }
  });
  if (!mediaRes.ok) return { error: "Erro na URL da Imagem" };
  const mediaData = await mediaRes.json();

  const imgRes = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${META_TOKEN}` }
  });
  const imgBuffer = await imgRes.arrayBuffer();
  const base64Img = Buffer.from(imgBuffer).toString("base64");
  const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

  // 3. Pegar User ID
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
  let profile: any = null;
  for (const candidate of phoneCandidates) {
      const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone", candidate)
          .maybeSingle();

      if (data) {
          profile = data;
          break;
      }
  }

  if (!profile) return { error: "User not found" };

  // 3.1 Limite Diário de Avaliação Física (1 por dia, horário de Brasília)
  const nowB = new Date();
  const startTodayBR = new Date(nowB.getTime() - 3 * 60 * 60 * 1000);
  startTodayBR.setUTCHours(3, 0, 0, 0);
  const { count: coachToday } = await supabase
      .from("coach_assessments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", startTodayBR.toISOString());

  if (coachToday !== null && coachToday >= 1) {
      await supabase.from("whatsapp_sessions").update({ state: "IDLE" }).eq("phone_number", sender_number);
      await fetch(`${GRAPH_API}/${META_PHONE_ID}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
          body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: remote_jid,
              type: "text",
              text: { body: "🚨 *Limite de Avaliação!*\n\nVocê já gerou a sua *avaliação física de hoje*. Permitimos *1 avaliação por dia* para você ter tempo de aplicar o plano. Volte amanhã! 💪" }
          })
      });
      return { success: false, reason: "coach_daily_limit" };
  }

  // 3.2 Buscar avaliação anterior para comparação de evolução
  const { data: previousAssessment } = await supabase
      .from("coach_assessments")
      .select("created_at, ai_structured")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  let lastEvaluationText = "";
  const prevAnalysis = previousAssessment?.ai_structured?.analysis;
  if (prevAnalysis) {
      const prevDate = new Date(previousAssessment.created_at).toLocaleDateString("pt-BR");
      lastEvaluationText = `Avaliação Anterior (${prevDate}): `;
      if (prevAnalysis.body_fat_percentage) lastEvaluationText += `Percentual de Gordura Estimado: ${prevAnalysis.body_fat_percentage}%. `;
      if (prevAnalysis.somatotype) lastEvaluationText += `Biótipo: ${prevAnalysis.somatotype}. `;
      if (prevAnalysis.muscle_mass_level) lastEvaluationText += `Massa Muscular: ${prevAnalysis.muscle_mass_level}. `;
      if (prevAnalysis.strengths?.length) lastEvaluationText += `Pontos Fortes: ${prevAnalysis.strengths.join(", ")}. `;
      if (prevAnalysis.weaknesses?.length) lastEvaluationText += `Pontos Fracos: ${prevAnalysis.weaknesses.join(", ")}. `;
      lastEvaluationText += `\nCompare o físico atual com esse histórico e preencha "evolution_notes" com as mudanças reais notadas (gordura, massa muscular, postura).`;
  }

  // 4. Analisar com OpenAI
  const promptSystem = `Você é o "Titan Coach", um treinador olímpico de elite e nutricionista esportivo PhD.
Sua missão é analisar a foto do físico de um usuário e criar um **Protocolo de Transformação** completo, rico e detalhado.

Se a foto enviada NÃO contiver um corpo humano nítido ou se for impossível analisar o biótipo, defina "valid_body" como false.

RETORNE APENAS JSON.
NÃO use Markdown.
Formato de Resposta (Siga estritamente esta estrutura):
{
  "valid_body": true,
  "analysis": {
    "body_fat_percentage": 15,
    "somatotype": "Ectomorfo" | "Mesomorfo" | "Endomorfo",
    "muscle_mass_level": "Baixo" | "Médio" | "Alto",
    "posture_analysis": "Análise detalhada da postura estruturada em tópicos (usando hifens '-'), apontando desvios específicos (ex: ombros projetados, leve cifose) de forma legível e sem parágrafos densos.",
    "evolution_notes": "Se uma 'Avaliação Anterior' for fornecida no contexto, compare o físico atual com ela e descreva as mudanças reais notadas (gordura, massa muscular, postura) de forma técnica e motivacional, estruturada em tópicos (usando hifens '-'). Se NÃO houver avaliação anterior, dê dicas práticas de como acompanhar a evolução até a próxima avaliação, estruturadas em tópicos (usando hifens '-').",
    "strengths": ["Ombros largos", "Cintura fina"],
    "weaknesses": ["Panturrilhas pouco desenvolvidas"]
  },
  "diet": {
    "total_calories": 2400,
    "macros": {
      "protein_g": 160,
      "carbs_g": 280,
      "fats_g": 70
    },
    "hydration_liters": 3.5,
    "supplements": [
       { "name": "Creatina", "dosage": "5g pós-treino", "reason": "Aumento de força e recuperação" },
       { "name": "Whey Protein", "dosage": "30g se necessário", "reason": "Praticidade proteica" }
    ],
    "meal_plan_example": [
      {
        "name": "Café da Manhã",
        "time_range": "07:00 - 08:00",
        "options": [
             "Opção 1: 3 Ovos mexidos + 1 Banana + 40g Aveia",
             "Opção 2: 2 Fatias Pão Integral + 100g Frango Desfiado + Cottage"
        ],
        "substitution_suggestion": "Substituir ovos por Whey se estiver com pressa."
      },
      {
        "name": "Almoço",
        "time_range": "12:00 - 13:00",
        "options": [
             "Opção 1: 150g Frango Grelhado + 120g Arroz Branco + Salada à vontade",
             "Opção 2: 150g Patinho Moído + 150g Batata Inglesa"
        ],
        "substitution_suggestion": "Trocar arroz por Macarrão Integral na mesma proporção."
      }
    ]
  },
  "workout": {
    "split": "ABCD",
    "focus": "Hipertrofia" | "Força" | "Perda de Gordura",
    "frequency_days": 4,
    "injury_adaptations": {
       "knee_pain": "Substituir Agachamento por Leg Press",
       "shoulder_pain": "Preferir halteres na pegada neutra"
    },
    "routine": [
      {
        "day": "Segunda-feira",
        "muscle_group": "Peito + Tríceps",
        "exercises": [
           { "name": "Supino Inclinado com Halteres", "sets": 4, "reps": "8-12", "technique": "Descida controlada" },
           { "name": "Crucifixo Máquina", "sets": 3, "reps": "12-15", "technique": "Pico de contração de 1s" }
        ]
      },
      {
        "day": "Terça-feira",
        "muscle_group": "Costas + Bíceps",
        "exercises": [
           { "name": "Puxada Alta", "sets": 4, "reps": "10-12", "technique": "Cotovelos para baixo" }
        ]
      }
    ]
  },
  "motivation_quote": "Uma frase de impacto do treinador."
}

Regras IMPORTANTES:
1. Seja MUITO DETALHADO na dieta. Dê SEMPRE pelo menos 2 opções para CADA refeição ("options").
2. Inclua o horário sugerido ("time_range") para cada refeição.
3. O campo "substitution_suggestion" deve dar uma alternativa clara de troca de alimentos.
4. Forneça um treino completo estruturado para os dias da semana em "routine".
5. Nos suplementos, especifique COMO tomar e PORQUE.
6. Se a imagem não for um corpo analisável, retorne "valid_body": false.
7. Se a mensagem do usuário incluir uma "Avaliação Anterior", USE esses dados para preencher "evolution_notes" com uma comparação real de progresso (não invente dados que não foram fornecidos).`;

  try {
      const openaiUrl = "https://api.openai.com/v1/chat/completions";

      const userContent: any[] = [];
      if (lastEvaluationText) {
          userContent.push({ type: "text", text: lastEvaluationText });
      }
      userContent.push({
          type: "image_url",
          image_url: {
              url: `data:${mimeType};base64,${base64Img}`,
              detail: "high"
          }
      });

      const aiResponse = await fetch(openaiUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
              model: "gpt-5.4-mini",
              messages: [
                  {
                      role: "system",
                      content: promptSystem
                  },
                  {
                      role: "user",
                      content: userContent
                  }
              ],
              response_format: { type: "json_object" },
              temperature: 0.2
          })
      });

      const aiDataRaw = await aiResponse.json();
      let responseText = aiDataRaw.choices?.[0]?.message?.content;

      if (!responseText) throw new Error("Sem resposta válida da OpenAI.");

      const aiData = JSON.parse(responseText);

      if (!aiData.valid_body) {
          await supabase
              .from("whatsapp_sessions")
              .update({ state: "IDLE" })
              .eq("phone_number", sender_number);

          await fetch(`${GRAPH_API}/${META_PHONE_ID}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
              body: JSON.stringify({
                  messaging_product: "whatsapp",
                  recipient_type: "individual",
                  to: remote_jid,
                  type: "text",
                  text: { body: "⚠️ Não consegui ver seu corpo claramente na foto. O processo de dieta foi cancelado. Você pode enviar a foto do seu prato de comida ou chamar o menu novamente!" }
              })
          });
          return { success: false, reason: "invalid_body" };
      }

      // 4.1 Salvar a foto no bucket coach-uploads (timeline de evolução)
      let imagePath: string | null = null;
      try {
          const ext = mimeType.includes("png") ? "png" : "jpg";
          imagePath = `${profile.id}/coach_${Date.now()}.${ext}`;
          await supabase.storage.from("coach-uploads").upload(imagePath, Buffer.from(imgBuffer), {
              contentType: mimeType,
              upsert: true
          });
      } catch (uploadErr) {
          console.error("Erro ao salvar foto da avaliação:", uploadErr);
          imagePath = null;
      }

      // 5. Salvar no Supabase
      const { data: dbInsert } = await supabase
          .from("coach_assessments")
          .insert({
              user_id: profile.id,
              source: "whatsapp",
              biotype: aiData.analysis?.somatotype || null,
              estimated_body_fat: aiData.analysis?.body_fat_percentage || 0,
              muscle_mass_level: aiData.analysis?.muscle_mass_level || null,
              goal_suggestion: aiData.workout?.focus || null,
              workout_plan: typeof aiData.workout === 'string' ? aiData.workout : JSON.stringify(aiData.workout),
              diet_plan: typeof aiData.diet === 'string' ? aiData.diet : JSON.stringify(aiData.diet),
              ai_raw_response: responseText,
              ai_structured: aiData,
              image_url: imagePath
          })
          .select("id")
          .single();

      // 5.1 Geração do PDF profissional (n8n / headless Chrome)
      try {
          const pdfFileName = `FoodSnap_Titan_${Date.now()}`;
          const pdfHtml = buildCoachPdfHtml(aiData);

          const pdfResponse = await fetch("https://n8n.seureview.com.br/webhook/pdf-coach", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ html: pdfHtml, file_name: pdfFileName })
          });

          if (pdfResponse.ok) {
              const pdfBlob = await pdfResponse.arrayBuffer();
              const storagePath = `${profile.id}/${pdfFileName}.pdf`;
              await supabase.storage.from("coach-pdfs").upload(storagePath, new Uint8Array(pdfBlob), { contentType: "application/pdf" });

              const { data: urlData } = await supabase.storage.from("coach-pdfs").createSignedUrl(storagePath, 3600);

              if (urlData?.signedUrl) {
                  await fetch(`${GRAPH_API}/${META_PHONE_ID}/messages`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
                      body: JSON.stringify({
                          messaging_product: "whatsapp",
                          recipient_type: "individual",
                          to: remote_jid,
                          type: "document",
                          document: { link: urlData.signedUrl, filename: `${pdfFileName}.pdf`, caption: "📄 Seu Protocolo Titan em PDF!" }
                      })
                  });
              }
          }
      } catch (pdfErr) {
          console.error("Erro na geração do PDF:", pdfErr);
      }

      // 6. Voltar o estado para IDLE
      await supabase
          .from("whatsapp_sessions")
          .update({ state: "IDLE" })
          .eq("phone_number", sender_number);

      // 7. Enviar o resultado pro WhatsApp
      let successText = `✅ *Sua Avaliação Física está pronta!*\n\n🧬 *Biótipo:* ${aiData.analysis?.somatotype || ""}\n⚖️ *Gordura Estimada:* ~${aiData.analysis?.body_fat_percentage || ""}%\n💪 *Massa Muscular:* ${aiData.analysis?.muscle_mass_level || ""}\n\n🎯 *Foco:* ${aiData.workout?.focus || ""}`;
      if (aiData.analysis?.evolution_notes) {
          successText += `\n\n📈 *EVOLUÇÃO*\n${aiData.analysis.evolution_notes}`;
      }
      successText += `\n\nSeu plano completo de Dieta e Treino já está disponível no painel. Você pode acessar e baixar o PDF por lá!\n👉 https://foodsnap.com.br`;

      await fetch(`${GRAPH_API}/${META_PHONE_ID}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
          body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: remote_jid,
              type: "text",
              text: { body: successText }
          })
      });

      return { success: true, biotype: aiData.analysis?.somatotype || "" };

  } catch (error: any) {
      console.error("Erro na OpenAI ou Supabase:", error);
      return { success: false, error: error.message };
  }
}
