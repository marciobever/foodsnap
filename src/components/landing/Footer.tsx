import React from 'react';
import { Scan, Zap, MessageCircle, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FooterProps {
  onRegister: () => void;
  onNavigate?: (view: 'home' | 'faq' | 'privacy' | 'terms' | 'data-deletion') => void; // Optional prop to support navigation
}

const Footer: React.FC<FooterProps> = ({ onRegister, onNavigate }) => {
  const { t } = useLanguage();

  const handleFaqClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('faq');
    }
  };

  const handleHomeClick = (e: React.MouseEvent, id?: string) => {
    if (onNavigate) {
      // Se tiver navegação, garante que estamos na home primeiro
      if (!id) {
        e.preventDefault();
        onNavigate('home');
      }
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900">
      {/* Final CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-900/40 via-gray-950 to-gray-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            {t.footer.ctaTitle}
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto font-light">
            {t.footer.ctaDesc}
          </p>
          <button
            onClick={onRegister}
            className="inline-flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-500 px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-brand-900/50 hover:shadow-brand-500/20"
          >
            <MessageCircle size={20} />
            {t.footer.ctaBtn}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 border-t border-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={(e) => handleHomeClick(e)}>
              <div className="relative flex items-center justify-center w-10 h-10 bg-gray-900 rounded-xl border border-gray-800">
                <Scan size={20} className="text-brand-500" strokeWidth={1.5} />
                <Zap size={10} className="absolute text-yellow-500 fill-yellow-500" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">FoodSnap.ai</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">{t.footer.platform}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#how-it-works" onClick={(e) => handleHomeClick(e, 'how-it-works')} className="hover:text-brand-400 transition-colors">{t.header.howItWorks}</a></li>
              <li><a href="#features" onClick={(e) => handleHomeClick(e, 'features')} className="hover:text-brand-400 transition-colors">{t.header.features}</a></li>
              <li><a href="#pricing" onClick={(e) => handleHomeClick(e, 'pricing')} className="hover:text-brand-400 transition-colors">{t.header.pricing}</a></li>
              <li>
                <button onClick={handleFaqClick} className="hover:text-brand-400 transition-colors text-left">
                  FAQ / Ajuda
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">{t.footer.legal}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('terms'); }} className="hover:text-brand-400 transition-colors text-left">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('privacy'); }} className="hover:text-brand-400 transition-colors text-left">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('data-deletion'); }} className="hover:text-brand-400 transition-colors text-left">
                  Exclusão de Dados
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">{t.footer.connect}</h3>
            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed" title="Em breve">
                <Instagram size={18} />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed" title="Em breve">
                <Twitter size={18} />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed" title="Em breve">
                <Linkedin size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} FoodSnap.ai. {t.footer.rights}</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Sistema Operacional</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;