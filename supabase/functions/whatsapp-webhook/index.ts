import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { SYSTEM_PROMPT, COACH_SYSTEM_PROMPT } from "./prompt.ts";
import { buildCoachPdfHtml } from "./pdf-template.ts";

// ─── Config ────────────────────────────────────────────────────────
const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") ?? "";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const INSTANCE_NAME = "foodsnap";
const FREE_FOOD_LIMIT = 5;

// ─── Types ─────────────────────────────────────────────────────────
interface EvolutionPayload {
    event: string;
    instance: string;
    data: {
        key: { remoteJid: string; fromMe: boolean; id: string };
        pushName?: string;
        messageType?: string;
        messageTimestamp?: number;
        message?: {
            imageMessage?: { mimetype: string };
            conversation?: string;
            extendedTextMessage?: { text: string };
        };
    };
    sender?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────

/** Remove tudo que não é dígito */
const onlyDigits = (s: string) => s.replace(/\D/g, "");

/**
 * Gera candidatos de número brasileiro (com/sem DDI 55, com/sem 9º dígito).
 * Usado para fazer match com profiles.phone_e164 e profiles.phone.
 */
function generatePhoneCandidates(raw: string): string[] {
    const candidates: string[] = [];
    const num = onlyDigits(raw);
    if (!num) return candidates;

    candidates.push(num);

    const withoutDDI = num.startsWith("55") ? num.slice(2) : num;
    if (withoutDDI !== num) candidates.push(withoutDDI);
    if (!num.startsWith("55")) candidates.push("55" + num);

    const ddd = withoutDDI.slice(0, 2);
    const rest = withoutDDI.slice(2);

    // Adiciona 9º dígito se tem 8 dígitos após DDD
    if (rest.length === 8) {
        const with9 = ddd + "9" + rest;
        candidates.push(with9);
        candidates.push("55" + with9);
    }

    // Remove 9º dígito se tem 9 dígitos após DDD
    if (rest.length === 9 && rest.startsWith("9")) {
        const without9 = ddd + rest.slice(1);
        candidates.push(without9);
        candidates.push("55" + without9);
    }

    return candidates;
}

/** Envia mensagem de texto via Evolution API */
async function sendWhatsAppMessage(remoteJid: string, text: string) {
    if (!EVOLUTION_API_URL) {
        console.error("[WH] EVOLUTION_API_URL not set! Cannot send message.");
        return;
    }
    try {
        const url = `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`;
        console.log(`[WH] Sending message to ${remoteJid.slice(0, 8)}... via ${url}`);
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
            body: JSON.stringify({
                number: remoteJid,
                text: text,
                delay: 1200,
            }),
        });
        const resBody = await res.text();
        console.log(`[WH] Evolution API response: ${res.status} ${resBody.slice(0, 200)}`);
    } catch (err) {
        console.error("[WH] Error sending WhatsApp message:", err);
    }
}

/** Envia mensagem interativa CTA (Botão de Link) via Evolution API com Fallback */
async function sendWhatsAppInteractiveMessage(remoteJid: string, text: string, buttonText: string, linkUrl: string) {
    if (!EVOLUTION_API_URL) {
        console.error("[WH] EVOLUTION_API_URL not set! Cannot send interactive message.");
        return;
    }
    try {
        const url = `${EVOLUTION_API_URL}/message/sendInteractive/${INSTANCE_NAME}`;
        console.log(`[WH] Sending interactive msg to ${remoteJid.slice(0, 8)}... via ${url}`);

        const payload = {
            number: remoteJid,
            options: { delay: 1200, presence: "composing" },
            interactiveMessage: {
                body: { text: text },
                footer: { text: "FoodSnap PRO" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: buttonText,
                                url: linkUrl
                            })
                        }
                    ]
                }
            }
        };

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.warn(`[WH] Interactive msg failed (${res.status}). Falling back to sendText.`);
            await sendWhatsAppMessage(remoteJid, `${text}\n\n👉 Acesse: ${linkUrl}`);
        } else {
            const resBody = await res.text();
            console.log(`[WH] Evolution sendInteractive response: ${res.status} ${resBody.slice(0, 200)}`);
        }
    } catch (err) {
        console.error("[WH] Error sending interactive msg, falling back:", err);
        await sendWhatsAppMessage(remoteJid, `${text}\n\n👉 Acesse: ${linkUrl}`);
    }
}

