import React, { useMemo } from 'react';
import { Utensils, Droplets, Pill } from 'lucide-react';
import { PdfHeaderRow, safeStr, asArray } from './PdfShared';

function truncate(text: string, max = 140) {
  const t = (text || '').trim();
  if (!t) return '-';
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function pickMeals(diet: any): any[] {
  // ✅ match do frontend
  if (Array.isArray(diet?.meal_plan_example) && diet.meal_plan_example.length) return diet.meal_plan_example;

  // fallback antigos
  const candidates = [
    diet?.meals,
    diet?.meal_plan,
    diet?.plan,
    diet?.daily_plan,
    diet?.diet_plan,
    diet?.meals_plan,
    diet?.mealsPlan,
    diet?.refeicoes,
    diet?.refeicoes_plano,
  ];
  for (const c of candidates) if (Array.isArray(c) && c.length) return c;

  return [];
}

export const PdfDietCompact: React.FC<{ diet: any }> = ({ diet }) => {
  const meals = useMemo(() => pickMeals(diet).slice(0, 6), [diet]); // 6 max pra caber 1 página
  const supplements = asArray(diet?.supplements).slice(0, 6);

  const protein = diet?.macros?.protein_g ?? diet?.protein_g ?? diet?.protein ?? diet?.protein_grams;
  const carbs = diet?.macros?.carbs_g ?? diet?.carbs_g ?? diet?.carbs ?? diet?.carb_grams;
  const fats = diet?.macros?.fats_g ?? diet?.fat_g ?? diet?.fat ?? diet?.fat_grams;
  const water = diet?.hydration_liters ?? diet?.water_liters ?? diet?.hydration;

  return (
    <div className="h-full flex flex-col">
      <PdfHeaderRow
        index="02"
        title="Dieta"
        subtitle="Plano alimentar + suplementação (compacto em 1 página)"
        icon={<Utensils size={42} />}
      />

      {/* Summary row */}
      <div className="rounded-2xl border border-gray-200 p-2 mb-2 avoid-break">
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Calorias/dia</div>
            <div className="text-[12px] font-bold">{Math.round(diet?.total_calories || 0)} kcal</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Proteína</div>
            <div className="text-[12px] font-bold">{safeStr(protein)}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Carbo</div>
            <div className="text-[12px] font-bold">{safeStr(carbs)}</div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Gordura</div>
              <div className="text-[12px] font-bold">{safeStr(fats)}</div>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Droplets size={14} className="text-blue-500" />
              <div className="text-[11px] font-bold text-blue-900">{safeStr(water, '-')}{String(water || '').includes('L') ? '' : 'L'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: meals + supplements */}
      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        {/* Meals (2 cols) */}
        <div className="col-span-2 space-y-2 min-h-0">
          <div className="text-[11px] font-black text-gray-900">Plano Alimentar</div>

          <div className="space-y-2">
            {meals.length ? (
              meals.map((meal: any, i: number) => {
                const options = Array.isArray(meal?.options) ? meal.options : [];
                const opt1 = options?.[0] || meal?.main_option || '';
                const opt2 = options?.[1] || '';

                return (
                  <div key={i} className="rounded-2xl border border-gray-200 p-2 avoid-break">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-extrabold text-gray-900 leading-snug">
                          {safeStr(meal?.name, `Refeição ${i + 1}`)}
                        </div>
                        {meal?.time_range && (
                          <div className="text-[10px] text-brand-700 font-semibold">
                            {safeStr(meal.time_range)}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold">#{i + 1}</div>
                    </div>

                    <div className="mt-1 space-y-1">
                      {opt1 ? (
                        <div className="text-[10px] leading-snug text-gray-800 bg-gray-50 border border-gray-100 rounded-xl p-2">
                          <span className="font-bold text-gray-700">Opção 1: </span>
                          {truncate(String(opt1), 160)}
                        </div>
                      ) : null}

                      {opt2 ? (
                        <div className="text-[10px] leading-snug text-gray-800 bg-gray-50 border border-gray-100 rounded-xl p-2">
                          <span className="font-bold text-gray-700">Opção 2: </span>
                          {truncate(String(opt2), 160)}
                        </div>
                      ) : null}

                      {(meal?.substitution_suggestion || meal?.substitution) ? (
                        <div className="text-[10px] leading-snug text-green-900 bg-green-50/70 border border-green-100 rounded-xl p-2">
                          <span className="font-bold uppercase text-[9px] text-green-800">Dica de substituição:</span>{' '}
                          {truncate(String(meal?.substitution_suggestion || meal?.substitution), 180)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-gray-200 p-3 text-[11px] text-gray-700">
                Não achei <code>diet.meal_plan_example</code>. Se teu JSON mudou, me manda 1 exemplo do <code>diet</code>.
              </div>
            )}
          </div>
        </div>

        {/* Supplements (1 col) */}
        <div className="col-span-1 min-h-0 flex flex-col">
          <div className="text-[11px] font-black text-gray-900 mb-2">Suplementação</div>

          <div className="bg-gray-900 text-white rounded-3xl p-3 flex-1 min-h-0 overflow-hidden avoid-break">
            <div className="space-y-3">
              {supplements.length ? (
                supplements.map((sup: any, i: number) => {
                  const name = typeof sup === 'string' ? sup : sup?.name;
                  const dosage = typeof sup === 'string' ? '' : sup?.dosage;
                  const reason = typeof sup === 'string' ? '' : sup?.reason;

                  return (
                    <div key={i} className="border-l-2 border-brand-500 pl-3">
                      <div className="flex items-center gap-2">
                        <Pill size={14} className="text-brand-300" />
                        <div className="text-[11px] font-bold leading-snug">{truncate(String(name || 'Suplemento'), 40)}</div>
                      </div>
                      {dosage ? <div className="text-[10px] text-gray-200">{truncate(String(dosage), 60)}</div> : null}
                      {reason ? <div className="text-[9px] text-gray-400 italic">{truncate(String(reason), 80)}</div> : null}
                    </div>
                  );
                })
              ) : (
                <div className="text-[10px] text-gray-300">
                  Sem suplementos informados.
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-[10px] text-gray-500 leading-snug">
            Dica: água + consistência diária. Ajustes finos semanais.
          </div>
        </div>
      </div>
    </div>
  );
};
