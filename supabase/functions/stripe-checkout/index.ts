
/// <reference lib="deno.ns" />
import Stripe from "npm:stripe@16.12.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL")!;

// ✅ Plano único: FoodSnap PRO (R$14,99/mês) — leitura de alimentos + Coach IA
const PRICE_MENSAL = "price_1TLsAFA5eAF7o14GeHRMJLzB";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });

const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json", ...corsHeaders },
    });
}

async function getUserFromJwt(jwt: string) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            authorization: `Bearer ${jwt}`,
        },
    });
    if (!res.ok) return null;
    return await res.json();
}

/** Busca email do usuário pelo ID (para chamadas server-to-server via WhatsApp webhook) */
async function getUserEmailById(userId: string): Promise<string | null> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.email ?? null;
}

function assertBaseUrl(raw: string, name: string) {
    let u: URL;
    try {
        u = new URL(raw);
    } catch {
        throw new Error(`${name} inválida. Use https://... (ex: https://foodsnap.com.br)`);
    }
    if (u.protocol !== "https:" && u.hostname !== "localhost") {
        throw new Error(`${name} deve ser https:// (ou localhost em dev)`);
    }
    return u;
}

function priceIdForPlan() {
    // Plano único — sempre retorna o price mensal
    return PRICE_MENSAL;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

    try {
        if (!STRIPE_SECRET_KEY) return json({ ok: false, error: "Missing STRIPE_SECRET_KEY" }, 500);
        if (!SUPABASE_URL) return json({ ok: false, error: "Missing SUPABASE_URL" }, 500);
        if (!SITE_URL) return json({ ok: false, error: "Missing SITE_URL" }, 500);

        const site = assertBaseUrl(SITE_URL, "SITE_URL");
        const successUrl = new URL("/dashboard?checkout=success", site).toString();
        const cancelUrl = new URL("/dashboard?checkout=cancel", site).toString();
        const priceId = priceIdForPlan();

        const auth = req.headers.get("authorization") || "";
        const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const isServiceRole = jwt === SUPABASE_SERVICE_ROLE_KEY;

        if (isServiceRole) {
            // ── Chamada server-to-server (WhatsApp webhook) ──────────────
            // Usa user_id do body diretamente, sem precisar de JWT do usuário
            const body = await req.json().catch(() => ({}));
            if (!body?.user_id) return json({ ok: false, error: "Missing user_id for service role call" }, 400);

            const userId = body.user_id;
            const userEmail = await getUserEmailById(userId);

            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                allow_promotion_codes: true,
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: successUrl,
                cancel_url: cancelUrl,
                // NÃO pré-preenche email — o cliente WhatsApp digita o próprio email de cobrança
                metadata: { user_id: userId, plan_code: "mensal" },
                subscription_data: { metadata: { user_id: userId, plan_code: "mensal" } },
            });

            return json({ ok: true, url: session.url });
        }

        // ── Chamada normal via frontend (JWT do usuário) ─────────────────
        if (!jwt) return json({ ok: false, error: "Missing Authorization Bearer token" }, 401);

        const user = await getUserFromJwt(jwt);
        if (!user?.id) return json({ ok: false, error: "Invalid token" }, 401);

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            allow_promotion_codes: true,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: user.email ?? undefined,
            metadata: { user_id: user.id, plan_code: "mensal" },
            subscription_data: { metadata: { user_id: user.id, plan_code: "mensal" } },
        });

        return json({ ok: true, url: session.url });
    } catch (err) {
        console.error("stripe-checkout error:", err);
        return json({ ok: false, error: String((err as any)?.message ?? err) }, 500);
    }
});
