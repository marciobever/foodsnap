import React, { useState } from 'react';
import { Sparkles, Zap, Activity, ShieldAlert, TrendingUp, ListChecks } from 'lucide-react';
import CoachResult from '@/components/coach/CoachResult';
import CoachEvolution from '@/components/coach/CoachEvolution';
import { Tab } from '@/components/coach/Shared';

interface DashboardCoachProps {
    coachPlan: any;
    setCoachPlan: (plan: any) => void;
    coachHistory?: any[]; 
    setIsCoachWizardOpen: (open: boolean) => void;
    userPlan: 'free' | 'pro' | 'trial';
    user: any; 
}

const DashboardCoach: React.FC<DashboardCoachProps> = ({ coachPlan, setCoachPlan, coachHistory = [], setIsCoachWizardOpen, userPlan, user }) => {
    const isPaid = userPlan === 'pro' || userPlan === 'trial';
    const [view, setView] = useState<'history' | 'evolution'>('history');

    // ─────────────────────────────────────────────────────────────────────────────
    // STATE 1: NO HISTORY (HERO / ONBOARDING)
    // ─────────────────────────────────────────────────────────────────────────────
    if (!coachHistory || coachHistory.length === 0) {
        return (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-700 space-y-6 font-sans">
                {/* Header */}
                <div className="bg-white rounded-xl p-8 md:p-10 relative overflow-hidden text-gray-900 border border-gray-100 shadow-sm">
                    <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full border border-brand-100 mb-6 text-brand-600">
                            <Sparkles size={14} />
                            <span className="text-xs font-bold uppercase tracking-wide">AI Personal Trainer</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">
                            Seu Corpo, <br />
                            <span className="text-brand-500">
                                Sua Melhor Versão.
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Chega de treinos genéricos. Nossa IA analisa seu biótipo e cria um protocolo 100% científico e adaptado para você.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            {isPaid ? (
                                <button
                                    onClick={() => setIsCoachWizardOpen(true)}
                                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    <Zap size={18} fill="currentColor" />
                                    Gerar Novo Protocolo
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="px-6 py-3 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg font-bold flex items-center gap-2 cursor-not-allowed"
                                >
                                    <Zap size={18} />
                                    Disponível no Plano PRO
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STATE 2: COACH RESULT (CONTENT ONLY)
    // ─────────────────────────────────────────────────────────────────────────────

    // 🔒 FREE PLAN LOCK
    if (!isPaid) {
        return (
            <div className="w-full animate-in fade-in duration-500">
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center h-[400px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-200">
                        <ShieldAlert size={32} className="text-brand-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Funcionalidade PRO</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
                        O Personal IA está disponível apenas para membros PRO. Desbloqueie todo o potencial do seu corpo agora.
                    </p>

                    <button
                        onClick={() => {
                            const subTab = document.querySelector('[data-tab="subscription"]') as HTMLElement;
                            if (subTab) subTab.click();
                            else window.location.reload();
                        }}
                        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Zap size={18} fill="currentColor" />
                        Fazer Upgrade Agora
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in duration-500 space-y-6 font-sans">
            {coachPlan ? (() => {
                const structured = coachPlan.ai_structured
                    ? (typeof coachPlan.ai_structured === 'string' ? JSON.parse(coachPlan.ai_structured) : coachPlan.ai_structured)
                    : null;
                
                const displayData = structured || {
                    analysis: { 
                        somatotype: coachPlan.biotype, 
                        body_fat_percentage: coachPlan.estimated_body_fat, 
                        muscle_mass_level: coachPlan.muscle_mass_level 
                    },
                    diet: { 
                        meal_plan_example: [{ name: "Diretrizes", options: [coachPlan.diet_plan] }],
                        total_calories: 0 
                    },
                    workout: { 
                        focus: coachPlan.goal_suggestion, 
                        split: "-", 
                        routine: [{ day: "Resumo Geral", exercises: [{ name: coachPlan.workout_plan }] }] 
                    },
                    motivation_quote: "Disciplina é a ponte entre metas e conquistas."
                };

                return (
                    <CoachResult
                        data={displayData}
                        onReset={() => setCoachPlan(null)}
                    />
                );
            })() : (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-2xl font-bold text-gray-900">Seu Coach</h3>
                        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1 w-fit">
                            <Tab
                                active={view === 'history'}
                                onClick={() => setView('history')}
                                icon={<ListChecks size={18} />}
                                label="Avaliações"
                            />
                            <Tab
                                active={view === 'evolution'}
                                onClick={() => setView('evolution')}
                                icon={<TrendingUp size={18} />}
                                label="Evolução"
                            />
                        </div>
                    </div>

                    {view === 'history' ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coachHistory.map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => setCoachPlan(item)}
                                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-brand-50 p-3 rounded-lg text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                            <Activity size={24} />
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-1">Avaliação Física</h4>
                                    <p className="text-sm text-gray-500 mb-4">{item.biotype} • Foco: {item.goal_suggestion}</p>
                                    <div className="flex items-center text-brand-600 text-sm font-bold">
                                        Ver Detalhes <Zap size={14} className="ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <CoachEvolution coachHistory={coachHistory} />
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardCoach;
