import React from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Droplets, Apple, Clock, Pill } from 'lucide-react';
import { MacroCard } from './Shared';

interface DietSectionProps {
    diet: any;
}

const DietSection: React.FC<DietSectionProps> = ({ diet }) => {
    return (
        <div className="space-y-8">
            {/* Macros & Hydration */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MacroCard label="Proteína" value={`${diet?.macros?.protein_g} g`} color="brand" />
                <MacroCard label="Carboidratos" value={`${diet?.macros?.carbs_g} g`} color="blue" />
                <MacroCard label="Gorduras" value={`${diet?.macros?.fats_g} g`} color="yellow" />
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 z-0"></div>
                    <Droplets className="text-blue-500 mb-2 relative z-10" />
                    <span className="text-2xl font-black text-blue-900 relative z-10">{diet?.hydration_liters}L</span>
                    <span className="text-xs font-bold uppercase text-blue-400 relative z-10">Água/Dia</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Meal Plan List */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">Plano Alimentar</h3>
                    <div className="space-y-4">
                        {diet?.meal_plan_example?.map((meal: any, i: number) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group break-inside-avoid">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 leading-tight">{meal.name}</h4>
                                        {meal.time_range && (
                                            <p className="text-sm text-brand-500 font-medium flex items-center gap-1 mt-0.5">
                                                <Clock size={12} /> {meal.time_range}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pl-16 space-y-4">
                                    {/* New Format: Multiple Options */}
                                    {meal.options && Array.isArray(meal.options) ? (
                                        <div className="space-y-2">
                                            {meal.options.map((opt: string, idx: number) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <p className="text-gray-800 font-medium text-sm">{opt}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Legacy Fallback
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-800 font-medium">
                                                {meal.main_option || (meal.options && meal.options[0]) || "Opção Padrão"}
                                            </p>
                                        </div>
                                    )}

                                    {/* Substitution Suggestion */}
                                    {(meal.substitution_suggestion || meal.substitution) && (
                                        <div className="p-3 bg-green-50/50 border border-green-100 rounded-xl flex gap-3 items-start">
                                            <div className="mt-0.5 text-green-600 bg-white rounded-full p-0.5 shadow-sm">
                                                <CheckCircle2 size={12} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-green-700 uppercase mb-0.5">Dica de Substituição</p>
                                                <p className="text-gray-600 text-xs leading-relaxed">
                                                    {meal.substitution_suggestion || meal.substitution}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supplements */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">Suplementação</h3>
                    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden break-inside-avoid">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[60px] opacity-20"></div>
                        <div className="relative z-10 space-y-6">
                            {diet?.supplements?.map((sup: any, i: number) => {
                                // Handle complex object or simple string
                                const name = typeof sup === 'string' ? sup : sup.name;
                                const dosage = typeof sup === 'string' ? '' : sup.dosage;
                                const reason = typeof sup === 'string' ? '' : sup.reason;

                                return (
                                    <div key={i} className="border-l-2 border-brand-500 pl-4 py-1">
                                        <h5 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <Pill size={16} className="text-brand-400" /> {name}
                                        </h5>
                                        {dosage && <p className="text-sm text-gray-300 mb-0.5">{dosage}</p>}
                                        {reason && <p className="text-xs text-gray-500 italic">{reason}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietSection;
