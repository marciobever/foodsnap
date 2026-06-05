
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Initialize Supabase Client with the incoming user's Auth context
        // This allows us to use `auth.getUser()` securely based on the JWT sent by the frontend.
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        // 2. Get User from Token
        const {
            data: { user },
            error: authError,
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return new Response(
                JSON.stringify({ allowed: false, error: 'Unauthorized', reason: 'auth_failed' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 3. Check Entitlements (Active Plan?)
        // We look for the active subscription.
        const { data: sub, error: subError } = await supabaseClient
            .from('subscriptions')
            .select('status, plan, valid_until')
            .eq('user_id', user.id)
            .maybeSingle();

        if (subError) {
            console.error("Subscription check error:", subError);
        }

        // A plan is active if status is 'active' or 'trialing' AND (valid_until is NULL or valid_until > now)
        const isActive = sub && (sub.status === 'active' || sub.status === 'trialing') && (!sub.valid_until || new Date(sub.valid_until) > new Date());

        if (isActive) {
            return new Response(
                JSON.stringify({
                    allowed: true,
                    plan: sub.plan || 'pro',
                    reason: 'plan_active',
                    quota_remaining: -1 // Infinite/Plan
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 4. Check Free Quota (Coach Analyses)
        // Counts how many analyses already consumed the free quota.
        const { count, error: countError } = await supabaseClient
            .from('coach_assessments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('used_free_quota', true);

        if (countError) {
            console.error("Quota check error:", countError);
            throw new Error("Failed to check quota usage.");
        }

        const FREE_LIMIT = 3; // Defined limit for Coach
        const used = count || 0;
        const remaining = Math.max(0, FREE_LIMIT - used);

        if (remaining > 0) {
            return new Response(
                JSON.stringify({
                    allowed: true,
                    plan: 'free',
                    reason: 'free_quota',
                    quota_remaining: remaining
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 5. Quota Exceeded
        return new Response(
            JSON.stringify({
                allowed: false,
                plan: 'free',
                reason: 'quota_exceeded',
                quota_remaining: 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // 200 OK because logic was successful, just access denied
        );

    } catch (error: any) {
        console.error("Validate Access Error:", error);
        return new Response(
            JSON.stringify({ allowed: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
