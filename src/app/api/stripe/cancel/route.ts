import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecretKey =
  (process.env.STRIPE_SECRET_KEY || '').trim() || 'sk_test_dummy_key_for_build';

const stripe = new Stripe(stripeSecretKey);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 404 }
      );
    }

    // Caso normal: assinatura vinculada ao Stripe → agenda cancelamento no fim do ciclo.
    if (subscription.stripe_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: stripeSubscription.status,
          cancel_at_period_end: true,
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        message:
          'Assinatura cancelada com sucesso. Você terá acesso até o fim do ciclo atual.',
      });
    }

    // Assinatura sem vínculo no Stripe (legado/manual) → cancela localmente.
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: false,
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso.',
    });
  } catch (error: any) {
    console.error('Cancel Subscription Error:', error);

    return NextResponse.json(
      { error: error.message || 'Erro interno ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
