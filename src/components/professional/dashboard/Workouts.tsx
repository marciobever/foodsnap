import React from 'react';
import { Dumbbell, Settings, PlusCircle } from 'lucide-react';

export const WorkoutsMock = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {['Hipertrofia Iniciante', 'Emagrecimento Avançado', 'Funcional Idosos'].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-brand-300 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Dumbbell size={24} />
                    </div>
                    <button className="text-gray-400 hover:text-gray-600"><Settings size={18} /></button>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{t}</h3>
                <p className="text-sm text-gray-500 mb-4">30 alunos vinculados</p>
                <div className="flex gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">ABC</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">45-60min</span>
                </div>
            </div>
        ))}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all cursor-pointer min-h-[200px]">
            <PlusCircle size={32} className="mb-2" />
            <span className="font-bold">Criar Novo Treino</span>
        </div>
    </div>
);
