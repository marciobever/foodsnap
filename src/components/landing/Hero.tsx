'use client';
import React, { useState, useRef } from 'react';
import { ArrowRight, MessageCircle, Scan, Zap, Camera, Lightbulb, Sparkles, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

interface HeroProps {
  onRegister: () => void;
}

const Hero: React.FC<HeroProps> = ({ onRegister }) => {
  const [demoState, setDemoState] = useState<'initial' | 'analyzing' | 'result'>('initial');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showDemoInstruction, setShowDemoInstruction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleDemoClick = () => {
    setShowDemoInstruction(true);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserImage(imageUrl);
      setShowDemoInstruction(false); // Fecha o modal
      setDemoState('analyzing');

      // Simulate network delay and processing
      setTimeout(() => {
        setDemoState('result');
      }, 3500); // Um pouco mais de tempo para ver o "robô pensando"
    }
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-24 pb-12 lg:pt-20 lg:pb-0 overflow-hidden bg-gray-50/30">
      {/* Hidden Input for Demo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Modern Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white -z-10" />
      <div className="hidden md:block absolute -top-40 right-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-[120px] -z-10" />
      <div className="hidden md:block absolute top-40 left-[-100px] w-[500px] h-[500px] bg-accent-200/20 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 shadow-sm text-brand-700 text-xs font-bold uppercase tracking-wider mb-8 ring-1 ring-brand-500/20">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              NOVO: Coach AI 2.0 - Treino & Dieta
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              {t.hero.titleStart} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-400">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {demoState === 'initial' ? (
                  <>
                    <Upload size={20} className="text-brand-300" />
                    {t.hero.ctaUpload}
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Testar outra foto
                  </>
                )}
              </button>
              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50/30 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-sm cursor-pointer"
              >
                {t.hero.ctaPlans}
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm relative">
                      <Image src={`https://picsum.photos/100/100?random=${i + 20}`} alt="user" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
                <span className="font-medium text-gray-700">{t.hero.stats}</span>
              </div>
              <span className="h-4 w-px bg-gray-300 mx-2"></span>
              <div className="flex items-center gap-1 text-brand-700 font-semibold">
                <Zap size={14} fill="currentColor" />
                <span>{t.hero.analysis}</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Element - Modern Mockup Interactive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 relative w-full max-w-md lg:max-w-full flex justify-center lg:justify-end"
          >
            <div className="relative z-10 w-[340px] bg-gray-950 rounded-[45px] border-[8px] border-gray-950 shadow-2xl overflow-hidden ring-1 ring-white/10 transform transition-transform duration-500">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-36 bg-gray-950 rounded-b-2xl z-20"></div>

              {/* Screen */}
              <div className="w-full h-[680px] bg-gray-50 flex flex-col font-sans">
                {/* Header Mockup */}
                <div className="bg-white/95 md:bg-white/90 md:backdrop-blur-md p-4 pt-12 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-950 text-brand-500 flex items-center justify-center shadow-lg shadow-brand-900/20 border border-brand-900/10">
                      <Scan size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">FoodSnap</p>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-[10px] text-gray-500 font-medium">Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 flex flex-col gap-5 overflow-hidden bg-[#f1f5f9] relative">
                  {/* User Message (Image) */}
                  <AnimatePresence>
                    <motion.div
                      key={userImage || 'default-img'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="self-end max-w-[85%] flex flex-col items-end"
                    >
                      <div className="bg-brand-600 p-1 rounded-2xl rounded-tr-sm shadow-md mb-1 ring-1 ring-brand-700/10">
                        <img
                          src={userImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                          className="rounded-xl w-full h-32 object-cover"
                          alt="Meal"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mr-1">12:30</p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Loading State / Robot Message */}
                  {demoState === 'analyzing' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="self-start max-w-[85%]"
                    >
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          </div>
                          <span className="text-xs font-semibold text-gray-500">{t.hero.demoProcessing}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Response */}
                  {(demoState === 'initial' || demoState === 'result') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="self-start max-w-[95%]"
                    >
                      <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-md border border-gray-200">
                        {/* Header Analysis */}
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-brand-100 p-1.5 rounded-lg text-brand-700">
                              <Zap size={14} fill="currentColor" />
                            </div>
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{t.hero.analysis}</span>
                          </div>
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                            Score A
                          </span>
                        </div>

                        <div className="space-y-4">
                          {/* Macros */}
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                {demoState === 'initial' ? '485' : '520'} <span className="text-xs font-normal text-gray-400">kcal</span>
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {demoState === 'initial' ? 'High Protein' : 'Balanced'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Prot</p>
                                <p className="font-bold text-gray-900 text-sm">{demoState === 'initial' ? '32g' : '28g'}</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Carb</p>
                                <p className="font-bold text-gray-900 text-sm">{demoState === 'initial' ? '45g' : '55g'}</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Gord</p>
                                <p className="font-bold text-gray-900 text-sm">{demoState === 'initial' ? '12g' : '18g'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Insights */}
                          <div className="bg-brand-50/50 rounded-xl p-3 border border-brand-100 space-y-3">
                            <div className="flex gap-2.5 items-start">
                              <Lightbulb size={14} className="text-yellow-500 shrink-0 mt-0.5" fill="currentColor" />
                              <p className="text-[11px] text-gray-600 leading-relaxed">
                                <span className="font-bold text-gray-800">{t.hero.demoAdvice}</span> {t.hero.demoAdviceText}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 ml-1">
                        <Sparkles size={10} className="text-brand-500" />
                        <p className="text-[9px] text-gray-400">Powered by FoodSnap</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area (Visual Only) */}
                <div className="bg-white p-3 border-t border-gray-200 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={handleDemoClick}
                  >
                    <Camera size={18} />
                  </div>
                  <div className="h-10 flex-1 bg-gray-100 rounded-full px-4 flex items-center text-xs text-gray-400 border border-transparent">
                    ...
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            {demoState === 'initial' && (
              <div className="absolute top-[20%] -left-4 lg:-left-12 bg-white p-3 rounded-xl shadow-xl border border-gray-100 animate-bounce delay-1000 hidden md:block z-20">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-50 p-1.5 rounded-lg text-brand-700 border border-brand-100">
                    <Scan size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Detected</p>
                    <p className="text-xs font-bold text-gray-800">Salmon Bowl</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>

      {/* Demo Instruction Modal */}
      <AnimatePresence>
        {showDemoInstruction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoInstruction(false)}
              className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 text-center"
            >
              <button
                onClick={() => setShowDemoInstruction(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera size={32} className="text-brand-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.hero.demoModalTitle}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t.hero.demoModalDesc}
              </p>

              <button
                onClick={handleTriggerUpload}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                {t.hero.demoModalBtn}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;