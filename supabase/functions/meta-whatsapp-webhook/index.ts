import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── Configurações ──────────────────────────────────────────────────
const META_VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN") as string;
const WINDMILL_WEBHOOK_URL = Deno.env.get("WINDMILL_WEBHOOK_URL") as string; 
const WINDMILL_TOKEN = Deno.env.get("WINDMILL_TOKEN") as string;

serve(async (req) => {
    // ── 1. Verificação do Webhook da Meta (GET) ───────────
    if (req.method === "GET") {
        const url = new URL(req.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
            console.log("[META] Webhook verificado com sucesso!");
            return new Response(challenge, { status: 200 });
        } else {
            return new Response("Forbidden", { status: 403 });
        }
    }

    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const payload = await req.json();

        // Verifica se é um evento válido do WhatsApp
        if (payload.object !== "whatsapp_business_account") {
            return new Response("Ignored", { status: 200 });
        }

        // ── 2. Delegação Assíncrona para o Windmill ───────────
        // Não usamos 'await' na chamada do Windmill para não prender a resposta da Meta.
        // A Meta exige um 200 OK em menos de 3 segundos.
        
        if (WINDMILL_WEBHOOK_URL) {
            console.log("[PROXY] Encaminhando payload para o Flow do Windmill...");
            
            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };
            
            // Se você configurou um Token no Windmill, enviamos ele. Se for público, ignora.
            if (WINDMILL_TOKEN) {
                headers["Authorization"] = `Bearer ${WINDMILL_TOKEN}`;
            }

            fetch(WINDMILL_WEBHOOK_URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ payload: payload }) 
            }).then(async (res) => {
                console.log(`[PROXY] Status retornado pelo Windmill: ${res.status}`);
                if (!res.ok) {
                    const text = await res.text();
                    console.error("[PROXY] Erro detalhado do Windmill:", text);
                }
            }).catch(err => console.error("[PROXY] Erro de rede ao chamar Windmill:", err));
        } else {
            console.error("[PROXY] WINDMILL_WEBHOOK_URL não configurada no Supabase.");
        }

        // ── 3. Resposta Imediata para a Meta ───────────
        return new Response("OK", { status: 200 });

    } catch (err) {
        console.error("[PROXY] Erro interno:", err);
        return new Response("Internal Server Error", { status: 500 });
    }
});
