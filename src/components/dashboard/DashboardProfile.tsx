'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Phone, Calendar, ShieldCheck, Zap, AlertTriangle, Loader2, CreditCard } from 'lucide-react';

interface DashboardProfileProps {
  user: any;
  refreshProfile?: () => Promise<void>;
}

export default function DashboardProfile({ user, refreshProfile }: DashboardProfileProps) {
  const isPaid = user?.plan === 'pro' || user?.plan === 'trial';
  const isCanceled = isPaid && !!user?.plan_cancel_at_period_end;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await res.json();

      if (data.error) {
        toast.error('Erro ao cancelar: ' + data.error);
      } else {
        toast.success(data.message || 'Assinatura cancelada com sucesso.');
        setShowCancelModal(false);
        if (refreshProfile) {
          await refreshProfile();
        }
      }
    } catch (err) {
      toast.error('Erro ao cancelar assinatura.');
      console.error(err);
    } finally {
      setIsCanceling(false);
    }
  };

  const getDaysLeft = (validUntilStr?: string) => {
    if (!validUntilStr) return null;
    const validUntil = new Date(validUntilStr);
    const today = new Date();
    validUntil.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans space-y-8">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 text-sm">Gerencie suas informações pessoais e os dados de sua assinatura.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUNA 1: DADOS DO USUÁRIO */}
        <section className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-50 w-10 h-10 rounded-lg flex items-center justify-center text-brand-600">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Informações da Conta</h2>
              <p className="text-gray-500 text-sm">Dados de identificação e contato cadastrados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome Completo</p>
              <div className="flex items-center gap-2.5 text-gray-700 bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm">
                <UserIcon size={16} className="text-gray-400" />
                <span className="font-medium truncate">{user?.name || 'Não informado'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail</p>
              <div className="flex items-center gap-2.5 text-gray-700 bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm">
                <Mail size={16} className="text-gray-400" />
                <span className="font-medium truncate">{user?.email || 'Não informado'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Cadastrado</p>
              <div className="flex items-center gap-2.5 text-gray-700 bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="font-medium">{user?.phone || 'Não cadastrado'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status da Conta</p>
              <div className="flex items-center gap-2.5 text-gray-700 bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm">
                <ShieldCheck size={16} className="text-gray-400" />
                <span className="font-semibold capitalize text-brand-600">
                  {user?.plan === 'pro' ? 'Assinante PRO' : user?.plan === 'trial' ? 'Período de Testes' : 'Plano Grátis'}
                </span>
              </div>
            </div>

            {user?.plan_valid_until && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Válido até</p>
                <div className="flex items-center gap-2.5 text-gray-700 bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm w-fit">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="font-medium">{new Date(user.plan_valid_until).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )}
            
          </div>
        </section>

        {/* COLUNA 2: MEU PLANO */}
        <section className="space-y-6">
          {/* PRO Plan Card */}
          <div className={`rounded-xl border p-6 flex flex-col relative overflow-hidden h-full ${isPaid ? 'border-brand-300 bg-brand-50 shadow-sm ring-1 ring-brand-500/20' : 'border-gray-200 bg-white shadow-sm'}`}>
            {isPaid && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
            )}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  {isPaid ? 'Plano PRO' : 'Plano Grátis'}
                  <Zap size={16} className="text-brand-500 fill-brand-500" />
                </h3>
                <p className="text-gray-500 text-sm">{isPaid ? 'Acesso total e ilimitado' : 'Limites gratuitos ativos'}</p>
              </div>
              {isPaid && (isCanceled
                ? <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Cancelado</span>
                : <span className="bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Ativo</span>
              )}
            </div>

            <div className="text-3xl font-black text-gray-900 relative z-10">
              R$ 14<span className="text-lg text-gray-500 font-medium">,99/mês</span>
            </div>

            {isPaid && user?.plan_valid_until && (
              <div className={`mt-3 mb-6 text-xs rounded-lg p-3 border font-medium relative z-10 ${isCanceled ? 'text-amber-700 bg-amber-50 border-amber-200/50' : 'text-brand-700 bg-brand-100/50 border-brand-200/30'}`}>
                {(() => {
                  const days = getDaysLeft(user.plan_valid_until);
                  const formattedDate = new Date(user.plan_valid_until).toLocaleDateString('pt-BR');
                  if (isCanceled) {
                    return (
                      <p>
                        Assinatura <span className="font-bold">cancelada</span>. Você mantém o acesso até <span className="font-bold">{formattedDate}</span> ({days} {days === 1 ? 'dia' : 'dias'}). Não haverá nova cobrança.
                      </p>
                    );
                  }
                  if (user.plan === 'trial') {
                    return (
                      <p>
                        Seu período de teste expira em <span className="font-bold">{formattedDate}</span> (restam <span className="font-bold">{days} {days === 1 ? 'dia' : 'dias'}</span>).
                      </p>
                    );
                  }
                  return (
                    <p>
                      Próxima renovação em <span className="font-bold">{formattedDate}</span> (em <span className="font-bold">{days} {days === 1 ? 'dia' : 'dias'}</span>).
                    </p>
                  );
                })()}
              </div>
            )}

            {!user?.plan_valid_until && <div className="mb-6"></div>}

            <ul className="space-y-3 mb-8 flex-1 relative z-10">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span className="text-brand-500">✓</span>
                <span>Análises ilimitadas de pratos</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span className="text-brand-500">✓</span>
                <span>Coach AI: Planos e Treinos</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span className="text-brand-500">✓</span>
                <span>Suporte prioritário no WhatsApp</span>
              </li>
            </ul>

            {isPaid ? (
              isCanceled ? (
                <div className="relative z-10">
                  <div className="w-full py-2 px-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-bold text-center text-xs">
                    Cancelamento agendado{user?.plan_valid_until ? ` — acesso até ${new Date(user.plan_valid_until).toLocaleDateString('pt-BR')}` : ''}
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-3">
                  <div className="w-full py-2 px-3 rounded-lg border border-brand-200 bg-brand-50 text-brand-700 font-bold text-center text-xs">
                    Plano Ativo — Acesso Liberado
                  </div>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 text-xs font-bold transition-colors uppercase tracking-wider"
                  >
                    Cancelar Assinatura
                  </button>
                </div>
              )
            ) : (
              <button 
                onClick={handleCheckout}
                className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-sm transition-colors relative z-10 flex items-center justify-center gap-2 text-sm"
              >
                <Zap size={18} fill="currentColor" />
                Ativar Plano PRO
              </button>
            )}
          </div>
        </section>

      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancelar Assinatura?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Você mantém o acesso PRO até o fim do período já pago — não haverá nova cobrança.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Manter plano
              </button>
              <button
                onClick={handleCancel}
                disabled={isCanceling}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isCanceling ? <Loader2 size={16} className="animate-spin" /> : null}
                {isCanceling ? 'Cancelando...' : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
