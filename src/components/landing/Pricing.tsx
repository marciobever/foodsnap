import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingProps {
  onRegister: (plan: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ onRegister }) => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden scroll-mt-24">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 tracking-tight">{t.pricing.title}</h2>
          <p className="text-lg text-gray-600">{t.pricing.subtitle}</p>
        </div>


        {/* PRO Plan Card */}
        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-brand-950 rounded-3xl border border-brand-800 p-8 flex flex-col relative shadow-2xl shadow-brand-900/20 ring-1 ring-brand-700/50">

            <div className="flex justify-between items-start mt-2">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                  {t.pricing.plans.monthly.title}
                  <span className="bg-brand-500 rounded-full px-2 py-0.5 pb-[3px] text-[10px] font-bold uppercase tracking-wider text-white">PRO</span>
                </h3>
                <p className="text-brand-200 mt-1 text-sm opacity-90">{t.pricing.plans.monthly.description}</p>
              </div>
              <div className="bg-white/5 border-white/10 rounded-lg border p-2">
                <Sparkles className="text-accent-400" size={24} />
              </div>
            </div>

            <div className="mb-2 mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-white">{t.pricing.plans.monthly.price}</span>
              <span className="text-brand-200 text-sm font-medium">{t.pricing.plans.monthly.period}</span>
            </div>
            <p className="text-brand-300 mb-8 text-xs font-medium uppercase tracking-wide">{t.pricing.plans.monthly.billingInfo}</p>

            <div className="from-transparent via-brand-800 to-transparent mb-8 h-px bg-gradient-to-r" />

            <ul className="mb-8 flex-grow space-y-4">
              {t.pricing.plans.monthly.features.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-100">
                  <div className="bg-brand-600 mt-0.5 rounded-full p-0.5 text-white shadow-sm">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onRegister('monthly')}
              className="group from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/20 hover:-translate-y-0.5 relative block w-full overflow-hidden rounded-xl bg-gradient-to-r py-4 text-center text-sm font-bold text-white shadow-lg transition-all"
            >
              <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
              <span className="relative">{t.pricing.plans.monthly.btnText}</span>
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;