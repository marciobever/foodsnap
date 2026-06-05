'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from '@/pages/Dashboard';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, loading, logout, toggleAdminView, setIsProfessionalView, refreshProfile } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || null;

  const [isPolling, setIsPolling] = useState(!!sessionId);
  const [pollingStatus, setPollingStatus] = useState<'waiting' | 'success' | 'timeout' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !user) return;

    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    const maxDuration = 15000; // 15 segundos max de polling
    const pollInterval = 1500; // a cada 1.5 segundos
    const startTime = Date.now();

    const checkSubscriptionStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Usuário não autenticado');
        }

        const res = await fetch('/api/subscription/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erro na consulta do status');
        }

        const data = await res.json();

        if (data.active) {
          setPollingStatus('success');
          clearInterval(intervalId);
          clearTimeout(timeoutId);

          // Atualiza o perfil localmente
          await refreshProfile();

          // Limpa o parâmetro da URL para não rodar polling de novo
          setTimeout(() => {
            router.replace('/dashboard');
            setIsPolling(false);
          }, 2000);
        }
      } catch (err: any) {
        console.error('Erro no polling do status da assinatura:', err);
      }
    };

    // Inicia o polling periódico
    intervalId = setInterval(() => {
      if (Date.now() - startTime >= maxDuration) {
        clearInterval(intervalId);
        setPollingStatus('timeout');
        return;
      }
      checkSubscriptionStatus();
    }, pollInterval);

    // Timeout de segurança após 15 segundos
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (pollingStatus === 'waiting') {
        setPollingStatus('timeout');
      }
    }, maxDuration);

    // Executa a primeira consulta imediatamente
    checkSubscriptionStatus();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [sessionId, user, router, refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/');
    }
    return null;
  }

  // Se estiver ativamente em polling do status pós-checkout, exibe a tela de carregamento correspondente
  if (isPolling) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          
          {/* Luzes de fundo sutis */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl -z-10" />

          {pollingStatus === 'waiting' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="relative flex items-center justify-center w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl mx-auto">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Processando sua assinatura...</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Estamos confirmando o pagamento junto ao Stripe. Isso costuma levar apenas alguns segundos. Por favor, aguarde.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-800/50 flex justify-center items-center gap-1.5 text-[11px] text-gray-500 font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                Aguardando Confirmação
              </div>
            </div>
          )}

          {pollingStatus === 'success' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="relative flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Assinatura Ativada! 🎉</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Tudo certo! Seu pagamento foi confirmado e sua conta PRO já está ativa. Estamos te levando para o painel...
                </p>
              </div>
            </div>
          )}

          {pollingStatus === 'timeout' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="relative flex items-center justify-center w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mx-auto">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Quase lá...</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A confirmação está demorando um pouco mais do que o normal. Mas não se preocupe, sua assinatura será liberada automaticamente em breve.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={async () => {
                    setPollingStatus('waiting');
                    await refreshProfile();
                    // Reinicia o polling forçado
                    router.replace(`/dashboard?session_id=${sessionId}`);
                  }}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Verificar Novamente
                </button>
                <button 
                  onClick={() => {
                    setIsPolling(false);
                    router.replace('/dashboard');
                  }}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition-colors"
                >
                  Ir para o Painel Geral
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PAYWALL: redireciona para o checkout se não tiver plano ativo (apenas se não estiver rodando o polling do Stripe)
  if (user.plan === 'free') {
    if (typeof window !== 'undefined') {
      router.replace('/checkout');
    }
    return null;
  }

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onOpenAdmin={user.is_admin ? toggleAdminView : undefined}
      onOpenPro={() => setIsProfessionalView(true)}
      initialTab="overview"
      refreshProfile={refreshProfile}
    />
  );
}
