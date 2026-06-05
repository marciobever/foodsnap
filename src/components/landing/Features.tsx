import React from 'react';
import { Flame, Scale, MessageSquare, Sparkles, ArrowLeftRight, UtensilsCrossed, CheckCircle2, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const Features: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Dumbbell className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />,
      bg: "bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/10 shadow-lg shadow-emerald-500/10",
      title: "Coach AI",
      description: "NOVO! Seu personal trainer e nutricionista via IA. Envie fotos, descubra seu biótipo e receba treinos e dietas 100% adaptados.",
      novelty: true
    },
    {
      icon: <Flame className="w-6 h-6 text-red-600" strokeWidth={1.5} />,
      bg: "bg-red-50 border-red-100",
      title: "Startup para Profissionais",
      description: "Personal Trainer ou Nutricionista? Tenha seu próprio app/dashboard para gerenciar alunos, vender planos e acompanhar a evolução deles.",
      novelty: true
    },
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-orange-600" strokeWidth={1.5} />,
      bg: "bg-orange-50 border-orange-100",
      title: t.features.f1Title,
      description: t.features.f1Desc
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-600" strokeWidth={1.5} />,
      bg: "bg-brand-50 border-brand-100",
      title: t.features.f2Title,
      description: t.features.f2Desc
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      bg: "bg-blue-50 border-blue-100",
      title: t.features.f3Title,
      description: t.features.f3Desc
    },
    {
      icon: <Scale className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />,
      bg: "bg-indigo-50 border-indigo-100",
      title: t.features.f4Title,
      description: t.features.f4Desc
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-600" strokeWidth={1.5} />,
      bg: "bg-purple-50 border-purple-100",
      title: t.features.f5Title,
      description: t.features.f5Desc
    }
  ];

  return (
    <section id="features" className="py-24 bg-white relative scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-20 items-start">

          <div className="lg:w-1/2 lg:sticky lg:top-24 order-2 lg:order-1 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={12} />
                {t.features.guruTitle}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6 tracking-tight leading-[1.2]">
                {t.features.mainTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed font-light">
                {t.features.subtitle}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex gap-5 items-start"
                >
                  <div className={`shrink-0 p-3.5 rounded-2xl border shadow-sm group-hover:shadow-md transition-all duration-300 ${feature.bg}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                      {feature.title}
                      {/* @ts-ignore */}
                      {feature.novelty && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wide border border-emerald-200">Novo</span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 w-full order-1 lg:order-2 flex justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[4/5] sm:aspect-square">

              {/* Abstract Background Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-brand-100/50 via-blue-50/50 to-purple-50/50 rounded-full blur-3xl -z-10"></div>

              {/* Main Card Image Container */}
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/50 bg-white ring-1 ring-black/5 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Healthy Bowl"
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Floating UI Elements */}

              {/* Top Right: Score Badge */}
              <div className="absolute -top-6 -right-4 z-20 animate-bounce delay-1000 duration-[3000ms]">
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 pr-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex flex-col items-center justify-center text-white shadow-lg shadow-brand-500/30">
                    <span className="font-black text-lg leading-none">94</span>
                    <span className="text-[9px] opacity-90 font-bold">SCORE</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Qualidade</p>
                    <div className="flex text-yellow-400">
                      <CheckCircle2 size={16} className="text-brand-500 fill-brand-100" />
                      <span className="text-sm font-bold text-gray-800 ml-1">Excelente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Left: Visual Tip (Chat Bubble style) */}
              <div className="absolute top-12 -left-8 max-w-[240px] z-30">
                <div className="bg-white/90 backdrop-blur-md shadow-xl p-4 rounded-2xl rounded-tr-none border border-gray-100 relative transform transition-transform hover:scale-105 duration-300">
                  <div className="flex gap-3 items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-full text-white shrink-0 shadow-lg shadow-blue-500/30">
                      <Sparkles size={16} fill="currentColor" />
                    </div>
                    <div>
                      <span className="font-bold block text-gray-900 text-xs mb-1 uppercase tracking-wide">{t.features.visualTipTitle}</span>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {t.features.visualTipDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Center: Macro Analysis Card (Simulating App UI) */}
              <div className="absolute bottom-8 inset-x-8 z-20">
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 p-5 rounded-2xl shadow-2xl shadow-gray-900/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-gray-900 font-bold text-base">Salada Caesar & Frango</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Análise em tempo real • 12:42</p>
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-500">
                      340 kcal
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-bold">
                        <span className="text-gray-500 uppercase">Proteína</span>
                        <span className="text-gray-900">28g</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 w-[65%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-bold">
                        <span className="text-gray-500 uppercase">Carboidratos</span>
                        <span className="text-gray-900">12g</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[25%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Features;