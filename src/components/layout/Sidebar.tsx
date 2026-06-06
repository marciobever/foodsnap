'use client';
import React, { useState } from 'react';
import { LayoutDashboard, History, CreditCard, Dumbbell, ShieldAlert, BrainCircuit, LogOut, Zap, ChevronDown, ChevronRight, Calendar, Settings, User as UserIcon, Scale, FileText, Trash2, ExternalLink } from 'lucide-react';
import { User } from '@/types';
import Image from 'next/image';

interface SidebarProps {
    user: User;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    onOpenPro?: () => void;
    t: any;
    coachHistory?: any[];
    onSelectCoachPlan?: (plan: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout, onOpenPro, t, coachHistory, onSelectCoachPlan }) => {
    const [isCoachExpanded, setIsCoachExpanded] = useState(false);

    const handleCoachClick = () => {
        if (coachHistory && coachHistory.length > 0) {
            setIsCoachExpanded(!isCoachExpanded);
        }
        setActiveTab('coach');
    };

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 fixed top-0 left-0 h-full z-20 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center text-brand-400">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">FoodSnap</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                <SidebarItem
                    icon={<LayoutDashboard size={20} />}
                    label={t.dashboard.menuOverview}
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                />

                <div className="space-y-1">
                    <SidebarItem
                        icon={<Dumbbell size={20} />}
                        label="Coach AI"
                        active={activeTab === 'coach'}
                        onClick={handleCoachClick}
                        hasSubmenu={!!(coachHistory && coachHistory.length > 0)}
                        isExpanded={isCoachExpanded}
                    />

                    {isCoachExpanded && coachHistory && (
                        <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {coachHistory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        const plan = typeof item.ai_structured === 'string'
                                            ? JSON.parse(item.ai_structured)
                                            : item.ai_structured;
                                        if (onSelectCoachPlan) onSelectCoachPlan(plan);
                                        setActiveTab('coach');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2 transition-colors truncate"
                                >
                                    <Calendar size={12} />
                                    <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                                    <span className="text-[10px] text-gray-400 ml-auto truncate max-w-[60px]">{item.goal_suggestion || "Personalizado"}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <SidebarItem
                    icon={<History size={20} />}
                    label={t.dashboard.menuHistory}
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                />
                <SidebarItem
                    icon={<UserIcon size={20} />}
                    label="Perfil"
                    active={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                />
                <SidebarItem
                    icon={<Settings size={20} />}
                    label="Configurações"
                    active={activeTab === 'subscription'}
                    onClick={() => setActiveTab('subscription')}
                />
                <SidebarItem
                    icon={<CreditCard size={20} />}
                    label="Pagamentos"
                    active={activeTab === 'billing'}
                    onClick={() => setActiveTab('billing')}
                />

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="px-4 text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Legal</p>
                    <a href="/termos" target="_blank" rel="noopener noreferrer" className="w-full text-left px-4 py-2 text-xs font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-3 transition-colors">
                        <FileText size={16} className="text-gray-400" />
                        Termos de Uso
                    </a>
                    <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="w-full text-left px-4 py-2 text-xs font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-3 transition-colors">
                        <Scale size={16} className="text-gray-400" />
                        Política de Privacidade
                    </a>
                    <a href="/exclusao-de-dados" target="_blank" rel="noopener noreferrer" className="w-full text-left px-4 py-2 text-xs font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-3 transition-colors">
                        <Trash2 size={16} className="text-gray-400" />
                        Exclusão de Dados
                    </a>
                </div>

                {user.is_professional && onOpenPro && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={onOpenPro}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-0.5"
                        >
                            <BrainCircuit size={20} className="text-brand-400" />
                            <span className="text-sm font-bold">Área Profissional</span>
                        </button>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm relative overflow-hidden shrink-0">
                        <Image src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="User" fill className="object-cover" unoptimized />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate uppercase font-bold tracking-wider">{user.plan === 'pro' ? 'PRO PLAN' : 'FREE PLAN'}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
                >
                    <LogOut size={16} />
                    {t.dashboard.logout}
                </button>
            </div>
        </aside>
    );
};

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    hasSubmenu?: boolean;
    isExpanded?: boolean;
}

const SidebarItem = ({ icon, label, active, onClick, hasSubmenu, isExpanded }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${active
            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-md shadow-brand-500/20 translate-x-1'
            : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 hover:translate-x-1'
            }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm">{label}</span>
        </div>
        {hasSubmenu && (
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={14} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
            </div>
        )}
    </button>
);

export default Sidebar;

