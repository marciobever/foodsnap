'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, ChevronRight, Check, AlertCircle, Loader2, Dumbbell, Apple, Activity, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface CoachWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: any) => void;
    coachHistory?: any[];
}

type Step = 'photos' | 'goal' | 'processing';

const CoachWizard: React.FC<CoachWizardProps> = ({ isOpen, onClose, onComplete, coachHistory = [] }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<Step>('photos');
    const [photos, setPhotos] = useState<{ front?: string }>({});
    const [goal, setGoal] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

    const loadingMessages = t.coach.processing.steps;

    useEffect(() => {
        let interval: any;
        if (step === 'processing' && !errorMessage) {
            interval = setInterval(() => {
                setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [step, errorMessage]);

    // Refs for different input types
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [activePhotoField, setActivePhotoField] = useState<'front' | null>(null);

    if (!isOpen) return null;

    // --- Image Processing Helper (Resize & Compress) ---
    const processImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024; // Resize to max 1024px width for AI/Backend limit
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                    const height = (scaleSize < 1) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.7 quality
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedDataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activePhotoField) {
            const file = e.target.files[0];
            try {
                setLoading(true); // Show momentary loading for compression
                const compressedImage = await processImage(file);
                setPhotos(prev => ({ ...prev, [activePhotoField]: compressedImage }));
                setActivePhotoField(null);
            } catch (error) {
                console.error("Error processing image:", error);
                alert("Erro ao processar a imagem. Tente outra.");
            } finally {
                setLoading(false);
                // Reset inputs to allow selecting same file again if needed
                if (fileInputRef.current) fileInputRef.current.value = "";
                if (cameraInputRef.current) cameraInputRef.current.value = "";
            }
        }
    };

    const triggerUpload = (field: 'front', source: 'gallery' | 'camera') => {
        setActivePhotoField(field);
        if (source === 'gallery') {
            setTimeout(() => fileInputRef.current?.click(), 0);
        } else {
            setTimeout(() => cameraInputRef.current?.click(), 0);
        }
    };

    const handleNext = () => {
        if (step === 'photos') {
            if (photos.front) setStep('goal');
            else alert("Por favor, adicione uma foto de corpo inteiro para garantir a precisão da análise.");
        } else if (step === 'goal') {
            if (goal) startProcessing();
        }
    };

    const startProcessing = async () => {
        setStep('processing');
        setLoading(true);
        setErrorMessage(null);

        try {
            // Extrair contexto histórico
            let last_evaluation = '';
            if (coachHistory && coachHistory.length > 0) {
                const lastRecord = coachHistory[0]; // Assumindo ordenado por mais recente

                // Parse AI structured para extrair os dados importantes
                let parsedAi: any = null;
                if (typeof lastRecord.ai_structured === 'string') {
                    try { parsedAi = JSON.parse(lastRecord.ai_structured); } catch (e) { }
                } else {
                    parsedAi = lastRecord.ai_structured;
                }

                if (parsedAi && parsedAi.analysis) {
                    const bf = parsedAi.analysis.body_fat_percentage;
                    const date = new Date(lastRecord.created_at).toLocaleDateString('pt-BR');

                    last_evaluation = `Avaliação Anterior (${date}): `;
                    if (bf) last_evaluation += `Percentual de Gordura Estimado: ${bf}%. `;
                    if (parsedAi.analysis.muscle_mass_level) last_evaluation += `Massa Muscular: ${parsedAi.analysis.muscle_mass_level}. `;
                    if (parsedAi.analysis.strengths) last_evaluation += `Pontos Fortes: ${parsedAi.analysis.strengths.join(', ')}. `;
                }
            }

            // Create a timeout promise that rejects after 55 seconds
            const timeoutPromise = new Promise((_, reject) => {
                const id = setTimeout(() => {
                    clearTimeout(id);
                    reject(new Error(t.coach.processing.wait));
                }, 55000); // 55s strict timeout
            });

            const payload: any = { photos, goal, intent: 'coach' };
            if (last_evaluation) {
                payload.last_evaluation = last_evaluation;
            }

            // Race between the API call and the timeout
            const response: any = await Promise.race([
                supabase.functions.invoke('coach-generator', {
                    body: payload
                }),
                timeoutPromise
            ]);

            // If we get here, it means the API responded before timeout
            const { data, error } = response;


            if (error) {
                console.error("Supabase Invoke Error:", error);
                // A mensagem padrão do supabase-js ("Edge Function returned a non-2xx
                // status code") não diz o motivo real. O corpo da resposta (em
                // error.context, um Response) traz { error: "motivo real" }.
                let errorMsg = "Falha na comunicação com a IA.";
                if (error?.context && typeof error.context.json === 'function') {
                    try {
                        const body = await error.context.json();
                        if (body?.error) errorMsg = body.error;
                    } catch (parseErr) {
                        console.error("Erro ao ler corpo do erro:", parseErr);
                    }
                } else if (error && typeof error === 'object' && 'message' in error) {
                    errorMsg = (error as any).message;
                }
                throw new Error(errorMsg);
            }

            if (!data) {
                throw new Error("Nenhuma resposta recebida da IA.");
            }

            console.log("Coach Result:", data);

            // Validate essential data presence
            if (!data.analysis || !data.diet || !data.workout) {
                throw new Error("A resposta da IA veio incompleta. Tente com fotos mais claras.");
            }

            onComplete(data);
            onClose();

        } catch (err: any) {
            console.error("Coach Logic Error:", err);

            let message = "Erro ao gerar protocolo. Verifique sua conexão e tente novamente.";
            if (err.name === 'AbortError') message = "O servidor demorou muito para responder. Tente fotos menores.";
            if (err.message) message = err.message;

            setErrorMessage(message);
            // Don't auto-close, let user see error and retry
        } finally {
            setLoading(false);
            // If error, stay on processing step or go back? 
            // Better to show error on processing screen with a "Retry" button or "Back"
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20 ring-1 ring-black/5"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-brand-600" />
                            {t.coach.title}
                        </h2>
                        <p className="text-sm text-gray-500">{t.coach.subtitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">

                    <AnimatePresence mode="wait">
                        {step === 'photos' && (
                            <motion.div
                                key="photos"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-blue-50/50 text-blue-800 p-4 rounded-2xl text-sm flex gap-3 items-start border border-blue-100/50">
                                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                    <p>
                                        <strong>{t.coach.photosStep.alert.split(':')[0]}:</strong> {t.coach.photosStep.alert.split(':')[1]}
                                    </p>
                                </div>

                                <div className="max-w-xs mx-auto">
                                    <div className="flex flex-col gap-2">
                                        <p className="font-bold text-gray-700 capitalize text-center text-sm tracking-wide">
                                            {t.coach.photosStep.front}
                                        </p>
                                        <div className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300
                                            ${photos.front
                                                ? 'border-brand-500 bg-gray-50'
                                                : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50 hover:shadow-lg'
                                            }
                                        `}>
                                            {photos.front ? (
                                                <>
                                                    <img src={photos.front} className="absolute inset-0 w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-4">
                                                        <button
                                                            onClick={() => triggerUpload('front', 'camera')}
                                                            className="bg-white text-gray-900 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 w-full justify-center hover:bg-brand-50 transition-colors shadow-lg"
                                                        >
                                                            <Camera size={14} /> {t.coach.photosStep.camera}
                                                        </button>
                                                        <button
                                                            onClick={() => triggerUpload('front', 'gallery')}
                                                            className="bg-gray-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 w-full justify-center hover:bg-black transition-colors shadow-lg"
                                                        >
                                                            <ImageIcon size={14} /> {t.coach.photosStep.gallery}
                                                        </button>
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 w-full px-4 text-center">
                                                    <span className="text-gray-300 group-hover:text-brand-300 transition-colors"><Camera size={32} /></span>
                                                    <div className="flex flex-col gap-2 w-full translate-y-0 transition-all duration-300">
                                                        <button
                                                            onClick={() => triggerUpload('front', 'camera')}
                                                            className="bg-brand-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-700 w-full shadow-sm"
                                                        >
                                                            {t.coach.photosStep.camera}
                                                        </button>
                                                        <button
                                                            onClick={() => triggerUpload('front', 'gallery')}
                                                            className="bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 w-full"
                                                        >
                                                            {t.coach.photosStep.gallery}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'goal' && (
                            <motion.div
                                key="goal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 text-center mb-6">{t.coach.goalStep.title}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'hypertrophy', icon: <Dumbbell />, title: t.coach.goalStep.hypertrophy.title, desc: t.coach.goalStep.hypertrophy.desc },
                                        { id: 'definition', icon: <Activity />, title: t.coach.goalStep.definition.title, desc: t.coach.goalStep.definition.desc },
                                        { id: 'maintenance', icon: <Apple />, title: t.coach.goalStep.maintenance.title, desc: t.coach.goalStep.maintenance.desc },
                                        { id: 'strength', icon: <Dumbbell />, title: t.coach.goalStep.strength.title, desc: t.coach.goalStep.strength.desc }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setGoal(opt.id)}
                                            className={`p-6 rounded-xl border-2 text-left transition-all ${goal === opt.id
                                                ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500'
                                                : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${goal === opt.id ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                                {opt.icon}
                                            </div>
                                            <h4 className="font-bold text-gray-900">{opt.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                {errorMessage ? (
                                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                            <AlertCircle size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.coach.processing.errorTitle}</h3>
                                        <p className="text-gray-500 max-w-sm mb-6">{errorMessage}</p>
                                        <button
                                            onClick={() => setStep('goal')}
                                            className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors"
                                        >
                                            {t.coach.processing.retry}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                                            <div className="w-24 h-24 border-4 border-brand-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600" size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 min-h-[40px] flex items-center justify-center">
                                            {loadingMessages[loadingMsgIndex]}
                                        </h3>
                                        <p className="text-gray-500 max-w-md animate-pulse">
                                            {t.coach.processing.wait}
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Footer */}
                {step !== 'processing' && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        {step === 'goal' && (
                            <button onClick={() => setStep('photos')} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">
                                {t.coach.buttons.back}
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20
                 ${(step === 'photos' && !photos.front) || (step === 'goal' && !goal)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-0.5'
                                }
               `}
                            disabled={(step === 'photos' && !photos.front) || (step === 'goal' && !goal)}
                        >
                            {step === 'goal' ? t.coach.buttons.generate : t.coach.buttons.next}
                            {step !== 'goal' && <ChevronRight size={18} />}
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Hidden Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default CoachWizard;
