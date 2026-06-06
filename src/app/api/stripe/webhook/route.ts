import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecretKey =
  (process.env.STRIPE_SECRET_KEY || '').trim() || 'sk_test_dummy_key_for_build';

const stripe = new Stripe(stripeSecretKey);

const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dispara e-mails transacionais via workflow do n8n (sem custo de provedor).
// Configure N8N_EMAIL_WEBHOOK_URL no Vercel apontando para o webhook do n8n.
const n8nEmailWebhook = (process.env.N8N_EMAIL_WEBHOOK_URL || '').trim();

async function notifyEmail(payload: Record<string, any>) {
  if (!n8nEmailWebhook) {
    devWarn('N8N_EMAIL_WEBHOOK_URL não configurada — e-mail não enviado:', payload.event);
    return;
  }
  try {
    await fetch(n8nEmailWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Falha ao notificar n8n (e-mail):', err);
  }
}

// current_period_end pode vir na raiz (API antiga) ou em items.data[0] (API atual)
function getPeriodEnd(sub: any): string | null {
  const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

const isDev = process.env.NODE_ENV === 'development';

function devLog(...args: any[]) {
  if (isDev) {
    console.log(...args);
  }
}

function devWarn(...args: any[]) {
  if (isDev) {
    console.warn(...args);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    devLog('Stripe webhook received');
    devLog('Signature exists:', !!signature);
    devLog('Webhook secret prefix:', webhookSecret.substring(0, 10));
    devLog('Body length:', body.length);

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message);

      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      );
    }

    devLog('Stripe event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription as string | null;

        if (!userId || !subscriptionId) {
          devWarn('Missing userId or subscriptionId on checkout session');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscriptionAny = subscription as any;

        const validUntil = getPeriodEnd(subscription);

        await supabaseAdmin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            status: subscription.status,
            plan: 'pro',
            valid_until: validUntil,
            cancel_at_period_end: subscriptionAny.cancel_at_period_end,
          },
          { onConflict: 'user_id' }
        );

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        const invoiceId = invoice.id;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as any).subscription as string | null;

        const periodEnd = invoice.lines.data[0]?.period?.end;
        const validUntil = periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null;

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, full_name')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          devWarn('Profile not found for Stripe customer:', customerId);
          break;
        }

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            valid_until: validUntil,
            stripe_subscription_id: subscriptionId,
          })
          .eq('user_id', profile.id);

        const { data: existingPayment } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('stripe_invoice_id', invoiceId)
          .maybeSingle();

        if (!existingPayment) {
          await supabaseAdmin.from('payments').insert({
            user_id: profile.id,
            stripe_invoice_id: invoiceId,
            amount: invoice.amount_paid / 100,
            status: 'completed',
            plan_type: 'monthly',
            payment_method: 'credit_card',
          });

          // E-mail: 1ª compra (boas-vindas) vs renovação (recibo)
          const billingReason = (invoice as any).billing_reason;
          await notifyEmail({
            event:
              billingReason === 'subscription_create'
                ? 'purchase_approved'
                : 'payment_receipt',
            email: profile.email || (invoice as any).customer_email || null,
            name: profile.full_name || null,
            amount: invoice.amount_paid / 100,
            invoice_id: invoiceId,
            plan: 'PRO',
          });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionAny = subscription as any;

        const validUntil = getPeriodEnd(subscription);

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            valid_until: validUntil,
            cancel_at_period_end: subscriptionAny.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('stripe_subscription_id', subscription.id);

        // Obs: o e-mail de cancelamento é enviado na hora pela rota /api/stripe/cancel.
        // Aqui (fim do ciclo) apenas marcamos como cancelado, sem reenviar e-mail.

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        await notifyEmail({
          event: 'payment_failed',
          email: prof?.email || (invoice as any).customer_email || null,
          name: prof?.full_name || null,
          amount: invoice.amount_due / 100,
        });

        break;
      }

      default:
        devLog(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook handler failed:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
