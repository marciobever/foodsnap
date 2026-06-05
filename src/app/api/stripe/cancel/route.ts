import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2026-05-27.dahlia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    // Pegar a assinatura ativa
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada no Stripe' }, { status: 404 });
    }

    // Cancelar no Stripe no final do período de faturamento atual
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
    });

    return NextResponse.json({ success: true, message: 'Assinatura cancelada com sucesso. Você terá acesso até o fim do ciclo atual.' });

  } catch (error: any) {
    console.error('Cancel Error:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao cancelar assinatura' }, { status: 500 });
  }
}
