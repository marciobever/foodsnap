'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import {
  Zap, ShieldCheck, Lock, Loader2, CheckCircle2, CreditCard, ArrowRight,
  Mail, Eye, EyeOff, MessageCircle, LogOut, User as UserIcon
} from 'lucide-react';

// ── Formatters ──────────────────────────────────────────────────────────────
function formatPhone(v: string) {
  // Allow digits, plus sign and spaces for international format
  return v.replace(/[^\d+ ]/g, '');
}

const FEATURES = [
  'Análises de refeição ILIMITADAS via WhatsApp',
  'Coach pessoal com 7 personalidades de IA',
  'Avaliações físicas ILIMITADAS',
  'Plano de treino e dieta personalizado',
  'Histórico completo e gráficos de evolução',
];

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ── Friendly errors ─────────────────────────────────────────────────────────
function friendlyError(msg: string) {
  const m = (msg || '').toLowerCase();
  if (m.includes('already registered') || m.includes('user already registered')) return 'Este e-mail já está cadastrado. Use a opção de login.';
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('password should be at least')) return 'Senha muito curta (mínimo 6 caracteres).';
  if (m.includes('duplicate key') || m.includes('profiles_phone')) return 'Esse número de WhatsApp já está em uso em outra conta.';
  if (m.includes('database error')) return 'Erro no servidor. Tente novamente.';
  return 'Erro: ' + msg;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading, refreshProfile } = useUser();

  const [step, setStep] = useState<'account' | 'payment'>('account');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Se já é PRO/trial, redireciona pro dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.plan === 'pro') {
        router.replace('/dashboard');
        return;
      }
      setStep('payment');
    }
  }, [user, loading, router]);

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/checkout' },
    });
    if (error) {
      setError(friendlyError(error.message));
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setForm({ name: '', email: '', phone: '', password: '' });
    setError(null);
    setStep('account');
  };

  // ── Field handlers ────────────────────────────────────────────────────────
  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      set('phone', formatPhone(value));
      return;
    }
    set(name, value);
  };

  // ── Step 1 handlers ───────────────────────────────────────────────────────
  const handleAccountNext = () => {
    try {
      setError(null);
      if (!form.name.trim()) throw new Error('Informe seu nome completo.');
      if (!form.email.trim() || !form.email.includes('@')) throw new Error('Informe um e-mail válido.');
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (phoneDigits.replace(/\D/g, '').length < 10) throw new Error('Informe um número de WhatsApp válido com código do país e DDD.');
      if (form.password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
      
      setStep('payment');
    } catch (err: any) {
      setError(friendlyError(err.message));
    }
  };

  const handleLoginSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (loginErr) throw loginErr;
      if (!data.user || !data.session) throw new Error('Erro ao fazer login. Tente novamente.');

      await refreshProfile();
      setStep('payment');
    } catch (err: any) {
      setError(friendlyError(err?.message || 'Erro de login'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToAccount = () => {
    setError(null);
    setStep('account');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'account') {
      if (authMode === 'login') {
        await handleLoginSubmit();
      } else {
        handleAccountNext();
      }
    } else {
      await handleSubmit(e);
    }
  };

  // ── Submit — cria conta se necessário e redireciona para o Stripe ──────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let sessionToken: string | null = null;

      // 1. Se não está logado: cria conta e registra perfil
      if (!user) {
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (phoneDigits.replace(/\D/g, '').length < 10) throw new Error('Informe um número de WhatsApp válido com código do país e DDD.');

        // Cria conta no Supabase
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          options: { 
            data: { 
              full_name: form.name.trim(),
              phone: phoneDigits
            } 
          },
        });
        if (signUpErr) throw signUpErr;
        if (!data.user || !data.session) throw new Error('Erro ao criar conta. Tente novamente.');

        sessionToken = data.session.access_token;

        // Salva perfil + telefone no banco (via RPC)
        const { error: rpcErr } = await supabase.rpc('register_user_profile', {
          p_full_name: form.name.trim(),
          p_phone: phoneDigits,
          p_email: form.email.trim().toLowerCase(),
        });
        if (rpcErr) throw rpcErr;

      } else {
        // Já logado (Google / Login por Email) — salva telefone se ainda não tem
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (!user.phone) {
          if (phoneDigits.replace(/\D/g, '').length < 10) throw new Error('Informe um número de WhatsApp válido com código do país e DDD.');
          const { error: rpcErr } = await supabase.rpc('register_user_profile', {
            p_full_name: user.name,
            p_phone: phoneDigits,
            p_email: user.email,
          });
          if (rpcErr) throw rpcErr;
        }
        const { data: { session } } = await supabase.auth.getSession();
        sessionToken = session?.access_token || null;
      }

      if (!sessionToken) throw new Error('Sessão inválida. Faça login novamente.');

      // 2. Chama a API do Checkout do Stripe
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // 3. Redireciona para o Stripe Checkout Session
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Falha ao gerar URL de checkout do Stripe.');
      }

    } catch (err: any) {
      setError(friendlyError(err?.message || 'Erro desconhecido'));
      setSubmitting(false);
    }
  };

  // Usuário logado via Google sem telefone
  const googleUserNeedsPhone = !!user && !user.phone;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">

        {/* ── LEFT: Plan Summary ───────────────────────────────────────── */}
        <div className="bg-gray-900 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap size={16} fill="white" className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">FoodSnap</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full mb-4">
              <Zap size={12} className="text-brand-400" fill="currentColor" />
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">1º Mês por R$ 5,00</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Plano PRO</h1>
            <p className="text-gray-400 text-sm mb-8">
              A partir do 2º mês, apenas <span className="text-white font-semibold">R$ 14,99/mês</span>. Cancele quando quiser.
            </p>

            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 size={15} className="text-brand-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">A partir do 2º mês</p>
                <p className="text-white font-bold text-lg">R$ 14,99 <span className="text-gray-500 text-sm font-normal">/mês</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Hoje</p>
                <p className="text-brand-400 font-bold text-lg">R$ 5,00</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-600 text-xs"><Lock size={11} /><span>SSL 256-bit</span></div>
            <div className="flex items-center gap-1.5 text-gray-600 text-xs"><ShieldCheck size={11} /><span>PCI-DSS</span></div>
            <div className="flex items-center gap-1.5 text-gray-600 text-xs"><CreditCard size={11} /><span>Stripe</span></div>
          </div>
        </div>

        {/* ── RIGHT: Step-by-step Form ──────────────────────────────────── */}
        <div className="bg-gray-950 p-8 md:p-10 flex flex-col justify-center min-h-[480px]">

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {step === 'account' ? (
              // ── STEP 1: CADASTRO / LOGIN ──
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-white">
                    {authMode === 'register' ? 'Crie sua conta' : 'Acesse sua conta'}
                  </h2>
                  <button type="button" onClick={() => { setAuthMode(m => m === 'login' ? 'register' : 'login'); setError(null); }} className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                    {authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
                  </button>
                </div>

                {/* Google Button */}
                <button type="button" onClick={handleGoogleLogin} disabled={submitting}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60 text-sm">
                  <GoogleIcon />
                  Continuar com o Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-600 text-xs">ou preencha os dados</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                <div className="space-y-3">
                  {authMode === 'register' && (
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input name="name" type="text" required value={form.name} onChange={handleChange}
                        placeholder="Nome completo"
                        className="w-full bg-gray-800 border border-gray-700 focus:border-brand-500 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pl-9 text-sm outline-none transition-colors" />
                    </div>
                  )}

                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      placeholder="E-mail"
                      className="w-full bg-gray-800 border border-gray-700 focus:border-brand-500 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pl-9 text-sm outline-none transition-colors" />
                  </div>

                  {authMode === 'register' && (
                    <div className="relative">
                      <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                      <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                        placeholder="WhatsApp (ex: +55 11 99999-9999 ou +44 79...)"
                        className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pl-9 text-sm outline-none transition-colors" />
                    </div>
                  )}

                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                      placeholder="Senha (mínimo 6 caracteres)"
                      className="w-full bg-gray-800 border border-gray-700 focus:border-brand-500 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pl-9 pr-10 text-sm outline-none transition-colors" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 text-sm">
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Processando...</>
                  ) : authMode === 'register' ? (
                    <>Continuar para o pagamento <ArrowRight size={16} /></>
                  ) : (
                    <>Entrar e continuar <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            ) : (
              // ── STEP 2: PAGAMENTO ──
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Identificação do Usuário */}
                <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-4">
                  <div>
                    {user ? (
                      <>
                        <p className="text-white font-semibold text-sm">Olá, {user.name.split(' ')[0]}! 👋</p>
                        <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-xs">Identificação:</p>
                        <p className="text-white font-semibold text-sm mt-0.5">{form.name}</p>
                        <p className="text-gray-500 text-xs">{form.email}</p>
                      </>
                    )}
                  </div>
                  <button type="button" onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                    <LogOut size={12} /> Trocar conta
                  </button>
                </div>

                {/* Se for Google User sem telefone */}
                {googleUserNeedsPhone && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400">Vincular WhatsApp</label>
                    <div className="relative">
                      <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                      <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                        placeholder="WhatsApp (ex: +55 11 99999-9999 ou +44 79...)"
                        className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pl-9 text-sm outline-none transition-colors" />
                    </div>
                  </div>
                )}

                {/* Stripe Redirection Information */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-500 w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-bold">Pagamento 100% Seguro</p>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        Você será redirecionado para a página segura de pagamentos do <strong>Stripe</strong> para concluir a assinatura.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-500 w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-bold">Sem Digitação de Cartão Aqui</p>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        Nenhum dado de cartão de crédito é processado ou armazenado nos nossos servidores.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Finalizar Assinatura</h3>
                    {!user && (
                      <button type="button" onClick={handleBackToAccount} className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                        ← Alterar cadastro
                      </button>
                    )}
                  </div>

                  <p className="text-gray-400 text-xs leading-normal">
                    Valor cobrado hoje: <span className="text-brand-400 font-bold">R$ 5,00</span>.<br />
                    Renovação automática no próximo mês por <span className="text-white font-semibold">R$ 14,99/mês</span>. Cancele com um clique quando quiser.
                  </p>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 text-base">
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Redirecionando...</>
                  ) : (
                    <><Lock size={16} /> Ir para Pagamento Seguro <ArrowRight size={18} /></>
                  )}
                </button>

                <p className="text-center text-gray-500 text-[11px] leading-relaxed">
                  Ao clicar em "Ir para Pagamento Seguro" você concorda com nossos Termos de Uso e Política de Privacidade.
                </p>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
