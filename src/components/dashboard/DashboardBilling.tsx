'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Loader2, DollarSign } from 'lucide-react';

interface DashboardBillingProps {
  user: any;
}

export default function DashboardBilling({ user }: DashboardBillingProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPayments(data || []);
      } catch (err) {
        console.error("Erro ao carregar pagamentos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPayments();
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans space-y-8">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Meus Pagamentos</h1>
        <p className="text-gray-500 text-sm">Consulte o histórico de faturas e transações da sua assinatura.</p>
      </header>

      <section className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-brand-50 w-10 h-10 rounded-lg flex items-center justify-center text-brand-600">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Histórico de Transações</h2>
            <p className="text-gray-500 text-sm">Faturas processadas pela operadora Asaas.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-500 w-8 h-8" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 mx-auto text-gray-400">
              <DollarSign size={20} />
            </div>
            <p className="text-gray-400 text-sm">Nenhum pagamento registrado ainda.</p>
            <p className="text-gray-400 text-xs mt-1">As cobranças de teste aparecerão aqui após serem confirmadas no Sandbox.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-600">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      {p.plan_type === 'monthly' ? 'Mensal' : p.plan_type}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-xs">
                      {p.payment_method === 'credit_card' ? '💳 Cartão de Crédito' : p.payment_method === 'pix' ? '⚡ PIX' : p.payment_method}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      R$ {parseFloat(p.amount).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        p.status === 'completed' 
                          ? 'bg-green-50 text-green-700 border border-green-200/50' 
                          : p.status === 'canceled'
                          ? 'bg-red-50 text-red-700 border border-red-200/50'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'completed' 
                            ? 'bg-green-500' 
                            : p.status === 'canceled'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}></span>
                        {p.status === 'completed' 
                          ? 'Pago' 
                          : p.status === 'canceled'
                          ? 'Cancelado'
                          : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
