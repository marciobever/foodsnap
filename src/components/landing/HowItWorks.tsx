import React from 'react';
import { Camera, Send, Activity, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Camera className="w-6 h-6 text-white" />,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc
    },
    {
      icon: <Send className="w-6 h-6 text-white" />,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc
    },
    {
      icon: <Activity className="w-6 h-6 text-white" />,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-900 text-white relative overflow-hidden scroll-mt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4 tracking-tight">{t.howItWorks.title}</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-brand-600 rounded-2xl shadow-lg shadow-brand-900/50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-500 transition-all duration-300">
                {step.icon}
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-900 to-transparent z-0">
                  <ChevronRight className="absolute right-0 -top-3 text-brand-900" />
                </div>
              )}

              <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm px-4">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;