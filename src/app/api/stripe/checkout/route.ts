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
    const stripePriceId = (process.env.STRIPE_PRICE_ID || '').trim();
    const couponId = (process.env.STRIPE_COUPON_ID || '').trim();

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID não configurado' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Usuário já possui uma assinatura ativa' },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil do usuário não encontrado' },
        { status: 404 }
      );
    }

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customers = await stripe.customers.search({
        query: `email:'${user.email}'`,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: profile.full_name || '',
          metadata: {
            supabase_user_id: user.id,
          },
        });

        stripeCustomerId = newCustomer.id;
      }

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      discounts: couponId ? [{ coupon: couponId }] : undefined,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
    });

    if (!session.url) {
      throw new Error('Falha ao gerar URL de checkout do Stripe.');
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);

    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar pagamento' },
      { status: 500 }
    );
  }
}
