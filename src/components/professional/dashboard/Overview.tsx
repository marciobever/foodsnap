import React from 'react';
import { StatsCard } from '../common/StatsCard';

export const OverviewMock = () => (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard label="Alunos Ativos" value="24" trend="+3 esse mês" />
            <StatsCard label="Planos Vencendo" value="5" trend="Próx. 7 dias" alert />
            <StatsCard label="Receita Mensal" value="R$ 4.250" trend="+12% vs. anterior" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Atividade Recente</h3>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">US</div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">João Silva finalizou o treino "Hipertrofia A"</p>
                            <p className="text-xs text-gray-500">Há 2 horas • Duração: 45min</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
