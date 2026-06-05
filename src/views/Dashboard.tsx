'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardHistory from '@/components/dashboard/DashboardHistory';
import DashboardSubscription from '@/components/dashboard/DashboardSubscription';
import DashboardCoach from '@/components/dashboard/DashboardCoach';
import DashboardBilling from '@/components/dashboard/DashboardBilling';
import DashboardProfile from '@/components/dashboard/DashboardProfile';

import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboardHistory } from '@/hooks/useDashboardHistory';
import { useCoachHistory } from '@/hooks/useCoachHistory';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenPro?: () => void;
  initialTab?: string;
  refreshProfile?: () => Promise<void>;
}

export default function Dashboard({
  user,
  onLogout,
  onOpenAdmin,
  onOpenPro,
  initialTab = 'overview',
  refreshProfile,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [coachPlan, setCoachPlan] = useState(null);
  const [isCoachWizardOpen, setIsCoachWizardOpen] = useState(false);
  const { t } = useLanguage();
  const { history, loading: loadingHistory } = useDashboardHistory(user);
  const { coachHistory, loadingCoach } = useCoachHistory(user);

  const calculateStreaks = (hist: any[]) => {
    if (!hist || hist.length === 0) return { current: 0, longest: 0, chart: [] };
    const sortedDates = [...hist]
      .filter(i => i.created_at)
      .map(i => new Date(i.created_at))
      .sort((a, b) => b.getTime() - a.getTime());

    const uniqueDates = [...new Set(sortedDates.map(d => {
        const localD = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return localD.toISOString().split('T')[0];
    }))];

    let longest = 1, temp = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i-1]);
        const curr = new Date(uniqueDates[i]);
        const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diff === 1) { temp++; if (temp > longest) longest = temp; }
        else { temp = 1; }
    }

    let current = 0;
    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const yesterdayStr = new Date(now.getTime() - 86400000 - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        current = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i-1]);
            const curr = new Date(uniqueDates[i]);
            if (Math.round((prev.getTime() - curr.getTime()) / 86400000) === 1) current++;
            else break;
        }
    }

    const chart: { name: string; calories: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000 - now.getTimezoneOffset() * 60000);
        const dateStr = d.toISOString().split('T')[0];
        const dayCals = hist
            .filter(item => item.created_at?.startsWith(dateStr))
            .reduce((sum, item) => sum + (item.calories || 0), 0);
        chart.push({
            name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
            calories: dayCals
        });
    }

    return { current, longest, chart };
  };

  const streakData = calculateStreaks(history);

  const stats = {
    totalCount: history?.length || 0,
    avgCals: history?.length ? history.reduce((sum, item) => sum + (item.calories || 0), 0) / history.length : 0,
    currentStreak: streakData.current,
    longestStreak: streakData.longest,
    chartData: streakData.chart,
    freeFoodUsed: history?.length || 0,
    freeCoachUsed: coachHistory?.length || 0,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview 
                 user={user} 
                 stats={stats}
                 loadingStats={loadingHistory}
                 history={history}
                 loadingHistory={loadingHistory}
                 planName={user?.plan === 'pro' ? 'PRO' : 'STARTER'}
                 t={t}
                 whatsappUrl="https://wa.me/5541988049221?text=Oi"
                 qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/5541988049221"
                 whatsappNumber="+55 41 98804-9221"
                 setActiveTab={setActiveTab}
                 fallbackImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
               />;
      case 'history':
        return <DashboardHistory 
                 history={history}
                 loadingHistory={loadingHistory}
                 t={t}
                 fallbackImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
               />;
      case 'subscription':
        return <DashboardSubscription user={user} />;
      case 'profile':
        return <DashboardProfile user={user} refreshProfile={refreshProfile} />;
      case 'billing':
        return <DashboardBilling user={user} />;
      case 'coach':
        return <DashboardCoach 
                 coachPlan={coachPlan}
                 setCoachPlan={setCoachPlan}
                 coachHistory={coachHistory}
                 setIsCoachWizardOpen={setIsCoachWizardOpen}
                 userPlan={user?.plan || 'free'}
                 user={user}
               />;
      default:
        return <DashboardOverview 
                 user={user}
                 stats={stats}
                 loadingStats={loadingHistory}
                 history={history}
                 loadingHistory={loadingHistory}
                 planName={user?.plan === 'pro' ? 'PRO' : 'STARTER'}
                 t={t}
                 whatsappUrl="https://wa.me/5541988049221?text=Oi"
                 qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/5541988049221"
                 whatsappNumber="+55 41 98804-9221"
                 setActiveTab={setActiveTab}
                 fallbackImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
               />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        user={user}
        onOpenPro={onOpenPro}
        t={t}
      />
      
      <div className="flex-1 md:ml-64 pb-20 md:pb-0 overflow-hidden">
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        t={t}
      />
    </div>
  );
}
