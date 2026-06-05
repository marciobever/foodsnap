
// ─── Geração de HTML para PDF do Coach (Premium 3 Páginas Compacto) ────────

function truncateText(text: string, max = 500): string {
  const t = (text || "").trim();
  if (!t) return "-";
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

function safeStr(v: any, fallback = "-"): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") return v.trim() || fallback;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : fallback;
  return fallback;
}

export function buildCoachPdfHtml(plan: any): string {
  const diet = plan.diet || {};
  const workout = plan.workout || {};
  const analysis = plan.analysis || {};
  const quote = plan.motivation_quote || "Disciplina é a ponte entre metas e conquistas.";

  // --- Data Prep ---
  const protein = diet.macros?.protein_g ?? "–";
  const carbs = diet.macros?.carbs_g ?? "–";
  const fats = diet.macros?.fats_g ?? "–";
  const water = diet.hydration_liters ?? "–";
  const calories = Math.round(diet.total_calories || 0);

  const somatotype = safeStr(analysis.somatotype);
  const goal = safeStr(workout.focus);
  const split = safeStr(workout.split);

  // Lists
  const positives = (Array.isArray(analysis.strengths) ? analysis.strengths : [])
    .map((x: any) => typeof x === "string" ? x : x?.text).filter(Boolean); // Removed slice limit

  // Map 'weaknesses' to 'improvements' (Prompt returns weaknesses)
  const improvements = (Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [])
    .map((x: any) => typeof x === "string" ? x : x?.text).filter(Boolean);

  const meals: any[] = Array.isArray(diet.meal_plan_example) ? diet.meal_plan_example : [];
  const supplements: any[] = Array.isArray(diet.supplements) ? diet.supplements : [];
  const routine: any[] = Array.isArray(workout.routine) ? workout.routine : [];

  // --- HTML Generators ---

  const positivesHtml = positives.length
    ? `<ul class="list-disc pl-3 space-y-0.5 text-[10px] leading-snug text-gray-700">${positives.map((t: string) => `<li>${truncateText(t, 500)}</li>`).join("")}</ul>`
    : `<p class="text-[10px] text-gray-600">${safeStr(analysis.summary, "Sem detalhes.")}</p>`;

  const improvementsHtml = improvements.length
    ? `<ul class="list-disc pl-3 space-y-0.5 text-[10px] leading-snug text-gray-700">${improvements.map((t: string) => `<li>${truncateText(t, 500)}</li>`).join("")}</ul>`
    : `<p class="text-[10px] text-gray-600">${safeStr(analysis.improvement_summary, "Sem detalhes.")}</p>`;

  const mealsHtml = meals.map((meal: any, i: number) => {
    const options = Array.isArray(meal.options) ? meal.options : [];
    const opt1 = options[0] || meal.main_option || "";
    const opt2 = options[1] || "";
    const sub = meal.substitution_suggestion || meal.substitution || "";

    let html = `<div class="rounded-xl border border-gray-200 p-1.5 avoid-break mb-1">`;
    html += `<div class="flex items-start justify-between gap-2"><div>`;
    html += `<div class="text-[10px] font-extrabold text-gray-900 leading-none">${meal.name || `Refeição ${i + 1}`}</div>`;
    if (meal.time_range) html += `<div class="text-[9px] text-brand-700 font-semibold">${meal.time_range}</div>`;
    html += `</div><div class="text-[9px] text-gray-400 font-bold">#${i + 1}</div></div>`;
    html += `<div class="mt-1 space-y-1">`;
    if (opt1) html += `<div class="text-[9px] leading-tight text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-1"><span class="font-bold text-gray-700">Opção 1: </span>${truncateText(String(opt1), 500)}</div>`;
    if (opt2) html += `<div class="text-[9px] leading-tight text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-1"><span class="font-bold text-gray-700">Opção 2: </span>${truncateText(String(opt2), 500)}</div>`;
    if (sub) html += `<div class="text-[9px] leading-tight text-green-900 bg-green-50/70 border border-green-100 rounded-lg p-1"><span class="font-bold uppercase text-[8px] text-green-800">Substituição:</span> ${truncateText(String(sub), 300)}</div>`;
    html += `</div></div>`;
    return html;
  }).join("");

  const supplementsHtml = supplements.map((sup: any) => {
    const name = typeof sup === "string" ? sup : sup.name || "Suplemento";
    const dosage = typeof sup === "string" ? "" : sup.dosage || "";
    const reason = typeof sup === "string" ? "" : sup.reason || ""; // Added reason if available
    let html = `<div class="border-l-2 border-brand-500 pl-2 mb-1">`;
    html += `<div class="flex items-center gap-1"><span class="text-brand-500 text-[10px]">💊</span><div class="text-[10px] font-bold leading-none">${truncateText(String(name), 100)}</div></div>`;
    if (dosage) html += `<div class="text-[9px] text-gray-500 leading-none mt-0.5">${truncateText(String(dosage), 100)}</div>`;
    if (reason) html += `<div class="text-[8px] text-gray-400 leading-none mt-0.5 italic">${truncateText(String(reason), 150)}</div>`;
    html += `</div>`;
    return html;
  }).join("");

  const daysHtml = routine.map((day: any, idx: number) => {
    const exs: any[] = Array.isArray(day.exercises) ? day.exercises : [];
    const dayName = day.day || day.name || `Dia ${idx + 1}`;
    const muscle = day.muscle_group || day.focus || "";

    const exLines = exs.map((ex: any) => {
      if (typeof ex === "string") return `<li class="text-[9px] text-gray-700 leading-tight break-words">${ex}</li>`;
      const name = ex.name || ex.exercise || "";
      const sets = ex.sets ?? "";
      const reps = ex.reps ?? "";
      const technique = ex.technique || ex.notes || "";
      const sr = [sets ? `${sets}x` : "", reps].filter(Boolean).join(" ");
      const left = [name, sr].filter(Boolean).join(" — ");
      const full = [left, technique].filter(Boolean).join(" • ");
      return `<li class="text-[9px] text-gray-700 leading-tight break-words">${truncateText(full, 500) || "-"}</li>`;
    }).join("");

    return `<div class="rounded-xl border border-gray-200 p-2 overflow-hidden mb-1">
            <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                    <div class="text-[10px] font-black text-gray-900 leading-none truncate">${dayName}</div>
                    <div class="text-[9px] text-gray-500 leading-none">${muscle}</div>
                </div>
                <div class="text-[9px] text-gray-400 font-mono whitespace-nowrap">${workout.split || "Diff"}</div>
            </div>
            <div class="mt-1 space-y-0.5"><ul class="list-disc pl-3 space-y-0.5">${exLines}</ul></div>
        </div>`;
  }).join("");

  // --- Template Compacto ---

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 700: '#0f766e', 900: '#134e4a' }
          },
          fontSize: { xs: '0.6rem', sm: '0.7rem', base: '0.8rem', lg: '1rem', xl: '1.25rem' }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
    
    @page { size: A4; margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    * { box-sizing: border-box; }

    /* Compact A4 Layout */
    .pdf-page {
      width: 210mm;
      height: 297mm;
      padding: 8mm;      /* Padrao 8mm (compacto) */
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
    }
    .pdf-page:last-child { page-break-after: auto; break-after: auto; }
    .avoid-break { break-inside: avoid; page-break-inside: avoid; }
  </style>
</head>

<body>
  <!-- PÁGINA 1: RESUMO -->
  <div class="pdf-root">
    <div class="pdf-page">
      <div class="h-full flex flex-col">
        <div class="flex items-end justify-between border-b border-gray-200 pb-2 mb-2">
           <div>
             <div class="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Protocolo Titan • FoodSnap Coach</div>
             <h2 class="text-xl font-black text-gray-900 leading-tight">01. Diagnóstico</h2>
           </div>
           <div class="text-gray-300 text-2xl">⚡</div>
        </div>
        
        <div class="grid grid-cols-4 gap-2 mb-2">
           <div class="rounded-lg border border-gray-200 p-1.5"><div class="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Biótipo</div><div class="text-[11px] font-bold text-gray-900">${somatotype}</div></div>
           <div class="rounded-lg border border-gray-200 p-1.5"><div class="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Objetivo</div><div class="text-[11px] font-bold text-gray-900">${goal}</div></div>
           <div class="rounded-lg border border-gray-200 p-1.5"><div class="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Calorias</div><div class="text-[11px] font-bold text-gray-900">${calories}</div></div>
           <div class="rounded-lg border border-gray-200 p-1.5"><div class="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Split</div><div class="text-[11px] font-bold text-gray-900">${split}</div></div>
        </div>

        <div class="grid grid-cols-2 gap-2 flex-1 min-h-0">
           <div class="rounded-xl border border-gray-200 p-2 overflow-hidden">
              <div class="text-[10px] font-black text-gray-900 mb-1">Pontos Fortes</div>
              ${positivesHtml}
           </div>
           <div class="rounded-xl border border-gray-200 p-2 overflow-hidden">
              <div class="text-[10px] font-black text-gray-900 mb-1">Melhorias</div>
              ${improvementsHtml}
           </div>
        </div>
        
        <div class="mt-2 rounded-xl border border-gray-200 p-2">
            <p class="text-[9px] text-gray-500 italic text-center">"O sucesso é a soma de pequenos esforços repetidos dia após dia."</p>
        </div>
      </div>
    </div>

    <!-- PÁGINA 2: DIETA -->
    <div class="pdf-page">
      <div class="h-full flex flex-col">
        <div class="flex items-end justify-between border-b border-gray-200 pb-2 mb-2">
           <div><h2 class="text-xl font-black text-gray-900 leading-tight">02. Dieta</h2></div>
           <div class="text-gray-300 text-2xl">🥗</div>
        </div>

        <div class="rounded-lg border border-gray-200 p-1.5 mb-2 avoid-break">
            <div class="flex justify-between items-center text-[10px]">
                <div><span class="text-gray-400 font-bold uppercase">PROT:</span> <span class="font-bold">${protein}</span></div>
                <div><span class="text-gray-400 font-bold uppercase">CARB:</span> <span class="font-bold">${carbs}</span></div>
                <div><span class="text-gray-400 font-bold uppercase">GORD:</span> <span class="font-bold">${fats}</span></div>
                <div class="text-blue-600 font-bold">💧 ${water}L</div>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-2 flex-1 min-h-0">
            <div class="col-span-2 space-y-1 min-h-0">
                <div class="text-[10px] font-black text-gray-900">Refeições</div>
                <div class="space-y-1">${mealsHtml}</div>
            </div>
            <div class="col-span-1 min-h-0 flex flex-col">
                <div class="text-[10px] font-black text-gray-900 mb-1">Suplementos</div>
                <div class="bg-gray-50 rounded-xl p-2 flex-1 min-h-0 overflow-hidden avoid-break border border-gray-100">
                    <div class="space-y-2">${supplementsHtml}</div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- PÁGINA 3: TREINO -->
    <div class="pdf-page">
      <div class="h-full flex flex-col">
        <div class="flex items-end justify-between border-b border-gray-200 pb-2 mb-2">
           <div><h2 class="text-xl font-black text-gray-900 leading-tight">03. Treino</h2></div>
           <div class="text-gray-300 text-2xl">🏋️</div>
        </div>

        <div class="grid grid-cols-2 gap-2 flex-1 min-h-0 overflow-hidden">
            ${daysHtml}
        </div>

        <div class="mt-2 pt-2 border-t border-gray-200 text-center">
             <span class="text-[9px] italic text-gray-400">"${truncateText(quote, 100)}"</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
