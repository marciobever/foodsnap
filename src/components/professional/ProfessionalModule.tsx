'use client';
import React, { useState } from 'react';
import {
    Briefcase,
    Users,
    DollarSign,
    Settings,
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    Award,
    CheckCircle2,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ProfessionalModule: React.FC = () => {
    // Mock Data for MVP
    const [services, setServices] = useState([
        { id: 1, title: 'Consultoria Online Mensal', price: 15000, active: true, clients: 12 },
        { id: 2, title: 'Treino Hipertrofia Individual', price: 8990, active: true, clients: 5 },
        { id: 3, title: 'Avaliação Física Presencial', price: 12000, active: false, clients: 0 }
    ]);

    const [clients] = useState([
        { id: 1, name: 'João Silva', plan: 'Consultoria Online', status: 'active', lastCheckin: 'Hoje' },
        { id: 2, name: 'Maria Oliveira', plan: 'Treino Hipertrofia', status: 'active', lastCheckin: 'Ontem' },
        { id: 3, name: 'Carlos Santos', plan: 'Consultoria Online', status: 'pending', lastCheckin: '3 dias atrás' }
    ]);

    const { t } = useLanguage(); // Assuming we might add translations later, but sticking to PT for hardcoded MVP parts

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Área Profissional <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full border border-brand-200">BETA</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Gerencie seus serviços, alunos e faturamento em um só lugar.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 flex items-center gap-2">
                        <Plus size={18} /> Novo Serviço
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Settings size={18} /> Configurar Perfil
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Alunos Ativos</p>
                        <h4 className="text-2xl font-black text-gray-900">17</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Faturamento (Mês)</p>
                        <h4 className="text-2xl font-black text-gray-900">R$ 2.450,00</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Serviços Ativos</p>
                        <h4 className="text-2xl font-black text-gray-900">3</h4>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Meus Serviços */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Briefcase size={20} className="text-brand-600" /> Meus Serviços
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {services.map(service => (
                                <div key={service.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-gray-900">{service.title}</h4>
                                            {service.active ? (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Ativo</span>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide">Inativo</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {formatCurrency(service.price)} • {service.clients} alunos inscritos
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button className="text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">
                                Ver todos os serviços
                            </button>
                        </div>
                    </div>

                    {/* Quick Tips / Upsell */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Aumente suas vendas</h3>
                            <p className="text-gray-300 mb-6 max-w-lg text-sm leading-relaxed">
                                Profissionais que detalham bem seus serviços e usam fotos profissionais vendem 3x mais.
                                Configure seu perfil público agora mesmo.
                            </p>
                            <button className="bg-white text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors">
                                Editar Perfil Público
                            </button>
                        </div>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
                    </div>
                </div>

                {/* Meus Alunos (Sidebar) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Users size={20} className="text-blue-600" /> Alunos Recentes
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {clients.map(client => (
                                <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">{client.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{client.plan}</p>
                                        </div>
                                        {client.status === 'active' ? (
                                            <CheckCircle2 size={14} className="text-green-500" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 pl-11">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {client.lastCheckin}</span>
                                        <button className="text-brand-600 font-bold hover:underline flex items-center gap-1">
                                            Ver <ChevronRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-2">
                                <MessageSquare size={14} /> Mensagens
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalModule;