/** Envia documento (PDF) via Evolution API */
async function sendWhatsAppDocument(remoteJid: string, mediaUrl: string, fileName: string, caption?: string) {
    if (!EVOLUTION_API_URL) {
        console.error("[WH] EVOLUTION_API_URL not set! Cannot send document.");
        return;
    }
    try {
        const url = `${EVOLUTION_API_URL}/message/sendMedia/${INSTANCE_NAME}`;
        console.log(`[WH] Sending document to ${remoteJid.slice(0, 8)}... file=${fileName}`);
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
            body: JSON.stringify({
                number: remoteJid,
                mediatype: "document",
                media: mediaUrl,
                fileName: fileName,
                caption: caption || "",
                delay: 1200,
            }),
        });
        const resBody = await res.text();
        console.log(`[WH] Evolution sendMedia response: ${res.status} ${resBody.slice(0, 200)}`);
    } catch (err) {
        console.error("[WH] Error sending WhatsApp document:", err);
    }
}

/** Busca imagem em base64 da Evolution API */
async function getWhatsAppMedia(messageId: string): Promise<string | null> {
    if (!EVOLUTION_API_URL) {
        console.error("[WH] EVOLUTION_API_URL not set for media download!");
        return null;
    }
    try {
        const url = `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${INSTANCE_NAME}`;
        console.log(`[WH] Fetching media: ${url}, messageId=${messageId}`);
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
            body: JSON.stringify({
                message: { key: { id: messageId } },
                convertToMp4: false,
            }),
        });
        const resText = await res.text();
        console.log(`[WH] Media API response: ${res.status} ${resText.slice(0, 300)}`);

        if (!res.ok) return null;

        const data = JSON.parse(resText);
        // A API pode retornar em diferentes formatos
        const base64 = data.base64 || data.data?.base64 || null;
        console.log(`[WH] Got base64: ${base64 ? `${base64.length} chars` : "NULL"}`);
        return base64;
    } catch (err) {
        console.error("[WH] Error fetching media:", err);
        return null;
    }
}

/** Converte base64 → Uint8Array (para upload storage) */
function base64ToUint8Array(base64: string): Uint8Array {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

// ─── Geração de HTML para PDF do Coach ────────────────────────────
// (Movido para pdf-template.ts)

// ─── Normalização e limpeza do JSON do Gemini (portado do n8n) ────

const toNum = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
        const n = Number(v.replace(",", ".").trim());
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

const ensureArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);

