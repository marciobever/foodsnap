
/// <reference lib="deno.ns" />

import Stripe from "npm:stripe@16.12.0";

type EntitlementCode = "free" | "mensal" | "trimestral" | "anual" | "pro" | "trial";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// ✅ nomes oficiais no Supabase Edge
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const REQUIRED_OK = !!(
    STRIPE_SECRET_KEY &&
    STRIPE_WEBHOOK_SECRET &&
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "content-type": "application/json",
            ...extraHeaders,
        },
    });
}

function corsHeaders(origin: string | null) {
    const allowOrigin = origin ?? "*";
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type, stripe-signature",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
}

async function supabaseAdmin(path: string, init?: RequestInit) {
    const url = `${SUPABASE_URL}${path}`;
    return fetch(url, {
        ...init,
        headers: {
            "content-type": "application/json",
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            ...(init?.headers || {}),
        },
    });
}

async function upsertStripeCustomer(
    user_id: string,
    stripe_customer_id: string,
    email?: string | null,
) {
    const res = await supabaseAdmin(`/rest/v1/stripe_customers?on_conflict=user_id`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
            user_id,
            stripe_customer_id,
            email: email ?? null,
            updated_at: new Date().toISOString(),
        }),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`stripe_customers upsert failed: ${res.status} ${t}`);
    }
}

async function upsertEntitlement(
    user_id: string,
    entitlement_code: EntitlementCode,
    is_active: boolean,
    valid_until: string | null,
) {
    const res = await supabaseAdmin(`/rest/v1/user_entitlements?on_conflict=user_id`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
            user_id,
            entitlement_code,
            is_active,
            valid_until,
            updated_at: new Date().toISOString(),
        }),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`user_entitlements upsert failed: ${res.status} ${t}`);
    }
}

function safePlanCode(v: unknown): EntitlementCode {
    const s = String(v ?? "").toLowerCase().trim();
    if (s === "mensal" || s === "trimestral" || s === "anual" || s === "pro" || s === "trial" || s === "free") {
        return s;
    }
    return "free";
}

function secondsToISO(sec?: number | null) {
    if (!sec || !Number.isFinite(sec)) return null;
    return new Date(sec * 1000).toISOString();
}

/**
 * ✅ Correção do valid_until:
 * Em alguns payloads, `current_period_end` NÃO vem no root da subscription.
 * Ele vem em `items.data[0].current_period_end`.
 */
function getPeriodEndISO(sub: Stripe.Subscription) {
    const sec =
        (sub as any).current_period_end ??
        (sub as any)?.items?.data?.[0]?.current_period_end ??
        null;

    return secondsToISO(sec);
}

async function resolveUserId(customerId?: string | null, metadataUserId?: string | null) {
    if (metadataUserId) return metadataUserId;
    if (!customerId) return null;

    const q = new URLSearchParams();
    q.set("stripe_customer_id", `eq.${customerId}`);
    q.set("select", "user_id");
    q.set("limit", "1");

    const res = await supabaseAdmin(`/rest/v1/stripe_customers?${q.toString()}`, { method: "GET" });
    if (!res.ok) return null;

    const rows = await res.json();
    return rows?.[0]?.user_id ?? null;
}

