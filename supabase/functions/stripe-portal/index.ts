
/// <reference lib="deno.ns" />
import Stripe from "npm:stripe@16.12.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

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

async function getStripeCustomerId(userId: string) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/stripe_customers?user_id=eq.${userId}&select=stripe_customer_id`, {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.stripe_customer_id;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

    try {
        const auth = req.headers.get("authorization") || "";
        const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!jwt) return json({ ok: false, error: "Missing Authorization" }, 401);

        const user = await getUserFromJwt(jwt);
        if (!user?.id) return json({ ok: false, error: "Invalid token" }, 401);

        const customerId = await getStripeCustomerId(user.id);
        if (!customerId) return json({ ok: false, error: "Customer not found" }, 404);

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${SITE_URL}/dashboard`,
        });

        return json({ ok: true, url: session.url });
    } catch (err) {
        return json({ ok: false, error: String((err as any)?.message ?? err) }, 500);
    }
});
