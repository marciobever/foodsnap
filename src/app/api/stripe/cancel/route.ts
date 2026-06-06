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

const n8nEmailWebhook = (process.env.N8N_EMAIL_WEBHOOK_URL || '').trim();

async function notifyEmail(payload: Record<string, any>) {
  if (!n8nEmailWebhook) return;
  try {
    await fetch(n8nEmailWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Falha ao notificar n8n (e-mail de cancelamento):', err);
  }
}

// current_period_end pode vir na raiz (API antiga) ou em items.data[0] (API atual)
function getPeriodEnd(sub: any): string | null {
  const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

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

    // Dados do usuário para o e-mail de confirmação
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .maybeSingle();
    const email = profile?.email || user.email || null;
    const name = profile?.full_name || null;

    // Caso normal: assinatura no Stripe → agenda cancelamento no fim do ciclo (mantém acesso até lá)
    if (subscription.stripe_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        { cancel_at_period_end: true }
      );

      const validUntil =
        getPeriodEnd(stripeSubscription) || subscription.valid_until || null;

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: stripeSubscription.status, // segue 'active' até o fim do ciclo
          cancel_at_period_end: true,
          valid_until: validUntil,
        })
        .eq('user_id', user.id);

      await notifyEmail({
        event: 'subscription_canceled',
        email,
        name,
        valid_until: validUntil,
      });

      return NextResponse.json({
        success: true,
        valid_until: validUntil,
        message:
          'Assinatura cancelada. Você mantém o acesso PRO até o fim do período já pago.',
      });
    }

    // Assinatura sem vínculo no Stripe (legado/manual):
    // não revoga na hora — mantém o acesso (status active) e marca para não renovar.
    await supabaseAdmin
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', user.id);

    await notifyEmail({
      event: 'subscription_canceled',
      email,
      name,
      valid_until: subscription.valid_until || null,
    });

    return NextResponse.json({
      success: true,
      valid_until: subscription.valid_until || null,
      message:
        'Assinatura cancelada. Você mantém o acesso PRO até o fim do período já pago.',
    });
  } catch (error: any) {
    console.error('Cancel Subscription Error:', error);

    return NextResponse.json(
      { error: error.message || 'Erro interno ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
