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

        // Recuperar perfil (para pegar stripe_customer_id se existir)
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let stripeCustomerId = profile?.stripe_customer_id;

        // Se não tiver ID no banco, tenta buscar no Stripe pelo email, ou cria um novo
        if (!stripeCustomerId) {
            const customers = await stripe.customers.search({
                query: `email:\'${user.email}\'`,
                limit: 1,
            });

            if (customers.data.length > 0) {
                stripeCustomerId = customers.data[0].id;
            } else {
                const newCustomer = await stripe.customers.create({
                    email: user.email,
                    name: profile?.full_name || '',
                    metadata: {
                        supabase_user_id: user.id,
                    }
                });
                stripeCustomerId = newCustomer.id;
            }

            // Atualiza o banco com o novo ID
            await supabaseAdmin
                .from('profiles')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('id', user.id);
        }

        // Pegar a URL base de onde a requisição veio (para redirecionar de volta)
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Montar a configuração de descontos (Cupom)
        const couponId = process.env.STRIPE_COUPON_ID;
        const discounts = couponId ? [{ coupon: couponId }] : undefined;

        // Criar a sessão de Checkout do Stripe
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            discounts: discounts,
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout?canceled=true`,
            metadata: {
                supabase_user_id: user.id,
            },
            subscription_data: {
                metadata: {
                    supabase_user_id: user.id,
                }
            }
        });

        if (!session.url) {
            throw new Error('Falha ao gerar URL de checkout do Stripe.');
        }

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Erro interno ao processar pagamento' }, { status: 500 });
    }
}
