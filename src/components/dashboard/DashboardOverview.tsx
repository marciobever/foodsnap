import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Loader2, MessageSquare, TrendingUp, Target, CreditCard, Camera, LineChart, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import OnboardingChecklist from './OnboardingChecklist';
import ProUpgradeBanner from './ProUpgradeBanner';

interface DashboardOverviewProps {
    user: {
        name: string;
        public_id: string;
        plan: string;
        plan_valid_until?: string;
    };
    stats: {
        totalCount: number;
        avgCals: number;
        currentStreak: number;
        longestStreak: number;
        chartData: any[];
        freeFoodUsed?: number;
        freeCoachUsed?: number;
    };
    loadingStats: boolean;
    history: any[];
    loadingHistory: boolean;
    planName: string;
    t: any;
    whatsappUrl: string;
    qrCodeUrl: string;
    whatsappNumber?: string;
    setActiveTab: (tab: string) => void;
    fallbackImage: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    user,
    stats,
    loadingStats,
    history,
    loadingHistory,
    planName,
    whatsappUrl,
    qrCodeUrl,
    setActiveTab,
    fallbackImage
}) => {
    const isNewUser = stats.totalCount === 0 && !loadingStats;
    const isFreePlan = user.plan === 'free';

    // Simple Card Component for the 4 top metrics
    const MetricCard = ({ title, value, subtitle, icon, isPositive = true, tooltip }: any) => (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between hover:border-brand-200 transition-all shadow-sm h-32 group relative">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">{title}</span>
                <span className="text-gray-400 group-hover:text-brand-500 transition-colors">{icon}</span>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                <div className={`text-xs ${isPositive ? 'text-brand-500 font-medium' : 'text-gray-500'}`}>
                    {subtitle}
                </div>
            </div>
            {tooltip && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl text-center pointer-events-none">
                    {tooltip}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Visão Geral</h1>
                    <p className="text-gray-500 text-sm">Métricas e acompanhamento do desempenho do seu metabolismo.</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                    Status: <span className="text-brand-500 font-medium flex items-center gap-1.5"><div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div> Operacional</span>
                </div>
            </div>

            {/* Top 4 Metrics Grid - Hidden during onboarding */}
            {!isNewUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard 
                        title="Pratos Escaneados" 
                        value={loadingStats ? '...' : stats.totalCount.toString()} 
                        subtitle={isNewUser ? "Envie sua 1ª refeição!" : "Total histórico na plataforma"}
                        icon={<MessageSquare size={16} />} 
                        isPositive={!isNewUser}
                        tooltip={isNewUser ? "Envie a foto de um prato para a IA no WhatsApp para registrar seu primeiro escaneamento." : null}
                    />
                    <MetricCard 
                        title="Média Calórica" 
                        value={loadingStats ? '...' : (isNewUser ? '0 / Meta' : Math.round(stats.avgCals || 0).toString() + ' kcal')} 
                        subtitle="Acompanhe seu consumo"
                        icon={<TrendingUp size={16} />} 
                        isPositive={!isNewUser}
                    />
                    <MetricCard 
                        title="Ofensiva Atual" 
                        value={loadingStats ? '...' : `${stats.currentStreak} dias`} 
                        subtitle={`Recorde máximo: ${stats.longestStreak}`}
                        icon={<Target size={16} />} 
                        isPositive={stats.currentStreak > 0}
                        tooltip="Sua ofensiva aumenta a cada dia consecutivo que você registra pelo menos uma refeição."
                    />
                    <div 
                        className={`rounded-xl border shadow-sm p-5 flex flex-col justify-between transition-colors h-32 cursor-pointer group ${isFreePlan ? 'bg-gray-50 border-gray-200 hover:border-gray-300' : 'bg-gray-900 border-gray-800'}`} 
                        onClick={() => setActiveTab('subscription')}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${isFreePlan ? 'text-gray-500' : 'text-gray-400'}`}>Status do Plano</span>
                            <span className={`transition-colors ${isFreePlan ? 'text-gray-400 group-hover:text-gray-700' : 'text-brand-400'}`}>
                                <CreditCard size={16} />
                            </span>
                        </div>
                        <div>
                            <div className={`text-xl font-bold mb-1 uppercase tracking-wide flex items-center gap-2 ${isFreePlan ? 'text-gray-900' : 'text-white'}`}>
                                {planName}
                                {!isFreePlan && <ShieldCheck size={16} className="text-brand-400" />}
                            </div>
                            <div className={`text-xs ${isFreePlan ? 'text-gray-500 font-medium' : 'text-brand-400'}`}>
                                {isFreePlan 
                                    ? `Análises Restantes: ${Math.max(0, 5 - (stats.freeFoodUsed || 0))}/5` 
                                    : 'Acesso Ilimitado VIP'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ONBOARDING FLOW */}
            {isNewUser && (
                <>
                    <OnboardingChecklist 
                        whatsappUrl={whatsappUrl} 
                        qrCodeUrl={qrCodeUrl}
                        userName={user.name}
                    />
                    {isFreePlan && (
                        <div className="mb-6">
                            <ProUpgradeBanner onUpgradeClick={() => setActiveTab('subscription')} />
                        </div>
                    )}
                </>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-gray-900 font-bold">Engajamento Calórico</h3>
                    </div>
                    <p className="text-gray-500 text-xs mb-8">Volume de consumo calórico nos últimos 7 dias</p>
                    
                    <div className="w-full flex-1 relative flex flex-col justify-center">
                        {loadingStats ? (
                            <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : isNewUser ? (
                            <div className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <LineChart size={28} className="text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Seu metabolismo em dados</h4>
                                <p className="text-gray-500 text-sm max-w-sm mb-6">
                                    Seus gráficos de consumo calórico e tendências aparecerão aqui assim que você registrar suas primeiras refeições.
                                </p>
                                <button 
                                    onClick={() => window.open(whatsappUrl, '_blank')}
                                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    Registrar primeira refeição
                                </button>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-10} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#f3f4f6', borderRadius: '8px', color: '#1f2937', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#1f2937' }}
                                    />
                                    <Area type="monotone" dataKey="calories" name="Consumo" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCals)" />
                                    <Area type="monotone" dataKey={(d) => d.calories ? d.calories * 0.8 : null} name="Meta" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Right Panel - Stacked Cards */}
                <div className="flex flex-col gap-6">
                    {/* QR Code / WhatsApp Connect Widget */}
                    {!isNewUser && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-gray-900 font-bold mb-2 relative z-10">FoodSnap IA</h3>
                            <p className="text-gray-500 text-xs mb-5 relative z-10 max-w-[200px] leading-relaxed">
                                Envie uma foto da sua refeição e receba análise nutricional em segundos.
                            </p>
                            
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-5 relative z-10 w-32 h-32 flex items-center justify-center group-hover:border-brand-200 transition-colors">
                                <Image
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                />
                            </div>
                            
                            <button 
                                onClick={() => window.open(whatsappUrl, '_blank')}
                                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 relative z-10 shadow-sm"
                            >
                                <MessageSquare size={16} />
                                <span>Abrir WhatsApp</span>
                            </button>
                        </div>
                    )}

                    {/* Recent Scans */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-gray-900 font-bold">Últimas Refeições</h3>
                        </div>
                        <p className="text-gray-500 text-xs mb-4">Desempenho em tempo real</p>

                        <div className="space-y-2 flex-1 flex flex-col">
                            {loadingHistory ? (
                                <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : isNewUser ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                                        <Camera size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Aguardando refeição</p>
                                    <p className="text-xs text-gray-500">Seu histórico aparecerá aqui.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {history.slice(0, 5).map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer group" onClick={() => setActiveTab('history')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200">
                                                         <Image src={item.img || fallbackImage} alt={item.food_name || 'Food'} fill className="object-cover" unoptimized />
                                                    </div>
                                                    <span className="text-gray-700 text-sm font-medium truncate max-w-[90px]">{item.food_name || item.category || 'Refeição'}</span>
                                                </div>
                                            </div>
                                            <div className="text-gray-500 group-hover:text-brand-600 text-xs font-semibold bg-gray-50 group-hover:bg-brand-50 px-2 py-1 rounded">
                                                {item.score > 0 ? `${item.score}%` : 'Ok'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardOverview;
