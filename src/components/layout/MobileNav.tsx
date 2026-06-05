import React from 'react';
import { LayoutDashboard, History, CreditCard, Dumbbell, Settings, User, LogOut } from 'lucide-react';

interface MobileNavProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    t: any;
    logout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, t, logout }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2 pb-safe shadow-lg">
            <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'overview' ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <LayoutDashboard size={20} />
                <span className="text-[10px] font-medium">{t.dashboard.menuOverview}</span>
            </button>
            <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'history' ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <History size={20} />
                <span className="text-[10px] font-medium">{t.dashboard.menuHistory}</span>
            </button>
            <button
                onClick={() => setActiveTab('coach')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'coach' ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <Dumbbell size={20} />
                <span className="text-[10px] font-medium">Coach AI</span>
            </button>
            <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'profile' ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <User size={20} />
                <span className="text-[10px] font-medium">Perfil</span>
            </button>
            <button
                onClick={() => setActiveTab('subscription')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'subscription' ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <Settings size={20} />
                <span className="text-[10px] font-medium">Ajustes</span>
            </button>
            <button
                onClick={() => setActiveTab('billing')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'billing' ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <CreditCard size={20} />
                <span className="text-[10px] font-medium">Pagamentos</span>
            </button>
            <button
                onClick={() => logout()}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-gray-400 hover:text-red-600`}
            >
                <LogOut size={20} />
                <span className="text-[10px] font-medium">Sair</span>
            </button>
        </div>
    );
};

export default MobileNav;