Deno.serve(async (req) => {
    const origin = req.headers.get("origin");
    const cors = corsHeaders(origin);

    // Preflight (não é obrigatório pro Stripe, mas não atrapalha)
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    if (!REQUIRED_OK) {
        console.error("Missing required env vars.", {
            hasStripeKey: !!STRIPE_SECRET_KEY,
            hasWhsec: !!STRIPE_WEBHOOK_SECRET,
            hasSbUrl: !!SUPABASE_URL,
            hasSr: !!SUPABASE_SERVICE_ROLE_KEY,
        });
        return json({ ok: false, error: "Missing required env vars" }, 500, cors);
    }

    // Stripe manda POST
    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, cors);

    const sig = req.headers.get("stripe-signature") ?? "";
    if (!sig) return json({ ok: false, error: "Missing stripe-signature" }, 400, cors);

    const raw = await req.text();

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(raw, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return json({ ok: false, error: "Invalid signature" }, 400, cors);
    }

    try {
        const t = event.type;

        // 1) Checkout finalizado
        if (t === "checkout.session.completed") {
            const s = event.data.object as Stripe.Checkout.Session;

            const customerId = (s.customer as string | null) ?? null;
            const userId = await resolveUserId(customerId, (s.metadata?.user_id as string | undefined) ?? null);
            if (!userId) return json({ ok: true, skipped: true, reason: "no_user_id" }, 200, cors);

            const plan = safePlanCode(s.metadata?.plan_code);
            const email = (s.customer_details?.email ?? s.customer_email ?? null) as string | null;

            if (customerId) await upsertStripeCustomer(userId, customerId, email);

            // ✅ tenta já trazer o valid_until buscando a subscription (quando existir)
            let validUntil: string | null = null;
            if (s.subscription) {
                const sub = await stripe.subscriptions.retrieve(String(s.subscription));
                validUntil = getPeriodEndISO(sub) ?? null;
            }

            await upsertEntitlement(userId, plan, true, validUntil);
            return json({ ok: true }, 200, cors);
        }

        // 2) Subscription é a fonte da verdade
        if (t === "customer.subscription.created" || t === "customer.subscription.updated") {
            const sub = event.data.object as Stripe.Subscription;

            const customerId = (sub.customer as string | null) ?? null;
            const userId = await resolveUserId(customerId, (sub.metadata?.user_id as string | undefined) ?? null);
            if (!userId) return json({ ok: true, skipped: true, reason: "no_user_id" }, 200, cors);

            const plan = safePlanCode(sub.metadata?.plan_code);
            const isActive = sub.status === "active" || sub.status === "trialing";
            const validUntil = getPeriodEndISO(sub) ?? null;

            if (customerId) await upsertStripeCustomer(userId, customerId, null);
            await upsertEntitlement(userId, plan, isActive, validUntil);

            return json({ ok: true, plan, isActive, validUntil }, 200, cors);
        }

        // 3) Pause/Delete: volta pro free
        if (t === "customer.subscription.paused" || t === "customer.subscription.deleted") {
            const sub = event.data.object as Stripe.Subscription;

            const customerId = (sub.customer as string | null) ?? null;
            const userId = await resolveUserId(customerId, (sub.metadata?.user_id as string | undefined) ?? null);
            if (!userId) return json({ ok: true, skipped: true, reason: "no_user_id" }, 200, cors);

            await upsertEntitlement(userId, "free", false, null);
            return json({ ok: true }, 200, cors);
        }

        // 4) Pagamento Confirmado (Salvar no Histórico)
        if (t === "invoice.payment_succeeded") {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = (invoice.customer as string | null) ?? null;

            // Tenta pegar user_id do metadata da subscription ou do cliente
            let userId = await resolveUserId(customerId, null);

            // Fallback: Tenta pegar da subscription associada à invoice
            if (!userId && invoice.subscription) {
                try {
                    const sub = await stripe.subscriptions.retrieve(String(invoice.subscription));
                    userId = await resolveUserId(customerId, (sub.metadata?.user_id as string | undefined) ?? null);
                } catch (e) {
                    console.error("Error retrieving subscription for userId fallback:", e);
                }
            }

            if (!userId) {
                console.error("Invoice payment succeeded but could not resolve userId", { customerId, invoiceId: invoice.id });
                return json({ ok: true, skipped: true, reason: "no_user_id_for_invoice" }, 200, cors);
            }

            // Mapeia dados
            const amount = (invoice.amount_paid || 0) / 100; // Centavos para Real
            const currency = invoice.currency;
            const status = "completed";
            const method = invoice.collection_method === "charge_automatically" ? "credit_card" : "other"; // Simplificado

            // Tenta adivinhar o plano pelo valor ou linhas da fatura (básico)
            // Idealmente viria do metadata, mas na invoice pode ser mais chato de pegar sem chamada extra
            const lines = invoice.lines?.data || [];
            const planDescription = lines.length > 0 ? lines[0].description : "Assinatura";
            let planType = "monthly";
            if (planDescription?.toLowerCase().includes("anual")) planType = "yearly";
            if (planDescription?.toLowerCase().includes("trimestral")) planType = "quarterly";

            // Insere na tabela payments
            const { error: payErr } = await supabaseAdmin(`/rest/v1/payments`, {
                method: "POST",
                body: JSON.stringify({
                    user_id: userId,
                    amount: amount,
                    status: status,
                    plan_type: planType,
                    payment_method: method,
                    created_at: new Date().toISOString()
                }),
            });

            if (payErr) {
                // Loga erro mas não retorna 500 para não travar o webhook do Stripe (que tentaria reenviar)
                console.error("Error inserting payment record:", payErr);
            }

            return json({ ok: true, message: "Payment recorded" }, 200, cors);
        }

        return json({ ok: true, ignored: true, type: t }, 200, cors);
    } catch (err) {
        console.error("stripe-webhook handler error:", err);
        return json({ ok: false, error: String((err as any)?.message ?? err) }, 500, cors);
    }
});
