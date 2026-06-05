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

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('Stripe webhook received');
    console.log('Signature exists:', !!signature);
    console.log('Webhook secret prefix:', webhookSecret.substring(0, 10));
    console.log('Body length:', body.length);

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

    console.log('Stripe event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription as string | null;

        if (!userId || !subscriptionId) {
          console.warn('Missing userId or subscriptionId on checkout session');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscriptionAny = subscription as any;

        const validUntil = subscriptionAny.current_period_end
          ? new Date(subscriptionAny.current_period_end * 1000).toISOString()
          : null;

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
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          console.warn('Profile not found for Stripe customer:', customerId);
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
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionAny = subscription as any;

        const validUntil = subscriptionAny.current_period_end
          ? new Date(subscriptionAny.current_period_end * 1000).toISOString()
          : null;

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

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
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
