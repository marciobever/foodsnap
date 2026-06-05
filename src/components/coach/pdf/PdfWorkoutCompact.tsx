import React, { useMemo } from 'react';
import { Dumbbell, Quote } from 'lucide-react';
import { PdfHeaderRow, safeStr, asArray } from './PdfShared';

function pickRoutine(workout: any) {
  // ✅ SHAPE REAL DO FRONTEND (WorkoutSection usa workout.routine)
  const r = workout?.routine ?? workout?.days ?? workout?.plan ?? [];
  return Array.isArray(r) ? r : [];
}

function pickExercises(day: any) {
  const ex = day?.exercises ?? day?.items ?? day?.workout ?? [];
  return Array.isArray(ex) ? ex : [];
}

function exLine(ex: any) {
  if (typeof ex === 'string') return ex;

  const name = safeStr(ex?.name || ex?.exercise || ex?.movimento, '');
  const sets = ex?.sets ?? ex?.series;
  const reps = ex?.reps ?? ex?.repetitions;
  const technique = safeStr(ex?.technique || ex?.notes || ex?.cue, '');

  const sr: string[] = [];
  if (sets !== undefined && sets !== null && String(sets).trim() !== '') sr.push(`${sets}x`);
  if (reps !== undefined && reps !== null && String(reps).trim() !== '') sr.push(`${reps}`);

  const left = [name, sr.length ? sr.join(' ') : ''].filter(Boolean).join(' — ');
  return [left, technique].filter(Boolean).join(' • ') || '-';
}

export const PdfWorkoutCompact: React.FC<{ workout: any; quote?: string }> = ({ workout, quote }) => {
  const days = useMemo(() => pickRoutine(workout).slice(0, 5), [workout]);

  return (
    <div className="h-full flex flex-col">
      <PdfHeaderRow
        index="03"
        title="Treino"
        subtitle="Rotina (resumo de execução + foco por dia)"
        icon={<Dumbbell size={42} />}
      />

      {/* Top summary */}
      <div className="rounded-2xl border border-gray-200 p-2 mb-3">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Split</div>
            <div className="text-[12px] font-bold text-gray-900">{safeStr(workout?.split)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Frequência</div>
            <div className="text-[12px] font-bold text-gray-900">{safeStr(workout?.frequency_days, '-')} dias</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Objetivo</div>
            <div className="text-[12px] font-bold text-gray-900">{safeStr(workout?.focus)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Duração</div>
            <div className="text-[12px] font-bold text-gray-900">{safeStr(workout?.duration || '4–8 semanas')}</div>
          </div>
        </div>
      </div>

      {/* Day cards (muito mais bonito que tabela) */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 overflow-hidden">
        {days.length ? (
          days.map((day: any, idx: number) => {
            const exs = pickExercises(day).slice(0, 5);
            const dayName = safeStr(day?.day || day?.name || day?.title || `Dia ${idx + 1}`, `Dia ${idx + 1}`);
            const muscle = safeStr(day?.muscle_group || day?.focus || day?.grupo, '');

            return (
              <div key={idx} className="rounded-2xl border border-gray-200 p-3 overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-gray-900 leading-tight truncate">{dayName}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{muscle}</div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{safeStr(workout?.split, '')}</div>
                </div>

                <div className="mt-2 space-y-1">
                  {exs.length ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {exs.map((ex: any, i: number) => (
                        <li key={i} className="text-[10px] text-gray-700 leading-snug break-words">
                          {exLine(ex)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-[10px] text-gray-600">Treino do dia não detalhado.</div>
                  )}
                </div>

                {day?.technique_focus ? (
                  <div className="mt-2 text-[10px] text-gray-500 leading-snug">
                    <span className="font-bold text-gray-600">Técnica:</span> {safeStr(day?.technique_focus, '-')}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="text-[11px] text-gray-600 leading-snug col-span-2">
            Rotina não detalhada neste relatório.
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-500">
        <Quote size={14} />
        <span className="text-[10px] italic">"{quote || 'Disciplina é a ponte entre metas e conquistas.'}"</span>
      </div>
    </div>
  );
};
