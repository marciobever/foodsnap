//nobundling
import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 11: Process Body AI (Dieta e Treino) with OpenAI
 */

function buildCoachPdfHtml(plan: any): string {
  const analysis = plan.analysis || {};
  const diet = plan.diet || {};
  const workout = plan.workout || {};
  const motivation_quote = plan.motivation_quote || "";

  const mealsHtml = (diet.meal_plan_example || []).map((meal: any, i: number) => {
    const opts = (meal.options || []).map((opt: string) => `
      <li class="flex items-start text-gray-700 text-[11.5px] mb-0.5 leading-relaxed">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0"></span>
        <span>${opt}</span>
      </li>
    `).join("");

    return `
      <div style="page-break-inside: avoid; break-inside: avoid;" class="mb-2.5 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <div class="flex justify-between items-center mb-2 pb-1 border-b border-gray-50">
          <h4 class="font-extrabold text-[13px] text-slate-800 tracking-wide uppercase">${meal.name || `Refeição ${i+1}`}</h4>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ${meal.time_range || ""}
          </span>
        </div>
        <ul class="space-y-0.5">${opts}</ul>
        ${meal.substitution_suggestion ? `
          <div class="mt-2.5 p-2 bg-amber-50/50 border-l-2 border-amber-500 text-amber-900 rounded-r-lg text-[10px] leading-relaxed">
            <strong class="text-amber-800 uppercase tracking-wider block mb-0.5 font-bold">Dica de substituição:</strong>
            ${meal.substitution_suggestion}
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  const routineHtml = (workout.routine || []).map((day: any) => {
    const exercises = (day.exercises || []).map((ex: any, idx: number) => `
      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
        <td class="py-1.5 pl-2 text-slate-800 text-[11.5px] font-semibold">${ex.name}</td>
        <td class="py-1.5 px-2 text-center text-indigo-700 text-[11px] font-mono font-bold whitespace-nowrap">${ex.sets}x ${ex.reps}</td>
        <td class="py-1.5 pr-2 text-right text-slate-500 text-[9.5px] italic font-light max-w-[130px] truncate" title="${ex.technique || ''}">${ex.technique || "-"}</td>
      </tr>
    `).join("");

    return `
      <div style="page-break-inside: avoid; break-inside: avoid;" class="mb-3 bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-2 flex justify-between items-center">
          <span class="px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded text-[9px] font-black uppercase tracking-wider text-indigo-300">${day.day}</span>
          <h4 class="font-extrabold text-[12px] text-white tracking-wide uppercase">${day.muscle_group}</h4>
        </div>
        <div class="p-1.5">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <th class="pb-1 pl-2 font-semibold">Exercício</th>
                <th class="pb-1 px-2 text-center font-semibold">Séries/Reps</th>
                <th class="pb-1 pr-2 text-right font-semibold">Técnica</th>
              </tr>
            </thead>
            <tbody>
              ${exercises}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");

  const supplementsHtml = (diet.supplements || []).map((sup: any) => {
    const name = typeof sup === 'string' ? sup : (sup.name || "Suplemento");
    const dosage = typeof sup === 'string' ? '' : (sup.dosage || "");
    const reason = typeof sup === 'string' ? '' : (sup.reason || "");
    return `
      <div class="border-l-2 border-amber-500 pl-2.5 py-1 mb-2.5 bg-slate-800/40 rounded-r-lg p-2.5">
        <div class="font-bold text-[12px] text-amber-400 tracking-wide uppercase">${name}</div>
        ${dosage ? `<div class="text-[10px] text-white mt-0.5 font-semibold font-mono bg-slate-700/50 inline-block px-1.5 py-0.5 rounded">${dosage}</div>` : ""}
        ${reason ? `<div class="text-[9.5px] text-slate-300 italic mt-1 font-light leading-relaxed">${reason}</div>` : ""}
      </div>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c084fc',
              400: '#a855f7', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
              800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
    @page { size: A4; margin: 0; }
    body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact !important; }
    h1, h2, h3, h4 { font-family: 'Montserrat', sans-serif; }
    .pdf-page { width: 210mm; height: 297mm; padding: 10mm; overflow: hidden; page-break-after: always; break-after: page; background: #ffffff; display: flex; flex-direction: column; position: relative; }
    .pdf-page:last-child { page-break-after: auto; break-after: auto; }
    .page-bg-deco { position: absolute; top: 0; right: 0; width: 120mm; height: 120mm; background: radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, rgba(255,255,255,0) 70%); pointer-events: none; z-index: 0; }
  </style>
</head>
<body class="bg-slate-50">

  <!-- PAGE 1: DIETA -->
  <div class="pdf-page bg-white shadow-2xl mx-auto">
    <div class="page-bg-deco"></div>

    <!-- Top Header Bar -->
    <div class="relative z-10 flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-3">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-brand-500 flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div>
          <span class="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[8px] font-black uppercase tracking-widest text-indigo-700">Titan Coach Elite</span>
          <h1 class="text-lg font-black text-slate-800 tracking-tight mt-0.5">BLUEPRINT NUTRICIONAL</h1>
        </div>
      </div>
      <div class="text-right">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Data de Emissão</span>
        <span class="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block mt-0.5">${new Date().toLocaleDateString('pt-BR')}</span>
      </div>
    </div>

    <!-- Macros Info Block -->
    <div class="relative z-10 grid grid-cols-4 gap-3 p-4 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl shadow-xl shadow-slate-900/10 mb-3">
      <div class="border-r border-slate-800 pr-1">
        <span class="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Calorias / Dia</span>
        <div class="text-lg font-black text-white mt-0.5">${diet.total_calories || 0} <span class="text-[9px] font-light text-slate-400">kcal</span></div>
      </div>
      <div class="border-r border-slate-800 pr-1 pl-1">
        <span class="text-[8px] font-extrabold uppercase text-indigo-400 tracking-wider">Proteínas</span>
        <div class="text-lg font-black text-white mt-0.5">${diet.macros?.protein_g || 0} <span class="text-[9px] font-light text-slate-400">g</span></div>
        <div class="w-full bg-slate-800 h-1 rounded-full mt-1"><div class="bg-indigo-500 h-1 rounded-full" style="width: 70%"></div></div>
      </div>
      <div class="border-r border-slate-800 pr-1 pl-1">
        <span class="text-[8px] font-extrabold uppercase text-emerald-400 tracking-wider">Carboidratos</span>
        <div class="text-lg font-black text-white mt-0.5">${diet.macros?.carbs_g || 0} <span class="text-[9px] font-light text-slate-400">g</span></div>
        <div class="w-full bg-slate-800 h-1 rounded-full mt-1"><div class="bg-emerald-500 h-1 rounded-full" style="width: 60%"></div></div>
      </div>
      <div class="pl-1">
        <span class="text-[8px] font-extrabold uppercase text-amber-400 tracking-wider">Gorduras</span>
        <div class="text-lg font-black text-white mt-0.5">${diet.macros?.fats_g || 0} <span class="text-[9px] font-light text-slate-400">g</span></div>
        <div class="w-full bg-slate-800 h-1 rounded-full mt-1"><div class="bg-amber-500 h-1 rounded-full" style="width: 40%"></div></div>
      </div>
    </div>

    <!-- Diet Grid -->
    <div class="relative z-10 grid grid-cols-5 gap-4 flex-1 min-h-0 overflow-hidden">
      <!-- Meals Column -->
      <div class="col-span-3 flex flex-col min-h-0 overflow-hidden">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <h3 class="text-[10px] font-black uppercase text-slate-700 tracking-wider">Cronograma de Refeições</h3>
        </div>
        <div class="flex-1 overflow-y-auto pr-1 select-none">
          ${mealsHtml}
        </div>
      </div>

      <!-- Supplements Column -->
      <div class="col-span-2 flex flex-col min-h-0 overflow-hidden bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-inner">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          <h3 class="text-[10px] font-black uppercase text-white tracking-wider">Suplementação</h3>
        </div>
        <div class="flex-1 overflow-y-auto pr-1">
          ${supplementsHtml}
        </div>
        <!-- Hydration Tip -->
        <div class="mt-2.5 p-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center gap-2.5">
          <div class="w-7 h-7 rounded bg-indigo-500/20 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <div>
            <div class="text-[9px] text-slate-400 font-bold uppercase">Meta de Hidratação</div>
            <div class="text-xs font-bold text-white font-mono mt-0.5">${diet.hydration_liters || 3.0} Litros / Dia</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 2: TREINO -->
  <div class="pdf-page bg-white shadow-2xl mx-auto">
    <div class="page-bg-deco"></div>

    <!-- Top Header Bar -->
    <div class="relative z-10 flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-3">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-brand-500 flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div>
          <span class="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[8px] font-black uppercase tracking-widest text-indigo-700">Titan Coach Elite</span>
          <h1 class="text-lg font-black text-slate-800 tracking-tight mt-0.5">PLANILHA DE TREINO</h1>
        </div>
      </div>
    </div>

    <!-- Summary Info Block -->
    <div class="relative z-10 grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-indigo-950 to-indigo-900 border border-indigo-800 rounded-xl shadow-xl shadow-indigo-900/10 mb-3 text-white">
      <div>
        <span class="text-[8px] font-extrabold uppercase text-indigo-300 tracking-wider">Biótipo Identificado</span>
        <div class="text-sm font-black mt-0.5 text-white tracking-wide uppercase">${analysis.somatotype || "-"}</div>
      </div>
      <div class="border-l border-indigo-800 pl-3">
        <span class="text-[8px] font-extrabold uppercase text-indigo-300 tracking-wider">Foco do Planejamento</span>
        <div class="text-sm font-black mt-0.5 text-white tracking-wide uppercase">${workout.focus || "-"}</div>
      </div>
      <div class="border-l border-indigo-800 pl-3">
        <span class="text-[8px] font-extrabold uppercase text-indigo-300 tracking-wider">Frequência Semanal</span>
        <div class="text-sm font-black mt-0.5 text-white tracking-wide uppercase">${workout.frequency_days || 0} dias / semana</div>
      </div>
    </div>

    <!-- Workout Grid -->
    <div class="relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m4-1c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        <h3 class="text-[10px] font-black uppercase text-slate-700 tracking-wider">Divisão Semanal</h3>
      </div>
      <div class="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-3">
        ${routineHtml}
      </div>
    </div>

    <!-- Footer Quote -->
    <div class="relative z-10 mt-3.5 p-2 border-t border-slate-100 flex items-center justify-center text-center">
      <div class="max-w-lg">
        <span class="text-[14px] text-indigo-400 font-serif font-black block leading-none mb-0.5">“</span>
        <p class="text-[10px] italic text-slate-500 leading-relaxed font-medium">
          ${motivation_quote}
        </p>
        <span class="text-[14px] text-indigo-400 font-serif font-black block leading-none mt-0.5">”</span>
      </div>
    </div>
  </div>

</body>
</html>
  `;
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
    "evolution_notes": "Análise técnica do físico com dicas práticas de evolução estruturadas em tópicos (usando hifens '-').",
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
6. Se a imagem não for um corpo analisável, retorne "valid_body": false.`;

  try {
      const openaiUrl = "https://api.openai.com/v1/chat/completions";

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
                      content: [
                          {
                              type: "image_url",
                              image_url: {
                                  url: `data:${mimeType};base64,${base64Img}`,
                                  detail: "high"
                              }
                          }
                      ]
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
              ai_structured: aiData
          })
          .select("id")
          .single();

      // 5.1 Geração do PDF profissional (Gotenberg/n8n)
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
      const successText = `✅ *Sua Avaliação Física está pronta!*\n\n🧬 *Biótipo:* ${aiData.analysis?.somatotype || ""}\n⚖️ *Gordura Estimada:* ~${aiData.analysis?.body_fat_percentage || ""}%\n💪 *Massa Muscular:* ${aiData.analysis?.muscle_mass_level || ""}\n\n🎯 *Foco:* ${aiData.workout?.focus || ""}\n\nSeu plano completo de Dieta e Treino já está disponível no painel. Você pode acessar e baixar o PDF por lá!\n👉 https://foodsnap.com.br`;

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
