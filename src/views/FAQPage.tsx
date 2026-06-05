'use client';
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowLeft, HelpCircle, FileText, CreditCard, Wrench } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FAQPageProps {
    onBack: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [openItem, setOpenItem] = useState<string | null>(null);

    const categories = [
        { id: 'general', title: t.faqPage.categories.general.title, icon: <HelpCircle size={20} />, items: t.faqPage.categories.general.items },
        { id: 'account', title: t.faqPage.categories.account.title, icon: <FileText size={20} />, items: t.faqPage.categories.account.items },
        { id: 'billing', title: t.faqPage.categories.billing.title, icon: <CreditCard size={20} />, items: t.faqPage.categories.billing.items },
        { id: 'technical', title: t.faqPage.categories.technical.title, icon: <Wrench size={20} />, items: t.faqPage.categories.technical.items },
    ];

    // Filtra as perguntas baseado na busca
    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft size={18} /> {t.faqPage.backHome}
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.faqPage.title}</h1>
                    <p className="text-lg text-gray-600 mb-8">{t.faqPage.subtitle}</p>

                    <div className="relative max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-gray-900 placeholder-gray-400"
                            placeholder={t.faqPage.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories & Questions */}
                <div className="space-y-8">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Nenhuma pergunta encontrada para sua busca.
                        </div>
                    ) : (
                        filteredCategories.map((cat) => (
                            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                    <div className="text-brand-600">{cat.icon}</div>
                                    <h2 className="text-lg font-bold text-gray-900">{cat.title}</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {cat.items.map((item, idx) => {
                                        const itemId = `${cat.id}-${idx}`;
                                        const isOpen = openItem === itemId;
                                        return (
                                            <div key={idx} className="bg-white">
                                                <button
                                                    onClick={() => toggleItem(itemId)}
                                                    className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none"
                                                >
                                                    <span className={`font-medium ${isOpen ? 'text-brand-600' : 'text-gray-900'}`}>
                                                        {item.q}
                                                    </span>
                                                    {isOpen ? <ChevronUp size={20} className="text-brand-500 shrink-0 ml-4" /> : <ChevronDown size={20} className="text-gray-400 shrink-0 ml-4" />}
                                                </button>
                                                <div
                                                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                                                        }`}
                                                >
                                                    <p className="text-gray-600 leading-relaxed text-sm">
                                                        {item.a}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
                    <a href="https://wa.me/5541999999999" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-600 font-bold hover:underline">
                        Fale com nosso suporte no WhatsApp <ChevronUp className="rotate-90" size={16} />
                    </a>
                </div>

            </div>
        </div>
    );
};

export default FAQPage;