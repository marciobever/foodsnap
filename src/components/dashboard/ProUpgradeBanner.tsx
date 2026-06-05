'use client';

import React, { useState } from 'react';
import { Zap, ShieldCheck, BrainCircuit, LineChart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProUpgradeBannerProps {
    onUpgradeClick?: () => void; // fallback (e.g. navigate to sub tab)
}

export default function ProUpgradeBanner({ onUpgradeClick }: ProUpgradeBannerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async () => {
        setLoading(true);
        window.location.href = '/checkout';
    };

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-10 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

            <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/10 rounded-md mb-4">
                    <Zap size={14} className="text-brand-400" fill="currentColor" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">FoodSnap Premium</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    Desbloqueie todo o potencial da IA
                </h3>
                <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                    Membros PRO têm acesso a análises ilimitadas de pratos, gráficos de tendência avançados e acompanhamento personalizado com a Inteligência Artificial.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                        <ShieldCheck size={16} className="text-brand-400" /> Análises Ilimitadas
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                        <LineChart size={16} className="text-brand-400" /> Histórico Completo
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                        <BrainCircuit size={16} className="text-brand-400" /> Coach IA
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col gap-2">
                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3.5 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Zap size={18} fill="currentColor" />
                    )}
                    {loading ? 'Aguarde...' : 'Fazer Upgrade para PRO'}
                </button>
                <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-semibold">
                    Cancele quando quiser
                </p>
                {error && (
                    <p className="text-[11px] text-red-400 text-center mt-1">{error}</p>
                )}
            </div>
        </div>
    );
}
