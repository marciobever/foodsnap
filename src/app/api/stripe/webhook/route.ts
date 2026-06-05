import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2026-05-27.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = headers().get('stripe-signature');

        if (!signature || !webhookSecret) {
            return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message);
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.supabase_user_id;
                const subscriptionId = session.subscription as string;

                if (userId && subscriptionId) {
                    // Calculate next billing date assuming 1 month from now (Stripe handles the exact periods in invoice, this is just fallback)
                    const nextBillingDate = new Date();
                    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_subscription_id: subscriptionId,
                        status: 'active',
                        plan: 'pro',
                        valid_until: nextBillingDate.toISOString(),
                    }, { onConflict: 'user_id' });
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;
                const customerId = (invoice as any).customer as string;
                
                // Get period_end from the invoice line items
                const periodEnd = invoice.lines.data[0]?.period?.end;

                if (subscriptionId && periodEnd) {
                    const validUntil = new Date(periodEnd * 1000).toISOString();

                    // Retrieve the user by stripe_customer_id
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('id')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (profile) {
                        await supabaseAdmin.from('subscriptions').update({
                            status: 'active',
                            valid_until: validUntil,
                            stripe_subscription_id: subscriptionId
                        }).eq('user_id', profile.id);

                        // Registra o pagamento na tabela payments
                        await supabaseAdmin.from('payments').insert({
                            user_id: profile.id,
                            amount: (invoice.amount_paid / 100).toFixed(2), // Stripe amounts are in cents
                            status: 'completed',
                            plan_type: 'monthly',
                            payment_method: 'credit_card',
                        });
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;

                await supabaseAdmin.from('subscriptions').update({
                    status: 'canceled'
                }).eq('stripe_subscription_id', subscriptionId);
                break;
            }
            
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;
                // Se o usuário cancelou, o status pode continuar 'active' mas cancel_at_period_end = true.
                // Opcional: refletir isso no banco para mostrar pro usuário.
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
