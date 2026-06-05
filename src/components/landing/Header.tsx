'use client';
import React, { useState, useEffect } from 'react';
import { Scan, Menu, X, Zap, ArrowRight, Globe, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onRegister: () => void;
  onLogin: (context?: 'user' | 'professional') => void;
  onOpenTools: () => void;
  onNavigate?: (view: 'home' | 'faq') => void;
}

const Header: React.FC<HeaderProps> = ({ onRegister, onLogin, onOpenTools, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.header.howItWorks, id: 'how-it-works' },
    { name: t.header.features, id: 'features' },
    { name: t.header.pricing, id: 'pricing' },
  ];

  const toggleLang = (lang: 'pt' | 'en' | 'es') => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const handleScrollTo = (id: string) => {
    // Se a função de navegação for fornecida, garante que vamos para a home primeiro
    if (onNavigate) {
      onNavigate('home');
      // Pequeno delay para permitir a renderização da home antes de scrollar
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
        ? 'bg-white/80 backdrop-blur-md border-gray-200/50 py-3 shadow-sm'
        : 'bg-transparent border-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo Professional */}
        <a href="#" onClick={handleLogoClick} className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-11 h-11 bg-brand-950 rounded-xl border border-brand-800 shadow-lg shadow-brand-900/20 group-hover:scale-105 transition-all duration-300 group-hover:shadow-brand-600/30">
            <Scan size={24} className="text-brand-400 opacity-90 group-hover:opacity-100 transition-opacity" strokeWidth={1.25} />
            <Zap size={14} className="absolute text-yellow-500 fill-yellow-500 -rotate-12 translate-y-0.5 translate-x-0.5 drop-shadow-sm" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center h-full">
            <span className="text-2xl font-bold tracking-tight text-gray-900 leading-none group-hover:text-brand-900 transition-colors flex items-baseline gap-0.5">
              FoodSnap<span className="text-brand-600 text-xl">.ai</span>
            </span>
            <span className="text-xs font-medium tracking-wide text-gray-500 mt-0.5 group-hover:text-brand-600/80 transition-colors">
              {t.header.slogan}
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleScrollTo(link.id)}
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors relative group whitespace-nowrap"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all group-hover:w-full"></span>
            </button>
          ))}

          {/* Tools Button - New Featured Item */}
          <button
            onClick={onOpenTools}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition-all hover:shadow-sm"
          >
            <Calculator size={14} className="text-brand-600" />
            {t.header.tools}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors p-1"
            >
              <Globe size={16} />
              <span className="uppercase">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                {[
                  { code: 'pt', label: 'Português' },
                  { code: 'en', label: 'English' },
                  { code: 'es', label: 'Español' }
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => toggleLang(l.code as any)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${language === l.code ? 'text-brand-600 font-bold bg-brand-50' : 'text-gray-600'}`}
                  >
                    {l.label}
                    {language === l.code && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>


          <div className="flex items-center gap-4">
            <button
              onClick={() => onLogin()}
              className="group bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              Acessar
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-brand-600 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl md:hidden p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200 h-[calc(100vh-80px)] overflow-y-auto">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleScrollTo(link.id)}
              className="text-base font-medium text-gray-700 py-3 border-b border-gray-50 last:border-0 hover:text-brand-600 text-left"
            >
              {link.name}
            </button>
          ))}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTools();
            }}
            className="text-base font-bold text-brand-700 py-3 border-b border-gray-50 flex items-center gap-2"
          >
            <Calculator size={18} />
            {t.header.tools}
          </button>

          <div className="flex gap-2 py-2">
            <button onClick={() => toggleLang('pt')} className={`flex-1 py-2 rounded-lg text-sm border ${language === 'pt' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200'}`}>PT</button>
            <button onClick={() => toggleLang('en')} className={`flex-1 py-2 rounded-lg text-sm border ${language === 'en' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200'}`}>EN</button>
            <button onClick={() => toggleLang('es')} className={`flex-1 py-2 rounded-lg text-sm border ${language === 'es' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200'}`}>ES</button>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogin();
              }}
              className="text-gray-600 font-semibold py-2"
            >
              {t.header.login}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRegister();
              }}
              className="bg-brand-600 text-white text-center py-3.5 rounded-xl font-semibold shadow-md w-full"
            >
              {t.header.cta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;