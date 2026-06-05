'use client';
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPassword(false);
      setForm({ email: '', password: '' });
    }
  }, [isOpen]);

  const friendlyError = (msg: string) => {
    const m = (msg || '').toLowerCase();
    if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (m.includes('database error')) return 'Erro no servidor. Tente novamente.';
    return 'Erro: ' + msg;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) { setErrorMsg(friendlyError(error.message)); setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (error) throw error;
      setSuccessMsg('Login realizado! Redirecionando...');
      setTimeout(() => onSuccess(), 1200);
    } catch (err: any) {
      setErrorMsg(friendlyError(err?.message || 'Erro'));
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
          />
          <motion.div
            {...{ initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 } } as any}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Acessar conta</h3>
                  <p className="text-gray-500 text-sm mt-1">Entre para continuar no FoodSnap</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {errorMsg && (
                <motion.div {...{ initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } } as any} className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div {...{ initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } } as any} className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle size={18} className="shrink-0" />
                  <span className="font-medium">{successMsg}</span>
                </motion.div>
              )}

              {/* Google */}
              <button
                type="button" onClick={handleGoogleLogin}
                disabled={loading || !!successMsg}
                className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm mb-5"
              >
                <GoogleIcon />
                Continuar com Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email" required disabled={!!successMsg}
                      className="w-full bg-white text-gray-900 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all placeholder-gray-400 disabled:bg-gray-50"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'} required disabled={!!successMsg}
                      className="w-full bg-white text-gray-900 pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all placeholder-gray-400 disabled:bg-gray-50"
                      placeholder="Sua senha"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" disabled={!!successMsg} onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading || !!successMsg}
                  className={`w-full font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-80 disabled:cursor-not-allowed ${successMsg ? 'bg-green-600 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : successMsg ? <><CheckCircle size={20} /> Entrando...</> : <>Entrar <ArrowRight size={20} /></>}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-5">
                Não tem conta?{' '}
                <a href="/checkout" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                  Assinar agora →
                </a>
              </p>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock size={12} />
              Conexão segura SSL · Seus dados estão protegidos
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;