'use client';

import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Camera, ArrowRight, Sparkles } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/coach-uploads/${path}`;
};

const getStructured = (item: any) => {
    if (!item?.ai_structured) return null;
    return typeof item.ai_structured === 'string' ? JSON.parse(item.ai_structured) : item.ai_structured;
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const DeltaBadge = ({ value, suffix = '', invert = false }: { value: number; suffix?: string; invert?: boolean }) => {
    if (!isFinite(value) || value === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-gray-500 text-sm font-bold">
                <Minus size={14} /> Estável
            </span>
        );
    }

    const isPositive = value > 0;
    // For body fat, a reduction (negative) is usually "good" -> green. invert flips that logic.
    const isGood = invert ? isPositive : !isPositive;

    return (
        <span className={`inline-flex items-center gap-1 text-sm font-bold ${isGood ? 'text-emerald-600' : 'text-orange-600'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{value.toFixed(1)}{suffix}
        </span>
    );
};

interface CoachEvolutionProps {
    coachHistory: any[]; // ordered desc by created_at
}

const CoachEvolution: React.FC<CoachEvolutionProps> = ({ coachHistory }) => {
    // Ascending order (oldest -> newest) for chart and comparison defaults
    const ascending = useMemo(() => [...coachHistory].reverse(), [coachHistory]);

    const withPhotos = useMemo(
        () => ascending.filter((item) => item.image_url || item.images?.front),
        [ascending]
    );

    const [beforeId, setBeforeId] = useState<string | undefined>(withPhotos[0]?.id);
    const [afterId, setAfterId] = useState<string | undefined>(withPhotos[withPhotos.length - 1]?.id);

    const before = withPhotos.find((i) => i.id === beforeId) || withPhotos[0];
    const after = withPhotos.find((i) => i.id === afterId) || withPhotos[withPhotos.length - 1];

    const chartData = ascending
        .filter((item) => item.estimated_body_fat)
        .map((item) => ({
            name: formatDate(item.created_at),
            gordura: Number(item.estimated_body_fat),
        }));

    if (withPhotos.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera size={28} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sua linha do tempo está vazia</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Envie fotos no Coach IA pelo WhatsApp para começar a acompanhar sua evolução com gráficos e comparações.
                </p>
            </div>
        );
    }

    const afterAnalysis = getStructured(after)?.analysis;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Trend Chart */}
            {chartData.length >= 2 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-gray-900 font-bold mb-1">Evolução do % de Gordura</h3>
                    <p className="text-gray-500 text-xs mb-6">Estimativa da IA em cada avaliação</p>
                    <div className="w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGordura" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-10} unit="%" />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#f3f4f6', borderRadius: '8px', color: '#1f2937', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#1f2937' }}
                                    formatter={(value: any) => [`${value}%`, 'Gordura corporal']}
                                />
                                <Area type="monotone" dataKey="gordura" name="Gordura corporal" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGordura)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Before / After comparison */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-gray-900 font-bold mb-1">Comparativo Antes / Depois</h3>
                <p className="text-gray-500 text-xs mb-6">Selecione duas avaliações para comparar suas fotos e indicadores</p>

                {withPhotos.length === 1 ? (
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="w-full max-w-[220px] aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100 mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={getImageUrl(after.image_url || after.images?.front) || ''} alt="Sua avaliação" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-gray-500 text-sm max-w-sm">
                            Essa é sua única avaliação com foto até agora ({formatDate(after.created_at)}). Faça uma nova avaliação daqui a alguns dias para começar a ver sua evolução aqui.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Antes</label>
                                <select
                                    value={beforeId}
                                    onChange={(e) => setBeforeId(e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-medium text-gray-700"
                                >
                                    {withPhotos.map((item) => (
                                        <option key={item.id} value={item.id}>{formatDate(item.created_at)}</option>
                                    ))}
                                </select>
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={getImageUrl(before.image_url || before.images?.front) || ''} alt="Antes" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Depois</label>
                                <select
                                    value={afterId}
                                    onChange={(e) => setAfterId(e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-medium text-gray-700"
                                >
                                    {withPhotos.map((item) => (
                                        <option key={item.id} value={item.id}>{formatDate(item.created_at)}</option>
                                    ))}
                                </select>
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-brand-200 bg-gray-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={getImageUrl(after.image_url || after.images?.front) || ''} alt="Depois" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        {/* Indicators */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">% Gordura</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900">{after.estimated_body_fat ?? '-'}%</span>
                                    {before.estimated_body_fat != null && after.estimated_body_fat != null && (
                                        <DeltaBadge value={Number(after.estimated_body_fat) - Number(before.estimated_body_fat)} suffix="%" />
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Massa Muscular</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <span>{before.muscle_mass_level || '-'}</span>
                                    <ArrowRight size={14} className="text-gray-300" />
                                    <span>{after.muscle_mass_level || '-'}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Biótipo</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <span>{before.biotype || '-'}</span>
                                    <ArrowRight size={14} className="text-gray-300" />
                                    <span>{after.biotype || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* AI evolution notes */}
                {afterAnalysis?.evolution_notes && (
                    <div className="bg-brand-50/60 border border-brand-100 rounded-xl p-4 flex gap-3 items-start">
                        <Sparkles size={18} className="text-brand-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-1">Parecer da IA</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{afterAnalysis.evolution_notes}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Photo timeline */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-gray-900 font-bold mb-1">Linha do Tempo</h3>
                <p className="text-gray-500 text-xs mb-6">Todas as suas avaliações com foto, da mais recente para a mais antiga</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...withPhotos].reverse().map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(item.image_url || item.images?.front) || ''} alt={formatDate(item.created_at)} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-900">{formatDate(item.created_at)}</p>
                                <p className="text-[10px] text-gray-500">{item.estimated_body_fat != null ? `${item.estimated_body_fat}% gordura` : item.biotype}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoachEvolution;