const keyName = (s: string) =>
    (s || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const clampConfidence = (c: string) => {
    const k = keyName(c);
    if (k.includes("alta")) return "alta";
    if (k.includes("baixa")) return "baixa";
    return "media";
};

const CITRUS_VARIANTS = /^(tangerina|bergamota|mandarina|clementina|mexerica)/;

const CANONICAL_MAP = [
    { match: /^laranja/, canonical: "Laranja" },
    { match: /^banana/, canonical: "Banana" },
    { match: /^maca|^maçã/, canonical: "Maçã" },
    { match: /^pera/, canonical: "Pera" },
    { match: /^uva/, canonical: "Uva" },
    { match: /^abacaxi/, canonical: "Abacaxi" },
    { match: /^melancia/, canonical: "Melancia" },
    { match: /^melao|^melão/, canonical: "Melão" },
];

function canonicalizeName(name: string): string {
    const k = keyName(name);
    if (CITRUS_VARIANTS.test(k)) return "Laranja";
    for (const rule of CANONICAL_MAP) {
        if (rule.match.test(k)) return rule.canonical;
    }
    return (name || "").trim();
}

const stripCitrusMention = (s: string) => {
    const k = keyName(s);
    if (/(tangerina|bergamota|mandarina|clementina|mexerica)/.test(k)) {
        return s
            .replace(/tangerina\/bergamota/gi, "laranja")
            .replace(/tangerina|bergamota|mandarina|clementina|mexerica/gi, "laranja")
            .trim();
    }
    return s;
};

const parseUnitsPortion = (portion: string) => {
    const p = (portion || "").toLowerCase().replace(",", ".");
    const um = p.match(/(\d+)\s*unidades?/);
    const g = p.match(/(\d+(\.\d+)?)\s*g/);
    return {
        units: um ? Number(um[1]) : null,
        grams: g ? Math.round(Number(g[1])) : null,
    };
};

const buildUnitsPortion = (units: number | null, grams: number | null) => {
    const u = units && units > 0 ? units : null;
    const g = grams && grams > 0 ? grams : null;
    if (u && g) return `${u} unidades (${g}g)`;
    if (u) return `${u} unidades`;
    if (g) return `${g}g`;
    return "";
};

/**
 * Recebe o texto cru do Gemini e retorna o objeto normalizado
 * (portado do nó "Limpar Resultado" do n8n)
 */
function parseAndCleanGeminiResponse(rawText: string): any {
    // Limpa markdown
    let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Extrai JSON
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("JSON não encontrado na resposta do Gemini.");
    let jsonStr = m[0];

    // Corrige JSON mal formado
    jsonStr = jsonStr.replace(/:\s*\+(\d+(\.\d+)?)/g, ": $1");
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

    const parsed = JSON.parse(jsonStr);

    // Normaliza items
    parsed.items = ensureArray(parsed.items).map((it: any) => {
        const rawName = (it.name || "").trim();
        const k = keyName(rawName);
        const flags = ensureArray(it.flags);
        const name = canonicalizeName(rawName);
        const nextFlags = CITRUS_VARIANTS.test(k)
            ? Array.from(new Set([...flags, "tipo_duvidoso"]))
            : flags;

        return {
            ...it,
            name,
            portion: (it.portion || "").trim(),
            calories: toNum(it.calories),
            protein: toNum(it.protein),
            carbs: toNum(it.carbs),
            fat: toNum(it.fat),
            fiber: toNum(it.fiber),
            sugar: toNum(it.sugar),
            sodium_mg: toNum(it.sodium_mg),
            flags: nextFlags,
        };
    });

    // Deduplica por nome
    const byName = new Map<string, any>();
    for (const it of parsed.items) {
        const k = keyName(it.name);
        if (!k) continue;

        if (!byName.has(k)) {
            byName.set(k, it);
            continue;
        }

        const cur = byName.get(k);
        const a = parseUnitsPortion(cur.portion);
        const b = parseUnitsPortion(it.portion);
        let mergedPortion = cur.portion;
        if (a.units !== null || b.units !== null || a.grams !== null || b.grams !== null) {
            const units = (a.units || 0) + (b.units || 0);
            const grams = (a.grams || 0) + (b.grams || 0);
            const rebuilt = buildUnitsPortion(units || null, grams || null);
            if (rebuilt) mergedPortion = rebuilt;
        }

        byName.set(k, {
            ...cur,
            portion: mergedPortion,
            calories: toNum(cur.calories) + toNum(it.calories),
            protein: toNum(cur.protein) + toNum(it.protein),
            carbs: toNum(cur.carbs) + toNum(it.carbs),
            fat: toNum(cur.fat) + toNum(it.fat),
            fiber: toNum(cur.fiber) + toNum(it.fiber),
            sugar: toNum(cur.sugar) + toNum(it.sugar),
            sodium_mg: toNum(cur.sodium_mg) + toNum(it.sodium_mg),
            flags: Array.from(
                new Set([...ensureArray(cur.flags), ...ensureArray(it.flags), "deduplicado"])
            ),
        });
    }
    parsed.items = Array.from(byName.values());

    // Recalcula totais
    const sum = (arr: any[], f: string) => arr.reduce((a: number, b: any) => a + toNum(b[f]), 0);
    parsed.total = {
        calories: Math.round(sum(parsed.items, "calories")),
        protein: +sum(parsed.items, "protein").toFixed(1),
        carbs: +sum(parsed.items, "carbs").toFixed(1),
        fat: +sum(parsed.items, "fat").toFixed(1),
        fiber: +sum(parsed.items, "fiber").toFixed(1),
        sugar: +sum(parsed.items, "sugar").toFixed(1),
        sodium_mg: Math.round(sum(parsed.items, "sodium_mg")),
    };

    // Outros campos
    parsed.health_score = toNum(parsed.health_score);
    parsed.confidence = clampConfidence(parsed.confidence || "");
    parsed.assumptions = ensureArray(parsed.assumptions).map(stripCitrusMention);
    parsed.questions = ensureArray(parsed.questions);
    parsed.insights = ensureArray(parsed.insights).map(stripCitrusMention);
    parsed.swap_suggestions = ensureArray(parsed.swap_suggestions);
    parsed.next_best_actions = ensureArray(parsed.next_best_actions);

    parsed.tip =
        parsed.tip && typeof parsed.tip === "object"
            ? parsed.tip
            : { title: "", text: "", reason: "" };
    parsed.tip.title = String(parsed.tip.title || "");
    parsed.tip.text = stripCitrusMention(String(parsed.tip.text || ""));
    parsed.tip.reason = stripCitrusMention(String(parsed.tip.reason || ""));

    return parsed;
}

/**
 * Formata a análise em mensagem rica para WhatsApp
 * (portado do nó "Formatar Resposta WHATS" do n8n)
 */
function formatWhatsAppResponse(analysis: any): string {
    if (!analysis || !Array.isArray(analysis.items) || !analysis.items.length) {
        return "⚠️ Não foi possível identificar um alimento válido na imagem. Tente uma foto com melhor iluminação ou de um ângulo diferente.";
    }

    const items = analysis.items;
    const total = analysis.total || {};

    const fmt = (n: unknown) => {
        if (n === undefined || n === null || n === "") return "—";
        const num = Number(n);
        if (!Number.isFinite(num)) return String(n);
        return (Math.round(num * 10) / 10).toString();
    };

    const v = (x: unknown) => (x === undefined || x === null || x === "" ? "—" : x);
    const lines: string[] = [];

    lines.push("✨ *RELATÓRIO FOODSNAP* ✨");
    lines.push("━━━━━━━━━━━━━━━━━━━━");

    lines.push(`🔥 *Energia Total:* ${fmt(total.calories)} kcal`);
    if (analysis.health_score !== undefined) {
        const score = Number(analysis.health_score);
        let scoreEmoji = "🟢"; // High score
        if (score < 50) scoreEmoji = "🔴";
        else if (score < 80) scoreEmoji = "🟡";
        lines.push(`🏆 *Score Nutricional:* ${fmt(score)}/100 ${scoreEmoji}`);
    }

    lines.push("");
    lines.push("🧬 *MACRONUTRIENTES*");
    lines.push(`🥩 *Proteínas:* ${fmt(total.protein)}g`);
    lines.push(`🍞 *Carboidratos:* ${fmt(total.carbs)}g`);
    lines.push(`🥑 *Gorduras:* ${fmt(total.fat)}g`);

    lines.push("");
    lines.push("📊 *DETALHE DOS ITENS*");
    items.forEach((it: any) => {
        lines.push(`▪️ *${v(it.name)}* _(${v(it.portion)})_ ➔ ${fmt(it.calories)} kcal`);
    });

    lines.push("");
    lines.push("📌 *FIBRAS & EXTRAS*");
    lines.push(`🌾 Fibras: ${fmt(total.fiber)}g | 🍬 Açúcares: ${fmt(total.sugar)}g | 🧂 Sódio: ${fmt(total.sodium_mg)}mg`);

    if (analysis.swap_suggestions && analysis.swap_suggestions.length > 0) {
        lines.push("━━━━━━━━━━━━━━━━━━━━");
        lines.push("🔄 *Substituições Saudáveis*");
        analysis.swap_suggestions.forEach((swap: string) => {
            lines.push(`▪️ _${swap}_`);
        });
    }

    if (analysis.tip && analysis.tip.text) {
        lines.push("━━━━━━━━━━━━━━━━━━━━");
        lines.push("💡 *Dica de Nutrição*");
        lines.push(`_${analysis.tip.text}_`);
    }

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("🏋️‍♂️ *Quer um plano completo?*");
    lines.push("Digite *Coach* para iniciar a IA.");

    return lines.join("\n");
}

// ─── Main Handler ──────────────────────────────────────────────────

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const payload: EvolutionPayload = await req.json();

        // ── 0. Filtrar eventos irrelevantes ─────────────────────────
        const event = payload.event || "";
        console.log(`[WH] Event received: ${event}`);

        const IGNORED_EVENTS = [
            "connection.update",
            "qrcode.updated",
            "presence.update",
            "contacts.update",
            "groups.update",
            "chats.update",
        ];
        if (IGNORED_EVENTS.includes(event)) {
            console.log(`[WH] Event ignored: ${event}`);
            return new Response("Event ignored", { status: 200 });
        }

        const data = payload.data;
        if (!data || !data.key) {
            console.log(`[WH] Invalid payload — missing data or data.key`);
            return new Response("Invalid payload", { status: 200 });
        }

        const remoteJid = data.key.remoteJid;

        // Ignorar mensagens próprias ou de status
        if (data.key.fromMe || remoteJid.includes("status@")) {
            console.log(`[WH] Ignored: fromMe=${data.key.fromMe}, jid=${remoteJid}`);
            return new Response("Ignored", { status: 200 });
        }

        // ── 1. Extrair dados ────────────────────────────────────────
        const senderNumber = onlyDigits(remoteJid.replace(/@.*$/, ""));
        const senderFromPayload = payload.sender
            ? onlyDigits(String(payload.sender).replace(/@.*$/, ""))
            : "";
        const messageId = data.key.id;
        const isImage = !!data.message?.imageMessage;
        const textMessage =
            data.message?.conversation || data.message?.extendedTextMessage?.text || "";

        console.log(`[WH] sender=${senderNumber}, isImage=${isImage}, text="${textMessage.slice(0, 50)}"`);

        // Gerar candidatos de número BR
        const allCandidates = [
            ...generatePhoneCandidates(senderNumber),
            ...(senderFromPayload ? generatePhoneCandidates(senderFromPayload) : []),
        ];
        const phoneCandidates = [...new Set(allCandidates)];
        console.log(`[WH] phoneCandidates: ${JSON.stringify(phoneCandidates)}`);

        // ── 2. Init Supabase ────────────────────────────────────────
        const supabase = createClient(SUPABASE_URL, SUPABASE_SRK);

        // ── 3. Buscar usuário com phone_candidates ──────────────────
        let user: { id: string } | null = null;

        for (const candidate of phoneCandidates) {
            const { data: directMatch, error: matchErr } = await supabase
                .from("profiles")
                .select("id")
                .or(`phone_e164.eq.${candidate},phone.eq.${candidate}`)
                .maybeSingle();

            if (matchErr) {
                console.error(`[WH] DB error matching candidate ${candidate}:`, matchErr.message);
            }
            if (directMatch) {
                user = directMatch;
                console.log(`[WH] User found: ${user.id} (matched candidate: ${candidate})`);
                break;
            }
        }

        if (!user) {
            console.log(`[WH] User NOT found for candidates: ${phoneCandidates.join(", ")}`);
            await sendWhatsAppInteractiveMessage(
                remoteJid,
                "🚫 *Seu número não está cadastrado no FoodSnap*.\n\nPara usar a inteligência artificial via WhatsApp, você precisa ter uma conta ativa e o seu celular atualizado no perfil.",
                "📲 Criar Conta Grátis",
                "https://foodsnap.com.br"
            );
            return new Response("User not found", { status: 200 });
        }

        const userId = user.id;

        // ── 4. Estado da conversa (Coach state machine) ─────────────
        let { data: conv } = await supabase
            .from("whatsapp_sessions")
            .select("*")
            .eq("phone_number", senderNumber)
            .maybeSingle();

        if (!conv) {
            const { data: newConv } = await supabase
                .from("whatsapp_sessions")
                .insert({ phone_number: senderNumber, state: "IDLE", temp_data: {} })
                .select()
                .single();
            conv = newConv;
        }

        const state = conv?.state || "IDLE";
        console.log(`[WH] Conversation state: ${state}, conv exists: ${!!conv}`);

        // ── 5. Coach Flow ───────────────────────────────────────────

        // TRIGGER: texto contendo palavras-chave coach
        if (
            state === "IDLE" &&
            textMessage &&
            /coach|treino|avalia[çc][aã]o/i.test(textMessage)
        ) {
            // [STRICT VALIDATION] Check for active PAID plan
            const { data: entitlement } = await supabase
                .from("user_entitlements")
                .select("is_active, valid_until, entitlement_code")
                .eq("user_id", userId)
                .match({ is_active: true }) // Ensure active
                .maybeSingle();

            const isPaid = entitlement &&
                ['pro', 'mensal', 'trimestral', 'anual', 'trial', 'paid'].includes(entitlement.entitlement_code) &&
                (!entitlement.valid_until || new Date(entitlement.valid_until) > new Date());

            if (!isPaid) {
                await sendWhatsAppInteractiveMessage(
                    remoteJid,
                    "🔒 *Funcionalidade Exclusiva PRO*\n\nO *Personal Coach IA* está disponível apenas para assinantes Premium.\n\nCom o plano PRO você tem:\n✅ IA Analisadora de Físico (Fotos)\n✅ Treinos hiper-personalizados\n✅ Estratégia de Dieta com Macros",
                    "⭐ Desbloquear Coach",
                    "https://foodsnap.com.br"
                );
                return new Response("Coach Blocked (Free)", { status: 200 });
            }

            // [LOGIC START] Verificar última avaliação (Limite de 7 dias)
            // [LOGIC START] Verificar última avaliação (Limite de 7 dias)
            const { data: lastAnalysis } = await supabase
                .from("coach_assessments")
                .select("created_at")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (lastAnalysis && lastAnalysis.created_at) {
                const lastDate = new Date(lastAnalysis.created_at);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - lastDate.getTime());
                const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

                if (diffTime < sevenDaysInMs) {
                    const daysRemaining = Math.ceil((sevenDaysInMs - diffTime) / (1000 * 60 * 60 * 24));

                    await sendWhatsAppMessage(
                        remoteJid,
                        `⏳ *Calma, atleta!* O corpo precisa de tempo para evoluir.\n\nSua última avaliação foi há menos de uma semana.\nVocê poderá fazer uma nova avaliação em *${daysRemaining} dia(s)*.\n\nFoque no plano atual! 💪`
                    );
                    return new Response("Coach Cooldown", { status: 200 });
                }
            }
            // [LOGIC END]

            await supabase
                .from("whatsapp_sessions")
                .update({ state: "COACH_FRONT", temp_data: {} })
                .eq("phone_number", senderNumber);

            await sendWhatsAppMessage(
                remoteJid,
                "🏋️‍♂️ *Coach AI Iniciado!*\n\nVamos montar seu protocolo de treino e dieta.\nPara começar, envie uma foto do seu corpo de *FRENTE* (mostrando do pescoço até os joelhos, se possível)."
            );
            return new Response("Coach Started", { status: 200 });
        }

        // COACH_FRONT
        if (state === "COACH_FRONT") {
            if (!isImage) {
                await sendWhatsAppMessage(remoteJid, "⚠️ Por favor, envie a foto de *FRENTE* para continuarmos.");
                return new Response("Waiting Front", { status: 200 });
            }

            const base64 = await getWhatsAppMedia(messageId);
            if (!base64) return new Response("Error downloading media", { status: 200 });

            const fileName = `${userId}_front_${Date.now()}.jpg`;
            await supabase.storage
                .from("coach-uploads")
                .upload(fileName, base64ToUint8Array(base64), { contentType: "image/jpeg" });

            await supabase
                .from("whatsapp_sessions")
                .update({ state: "COACH_SIDE", temp_data: { ...conv!.temp_data, front_image: fileName } })
                .eq("phone_number", senderNumber);

            await sendWhatsAppMessage(remoteJid, "✅ Foto de frente recebida!\nAgora, envie uma foto de *LADO* (Perfil).");
            return new Response("Front Received", { status: 200 });
        }

        // COACH_SIDE
        if (state === "COACH_SIDE") {
            if (!isImage) {
                await sendWhatsAppMessage(remoteJid, "⚠️ Por favor, envie a foto de *LADO*.");
                return new Response("Waiting Side", { status: 200 });
            }

            const base64 = await getWhatsAppMedia(messageId);
            if (!base64) return new Response("Error downloading media", { status: 200 });

            const fileName = `${userId}_side_${Date.now()}.jpg`;
            await supabase.storage
                .from("coach-uploads")
                .upload(fileName, base64ToUint8Array(base64), { contentType: "image/jpeg" });

            await supabase
                .from("whatsapp_sessions")
                .update({ state: "COACH_BACK", temp_data: { ...conv!.temp_data, side_image: fileName } })
                .eq("phone_number", senderNumber);

            await sendWhatsAppMessage(remoteJid, "✅ Perfil recebido!\nPor último, envie uma foto de *COSTAS*.");
            return new Response("Side Received", { status: 200 });
        }

        // COACH_BACK
        if (state === "COACH_BACK") {
            if (!isImage) {
                await sendWhatsAppMessage(remoteJid, "⚠️ Por favor, envie a foto de *COSTAS*.");
                return new Response("Waiting Back", { status: 200 });
            }

            const base64 = await getWhatsAppMedia(messageId);
            if (!base64) return new Response("Error downloading media", { status: 200 });

            const fileName = `${userId}_back_${Date.now()}.jpg`;
            await supabase.storage
                .from("coach-uploads")
                .upload(fileName, base64ToUint8Array(base64), { contentType: "image/jpeg" });

            await supabase
                .from("whatsapp_sessions")
                .update({ state: "COACH_GOAL", temp_data: { ...conv!.temp_data, back_image: fileName } })
                .eq("phone_number", senderNumber);

            await sendWhatsAppMessage(
                remoteJid,
                "📸 Todas as fotos recebidas!\n\nAgora digite o número do seu objetivo principal:\n1️⃣ Hipertrofia (Ganhar massa)\n2️⃣ Emagrecimento (Secar)\n3️⃣ Definição (Manter peso/trocar gordura por músculo)"
            );
            return new Response("Back Received", { status: 200 });
        }

        // COACH_GOAL
        if (state === "COACH_GOAL") {
            let goal = "Hipertrofia";
            if (textMessage.includes("2") || /emagreci/i.test(textMessage)) goal = "Emagrecimento";
            else if (textMessage.includes("3") || /defini/i.test(textMessage)) goal = "Definição";
            else if (!textMessage.includes("1") && !/hiper/i.test(textMessage)) {
                await sendWhatsAppMessage(remoteJid, "⚠️ Não entendi. Responda com 1, 2 ou 3.");
                return new Response("Waiting Goal", { status: 200 });
            }

            await sendWhatsAppMessage(
                remoteJid,
                "🤖 Estou analisando seu físico e montando o plano com a IA...\nIsso pode levar cerca de 10-15 segundos."
            );

            try {
                const { front_image, side_image, back_image } = conv!.temp_data;
                const images = [front_image, side_image, back_image];
                const parts: any[] = [{ text: COACH_SYSTEM_PROMPT }, { text: `Objetivo: ${goal}` }];

                for (const imgPath of images) {
                    if (imgPath) {
                        const { data: blob } = await supabase.storage.from("coach-uploads").download(imgPath);
                        if (blob) {
                            const buffer = await blob.arrayBuffer();
                            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                            parts.push({ inlineData: { mimeType: "image/jpeg", data: base64 } });
                        }
                    }
                }

                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const result = await model.generateContent({
                    contents: [{ role: "user", parts }],
                    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
                });

                const responseText = result.response.text();
                const plan = JSON.parse(responseText);

                let msg = `🔥 *SEU PROTOCOLO TITAN* 🔥\n\n`;
                msg += `🧬 *Análise*: ${plan.analysis?.somatotype}, ${plan.analysis?.muscle_mass_level} massa muscular.\n`;
                msg += `🎯 *Foco*: ${plan.workout?.focus}\n\n`;
                msg += `🏋️ *Treino*: Divisão ${plan.workout?.split} (${plan.workout?.frequency_days}x/semana)\n`;
                msg += `🥗 *Dieta*: ${Math.round(plan.diet?.total_calories)} kcal\n`;
                msg += `   • P: ${plan.diet?.macros?.protein_g}g | C: ${plan.diet?.macros?.carbs_g}g | G: ${plan.diet?.macros?.fats_g}g\n\n`;
                msg += `💊 *Suplementos*: ${plan.diet?.supplements?.map((s: any) => s.name).join(", ")}\n\n`;
                msg += `💡 *Dica*: ${plan.motivation_quote}\n\n`;
                msg += `📲 *Acesse o app para ver o plano completo e detalhado!*`;

                await sendWhatsAppMessage(remoteJid, msg);

                // ── Gerar PDF e enviar via WhatsApp ─────────────────
                try {
                    const pdfFileName = `FoodSnap_Titan_${new Date().toISOString().split("T")[0]}`;
                    const pdfHtml = buildCoachPdfHtml(plan);

                    console.log("[WH] Generating PDF via n8n/Gotenberg...");
                    const pdfResponse = await fetch("https://n8n.seureview.com.br/webhook/pdf-coach", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ html: pdfHtml, file_name: pdfFileName }),
                    });

                    if (pdfResponse.ok) {
                        const pdfBlob = await pdfResponse.arrayBuffer();
                        const pdfBytes = new Uint8Array(pdfBlob);
                        const storagePath = `${userId}/${pdfFileName}.pdf`;

                        // Upload para Supabase Storage
                        const { error: uploadErr } = await supabase.storage
                            .from("coach-pdfs")
                            .upload(storagePath, pdfBytes, {
                                contentType: "application/pdf",
                                upsert: true,
                            });

                        if (uploadErr) {
                            console.error("[WH] PDF upload error:", uploadErr);
                        } else {
                            // URL Assinada (funciona mesmo com bucket privado)
                            const { data: urlData, error: signErr } = await supabase.storage
                                .from("coach-pdfs")
                                .createSignedUrl(storagePath, 60 * 60); // 1 hora de validade

                            if (signErr || !urlData?.signedUrl) {
                                console.error("[WH] Signed URL error:", signErr);
                            } else {
                                await sendWhatsAppDocument(
                                    remoteJid,
                                    urlData.signedUrl,
                                    `${pdfFileName}.pdf`,
                                    "📄 Seu Protocolo Titan completo em PDF!"
                                );
                            }
                        }
                    } else {
                        console.error("[WH] n8n PDF error:", pdfResponse.status, await pdfResponse.text());
                    }
                } catch (pdfErr) {
                    console.error("[WH] PDF generation/send error (non-blocking):", pdfErr);
                    // PDF is non-blocking — user already got the text summary
                }

                // ── Salvar análise coach (enriquecido p/ dashboard) ─
                const { error: saveCoachErr } = await supabase.from("coach_assessments").insert({
                    user_id: userId,
                    source: "whatsapp",
                    ai_raw_response: responseText,
                    ai_structured: plan,
                    goal_suggestion: goal,
                    biotype: plan.analysis?.somatotype || null,
                    estimated_body_fat: parseFloat(String(plan.analysis?.body_fat_percentage || 0)) || 0,
                    muscle_mass_level: plan.analysis?.muscle_mass_level || null,
                    workout_plan: typeof plan.workout === 'string' ? plan.workout : JSON.stringify(plan.workout),
                    diet_plan: typeof plan.diet === 'string' ? plan.diet : JSON.stringify(plan.diet),
                });

                if (saveCoachErr) {
                    console.error("[WH] Error saving coach analysis to DB:", saveCoachErr);
                } else {
                    console.log("[WH] Coach analysis saved successfully for user:", userId);
                }

                // Reset state
                await supabase
                    .from("whatsapp_sessions")
                    .update({ state: "IDLE", temp_data: {} })
                    .eq("phone_number", senderNumber);
            } catch (err) {
                console.error("Coach Gen Error:", err);
                await sendWhatsAppMessage(
                    remoteJid,
                    "⚠️ Ocorreu um erro ao gerar seu plano. Tente novamente digitando 'Coach'."
                );
                await supabase
                    .from("whatsapp_sessions")
                    .update({ state: "IDLE", temp_data: {} })
                    .eq("phone_number", senderNumber);
            }

            return new Response("Coach Workflow Completed", { status: 200 });
        }

        // ── 6. Food Scan Flow (IDLE) ────────────────────────────────
        if (state === "IDLE") {
            console.log(`[WH] Entering Food Scan flow. isImage=${isImage}`);
            // 6a. Verificar plano e quota
            // 6a. Verificar plano e quota
            const { data: entitlement } = await supabase
                .from("user_entitlements")
                .select("is_active, valid_until, entitlement_code")
                .eq("user_id", userId)
                .match({ is_active: true })
                .maybeSingle();

            const isPaid = entitlement &&
                ['pro', 'mensal', 'trimestral', 'anual', 'trial', 'paid'].includes(entitlement.entitlement_code) &&
                (!entitlement.valid_until || new Date(entitlement.valid_until) > new Date());

            if (!isPaid) {
                const { count: freeUsed } = await supabase
                    .from("food_analyses")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", userId)
                    .eq("used_free_quota", true);

                if ((freeUsed || 0) >= FREE_FOOD_LIMIT) {
                    await sendWhatsAppInteractiveMessage(
                        remoteJid,
                        `🚫 *Limite gratuito atingido*\nVocê já usou suas ${FREE_FOOD_LIMIT} análises grátis.\n\nAssine o plano PRO para escaneamento de alimentos e uso ilimitado do bot inteligente.`,
                        "🚀 Assinar Plano PRO",
                        "https://foodsnap.com.br"
                    );
                    return new Response("Quota exceeded", { status: 200 });
                }
            }

            // 6b. Sem imagem → mensagem de boas-vindas
            if (!isImage) {
                await sendWhatsAppMessage(
                    remoteJid,
                    "👋 Olá! Envie uma *foto do seu prato* (bem nítida e de cima 📸) que eu te retorno *calorias e macronutrientes* em segundos.\n\nOu digite *Coach* para iniciar uma consultoria completa."
                );
                return new Response("Text handled", { status: 200 });
            }

            // 6c. Processar imagem
            await sendWhatsAppMessage(remoteJid, "📸 Recebi sua foto! Estou analisando o prato agora… ⏳");

            const base64Image = await getWhatsAppMedia(messageId);
            if (!base64Image) {
                await sendWhatsAppMessage(remoteJid, "⚠️ Não consegui baixar a imagem. Tente enviar novamente.");
                return new Response("Error downloading image", { status: 200 });
            }

            // 6d. Chamar Gemini
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const geminiResult = await model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: SYSTEM_PROMPT },
                            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                        ],
                    },
                ],
                generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
            });

            const rawResponseText = geminiResult.response.text();

            // 6e. Limpar e normalizar resultado
            let analysis: any;
            try {
                analysis = parseAndCleanGeminiResponse(rawResponseText);
            } catch (parseErr) {
                console.error("Parse error:", parseErr);
                await sendWhatsAppMessage(
                    remoteJid,
                    "⚠️ Houve um erro ao interpretar a análise. Tente enviar a foto novamente com boa iluminação."
                );
                return new Response("Parse error", { status: 200 });
            }

            // 6f. Formatar e enviar resposta
            const replyText = formatWhatsAppResponse(analysis);
            await sendWhatsAppMessage(remoteJid, replyText);

            // 6g. Mapear confidence para enum do banco
            const confidenceMap: Record<string, string> = {
                alta: "high",
                media: "medium",
                média: "medium",
                baixa: "low",
            };

            // 6h. Salvar no banco
            const { data: inserted } = await supabase
                .from("food_analyses")
                .insert({
                    user_id: userId,
                    source: "whatsapp",
                    image_url: null, // será atualizado após upload
                    ai_raw_response: rawResponseText,
                    ai_structured: analysis,
                    total_calories: analysis.total?.calories || 0,
                    total_protein: analysis.total?.protein || 0,
                    total_carbs: analysis.total?.carbs || 0,
                    total_fat: analysis.total?.fat || 0,
                    total_fiber: analysis.total?.fiber || 0,
                    total_sodium_mg: analysis.total?.sodium_mg || 0,
                    nutrition_score: analysis.health_score || 0,
                    confidence_level: confidenceMap[analysis.confidence] || "medium",
                    used_free_quota: !isPaid,
                })
                .select("id")
                .single();

            // 6i. Upload imagem para Supabase Storage (bucket consultas)
            if (inserted?.id) {
                try {
                    const imgPath = `${userId}/${inserted.id}.jpg`;
                    const imgBytes = base64ToUint8Array(base64Image);
                    await supabase.storage
                        .from("consultas")
                        .upload(imgPath, imgBytes, { contentType: "image/jpeg", upsert: true });

                    // Atualizar image_url no registro
                    const { data: { publicUrl } } = supabase.storage
                        .from("consultas")
                        .getPublicUrl(imgPath);

                    await supabase
                        .from("food_analyses")
                        .update({ image_url: publicUrl })
                        .eq("id", inserted.id);
                } catch (uploadErr) {
                    console.error("Image upload error (non-fatal):", uploadErr);
                    // Não falha o fluxo principal por erro de upload
                }
            }

            return new Response("Food Analyzed", { status: 200 });
        }

        return new Response("Nothing happened", { status: 200 });
    } catch (err: any) {
        console.error("Critical Error:", err);
        return new Response(`Server error: ${err.message}`, { status: 500 });
    }
});
