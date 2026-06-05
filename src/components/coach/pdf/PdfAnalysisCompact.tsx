import React from 'react';
import { Activity } from 'lucide-react';
import { PdfHeaderRow, safeStr, asArray } from './PdfShared';

export const PdfAnalysisCompact: React.FC<{ data: any }> = ({ data }) => {
    const a = data?.analysis || {};
    const d = data?.diet || {};
    const w = data?.workout || {};

    const bullets = asArray(
        a?.improvements ||
        a?.what_to_improve ||
        a?.improve ||
        a?.recommendations ||
        a?.tips ||
        a?.notes ||
        a?.observations ||
        []
    )
        .map((x: any) => (typeof x === 'string' ? x : safeStr(x?.text, '')))
        .filter(Boolean)
        .slice(0, 8);

    const positives = asArray(a?.strengths || a?.positives || a?.good_points || a?.pontos_fortes || [])
        .map((x: any) => (typeof x === 'string' ? x : safeStr(x?.text, '')))
        .filter(Boolean)
        .slice(0, 6);

    return (
        <div className="h-full">
            <PdfHeaderRow
                index="01"
                title="Resumo & Diagnóstico"
                subtitle="Resumo das fotos, pontos fortes e o que melhorar (compacto)"
                icon={<Activity size={42} />}
            />

            <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="rounded-xl border border-gray-200 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Biótipo</div>
                    <div className="text-[12px] font-bold text-gray-900">{safeStr(a?.somatotype)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Objetivo</div>
                    <div className="text-[12px] font-bold text-gray-900">{safeStr(w?.focus)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Calorias</div>
                    <div className="text-[12px] font-bold text-gray-900">
                        {Math.round(d?.total_calories || 0)} kcal
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Estrutura</div>
                    <div className="text-[12px] font-bold text-gray-900">{safeStr(w?.split)}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200 p-3">
                    <div className="text-[11px] font-black text-gray-900 mb-2">Pontos fortes</div>
                    {positives.length ? (
                        <ul className="list-disc pl-4 space-y-1 text-[11px] leading-snug text-gray-700">
                            {positives.map((t: string, i: number) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[11px] text-gray-600">
                            {safeStr(a?.summary || a?.overview || a?.diagnosis || a?.diagnostico, 'Sem detalhes extras.')}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200 p-3">
                    <div className="text-[11px] font-black text-gray-900 mb-2">O que melhorar</div>
                    {bullets.length ? (
                        <ul className="list-disc pl-4 space-y-1 text-[11px] leading-snug text-gray-700">
                            {bullets.map((t: string, i: number) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[11px] text-gray-600">
                            {safeStr(a?.improvement_summary || a?.next_steps || a?.proximos_passos, 'Sem detalhes extras.')}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 rounded-2xl border border-gray-200 p-3">
                <div className="text-[11px] font-black text-gray-900 mb-1">Notas rápidas</div>
                <p className="text-[11px] leading-snug text-gray-700">
                    {safeStr(
                        a?.final_note || a?.note || a?.observacao_final || a?.closing,
                        'Consistência diária > perfeição. Foque em execução e acompanhamento.'
                    )}
                </p>
            </div>
        </div>
    );
};
