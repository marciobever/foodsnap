import React from 'react';
import { motion } from 'framer-motion';
import { ScanEye, Dumbbell, Utensils, CheckCircle2 } from 'lucide-react';

interface CoachHighlightProps {
    onRegister: () => void;
}

const CoachHighlight: React.FC<CoachHighlightProps> = ({ onRegister }) => {
    return (
        <section className="py-24 bg-gray-900 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600 rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[150px] opacity-10 translate-y-1/3 -translate-x-1/3"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text Content */}
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                            Nova Tecnologia
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                            Seu corpo analisado <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">
                                pela Inteligência Artificial.
                            </span>
                        </h2>

                        <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">
                            Esqueça planilhas genéricas. Nossa IA escaneia seu biótipo através de fotos e cria, em segundos, o protocolo exato de treino e dieta para sua estrutura.
                        </p>

                        <div className="space-y-4 mb-10">
                            <FeatureRow icon={<ScanEye className="text-brand-400" />} title="Visão Computacional" desc="Identifica massa muscular, gordura e postura." />
                            <FeatureRow icon={<Utensils className="text-brand-400" />} title="Dieta Milimétrica" desc="Macros calculados para o seu metabolismo basal." />
                            <FeatureRow icon={<Dumbbell className="text-brand-400" />} title="Treino Adaptativo" desc="Periodização baseada no seu nível e objetivo." />
                        </div>

                        <button
                            onClick={onRegister}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-brand-600/20 hover:scale-105 active:scale-95"
                        >
                            Quero minha análise agora
                        </button>
                    </div>

                    {/* Right: Visual Demo (Mockup) */}
                    <div className="relative">
                        <div className="relative z-10 bg-gray-800 rounded-3xl border border-gray-700 p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Trainer reviewing data"
                                className="rounded-2xl w-full h-auto opacity-70"
                            />

                            {/* Floating Elements duplicating the 'Scanner' feel */}
                            <div className="absolute top-[20%] left-[10%] bg-black/80 backdrop-blur-md border border-brand-500/50 p-4 rounded-xl flex items-center gap-4 shadow-xl animate-bounce delay-700">
                                <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                                    <ScanEye size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-brand-400 font-bold uppercase tracking-wider">Scanning...</div>
                                    <div className="text-white font-bold text-sm">Ectomorfo Identificado</div>
                                </div>
                            </div>

                            <div className="absolute bottom-[20%] right-[-20px] bg-white text-gray-900 p-4 rounded-xl shadow-xl max-w-[200px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span className="font-bold text-xs uppercase text-gray-500">Protocolo Gerado</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 w-[80%]"></div>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[60%]"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

const FeatureRow = ({ icon, title, desc }: any) => (
    <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
            {icon}
        </div>
        <div>
            <h4 className="text-white font-bold text-lg mb-1">{title}</h4>
            <p className="text-gray-400 text-sm leading-snug">{desc}</p>
        </div>
    </div>
);

export default CoachHighlight;
