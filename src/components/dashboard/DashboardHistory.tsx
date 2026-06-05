import React, { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronUp, AlertTriangle, Scale, Zap, Target } from 'lucide-react';
import Image from 'next/image';

interface DashboardHistoryProps {
    history: any[];
    loadingHistory: boolean;
    t: any;
    fallbackImage: string;
}

const DashboardHistory: React.FC<DashboardHistoryProps> = ({ history, loadingHistory, t, fallbackImage }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            <header className="mb-8 flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Histórico de Escaneamentos</h1>
                <p className="text-gray-500 text-sm">Todos os seus pratos analisados pela Inteligência Artificial.</p>
            </header>

            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar pratos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-400 text-sm" 
                    />
                </div>
            </div>

            {loadingHistory ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" size={32} /></div>
            ) : history.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm font-medium">Nenhum escaneamento encontrado</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history
                        .filter(item => {
                            if (!searchTerm) return true;
                            const term = searchTerm.toLowerCase();
                            return (item.food_name || '').toLowerCase().includes(term) || (item.category || '').toLowerCase().includes(term);
                        })
                        .map(item => {
                        const isExpanded = expandedId === item.id;
                        const ai = typeof item.ai_structured === 'string' 
                            ? JSON.parse(item.ai_structured) 
                            : (item.ai_structured || {});

                        const fiberVal = item.total_fiber || ai.fiber;
                        const sodiumVal = item.total_sodium_mg || ai.sodium;

                        return (
                            <div 
                                key={item.id} 
                                onClick={() => toggleExpand(item.id)}
                                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:border-brand-200 transition-all duration-200 group cursor-pointer select-none"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <div className="shrink-0 relative w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                        <Image
                                            src={item.img || fallbackImage}
                                            alt={item.food_name || item.category}
                                            fill
                                            onError={(e: any) => {
                                                const target = e.currentTarget;
                                                if (target.src !== fallbackImage) {
                                                    target.src = fallbackImage;
                                                }
                                            }}
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {item.score > 0 && (
                                            <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-white ${item.score >= 8 ? 'bg-green-500' : (item.score >= 5 ? 'bg-yellow-500' : 'bg-red-500')}`}>
                                                {item.score}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{item.food_name || item.category}</h4>
                                                {item.coach_feedback && <p className="text-xs text-gray-500 mt-1 italic">"{item.coach_feedback}"</p>}
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <div className="bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-md flex gap-1.5 items-center">
                                                <span className="text-[10px] font-bold text-brand-600">KCAL</span>
                                                <span className="text-xs font-bold text-brand-700">{item.calories}</span>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md flex gap-1.5 items-center">
                                                <span className="text-[10px] font-semibold text-gray-500">PROT</span>
                                                <span className="text-xs font-semibold text-gray-700">{item.protein}g</span>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md flex gap-1.5 items-center">
                                                <span className="text-[10px] font-semibold text-gray-500">CARB</span>
                                                <span className="text-xs font-semibold text-gray-700">{item.carbs}g</span>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md flex gap-1.5 items-center">
                                                <span className="text-[10px] font-semibold text-gray-500">GORD</span>
                                                <span className="text-xs font-semibold text-gray-700">{item.fat}g</span>
                                            </div>
                                            {fiberVal > 0 && (
                                                <div className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md flex gap-1.5 items-center">
                                                    <span className="text-[10px] font-semibold text-emerald-600">FIBRA</span>
                                                    <span className="text-xs font-semibold text-emerald-700">{fiberVal}g</span>
                                                </div>
                                            )}
                                            {sodiumVal > 0 && (
                                                <div className="bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md flex gap-1.5 items-center">
                                                    <span className="text-[10px] font-semibold text-amber-600">SÓDIO</span>
                                                    <span className="text-xs font-semibold text-amber-700">{sodiumVal}mg</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-gray-400 group-hover:text-brand-500 transition-colors p-2 self-end sm:self-center">
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {/* Left Column: Alerts & Swaps */}
                                        <div className="space-y-4">
                                            {ai.alerts && ai.alerts.length > 0 && (
                                                <div>
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5">
                                                        <AlertTriangle size={14} /> Alertas de Saúde
                                                    </h5>
                                                    <ul className="space-y-1.5">
                                                        {ai.alerts.map((alert: string, idx: number) => (
                                                            <li key={idx} className="text-xs text-gray-700 bg-red-50/50 border-l-2 border-red-500 px-2.5 py-1 rounded-r-md">
                                                                {alert}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {ai.swap_suggestions && ai.swap_suggestions.length > 0 && (
                                                <div>
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1.5">
                                                        <Zap size={14} /> Substituições Recomendadas
                                                    </h5>
                                                    <ul className="space-y-1.5">
                                                        {ai.swap_suggestions.map((swap: string, idx: number) => (
                                                            <li key={idx} className="text-xs text-gray-700 bg-emerald-50/50 border-l-2 border-emerald-500 px-2.5 py-1 rounded-r-md">
                                                                {swap}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {(!ai.alerts || ai.alerts.length === 0) && (!ai.swap_suggestions || ai.swap_suggestions.length === 0) && (
                                                <div className="text-xs text-gray-500 italic flex items-center gap-1.5">
                                                    Sem alertas ou sugestões extras para este prato. Bom apetite!
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Metabolic Indexes & Goal Fit */}
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                                                    <Scale size={14} /> Índices Metabólicos
                                                </h5>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                                                        <span className="text-gray-500 block mb-0.5 text-[9px] uppercase font-semibold">Peso Estimado</span>
                                                        <span className="font-bold text-gray-800">{ai.estimated_weight_g || '-'}g</span>
                                                    </div>
                                                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                                                        <span className="text-gray-500 block mb-0.5 text-[9px] uppercase font-semibold">Duração da Energia</span>
                                                        <span className="font-bold text-gray-800">{ai.energy_duration_minutes ? `~${ai.energy_duration_minutes} min` : '-'}</span>
                                                    </div>
                                                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                                                        <span className="text-gray-500 block mb-0.5 text-[9px] uppercase font-semibold">Índice Glicêmico</span>
                                                        <span className="font-bold text-gray-800 capitalize">{ai.glycemic_index || '-'}</span>
                                                    </div>
                                                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                                                        <span className="text-gray-500 block mb-0.5 text-[9px] uppercase font-semibold">Saciedade</span>
                                                        <span className="font-bold text-gray-800 capitalize">{ai.satiety_index || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {ai.goal_fit && (
                                                <div>
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                                                        <Target size={14} /> Adequação por Objetivo
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {Object.entries(ai.goal_fit).map(([goal, val]: any) => {
                                                            const percent = val * 10;
                                                            const colors: any = {
                                                                emagrecer: 'bg-emerald-500',
                                                                ganhar_massa: 'bg-indigo-500',
                                                                manter: 'bg-amber-500'
                                                            };
                                                            const labels: any = {
                                                                emagrecer: 'Emagrecimento',
                                                                ganhar_massa: 'Ganho de Massa',
                                                                manter: 'Manutenção'
                                                            };
                                                            return (
                                                                <div key={goal} className="text-xs">
                                                                    <div className="flex justify-between text-gray-600 mb-1">
                                                                        <span className="font-medium text-[11px]">{labels[goal] || goal}</span>
                                                                        <span className="font-bold">{val}/10</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                                        <div className={`${colors[goal] || 'bg-brand-500'} h-full rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DashboardHistory;

