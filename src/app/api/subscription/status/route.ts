import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
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
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscription) {
      return NextResponse.json({
        active: false,
        plan: 'free',
        status: 'none',
        validUntil: null,
      });
    }

    // A assinatura é considerada ativa se status for 'active' ou 'trialing'
    const isActive = ['active', 'trialing'].includes(subscription.status);

    return NextResponse.json({
      active: isActive,
      plan: subscription.plan || 'free',
      status: subscription.status,
      validUntil: subscription.valid_until,
    });
  } catch (error: any) {
    console.error('Subscription Status Error:', error);

    return NextResponse.json(
      { error: error.message || 'Erro interno ao obter status da assinatura' },
      { status: 500 }
    );
  }
}
