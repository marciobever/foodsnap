'use client';
import React, { useState } from 'react';
import { Calendar, Activity, ChevronUp, ChevronDown, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutSectionProps {
    workout: any;
}

const WorkoutSection: React.FC<WorkoutSectionProps> = ({ workout }) => {
    const [openInjury, setOpenInjury] = useState(false);

    return (
        <div className="space-y-8">
            {/* Workout Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Estrutura de Treino</h3>
                        <p className="text-4xl font-black text-gray-900">{workout?.split}</p>
                        <p className="text-brand-600 font-medium">{workout?.frequency_days} dias na semana</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Calendar className="text-gray-900" size={32} />
                    </div>
                </div>

                {/* Injury Adaptations Accordion - Only show if data exists */}
                {workout?.injury_adaptations && (
                    <div className="flex-1 bg-red-50 p-6 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100/80 transition-colors" onClick={() => setOpenInjury(!openInjury)}>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-red-900 flex items-center gap-2">
                                <Activity size={20} /> Adaptações para Dores?
                            </h4>
                            {openInjury ? <ChevronUp className="text-red-700" /> : <ChevronDown className="text-red-700" />}
                        </div>
                        <p className="text-red-700/70 text-sm mb-4">Clique para ver exercícios alternativos.</p>

                        <AnimatePresence>
                            {openInjury && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-3 pt-2 border-t border-red-200">
                                        {Object.entries(workout.injury_adaptations).map(([key, val]: any) => (
                                            <div key={key}>
                                                <span className="text-xs font-bold uppercase text-red-800 block mb-1">
                                                    {key === 'knee_pain' ? 'Dor no Joelho' : key === 'shoulder_pain' ? 'Dor no Ombro' : 'Dor nas Costas'}
                                                </span>
                                                <p className="text-sm text-red-900 font-medium bg-white/50 p-2 rounded-lg">{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Routine Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workout?.routine?.map((day: any, i: number) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group break-inside-avoid">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                                    {day.day}
                                </span>
                                <h4 className="text-xl font-bold text-gray-900">{day.muscle_group}</h4>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center">
                                <Dumbbell size={18} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {day.exercises?.map((ex: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors border border-transparent hover:border-brand-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-gray-900 text-sm">{ex.name}</p>
                                        <div className="flex gap-2 text-xs font-mono text-gray-500">
                                            <span className="font-bold text-brand-700">{ex.sets}x</span>
                                            <span>{ex.reps}</span>
                                        </div>
                                    </div>
                                    {ex.technique && <p className="text-xs text-gray-400 line-clamp-1">{ex.technique}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkoutSection;
