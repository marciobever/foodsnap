//nobundling
import * as wmill from "windmill-client";
import { createClient } from "@supabase/supabase-js";

/**
 * Windmill Script 12: Daily Summary / Reminder
 *
 * Roda agendado (schedule `daily_summary_21h`, 21h BRT). Envia SÓ para quem
 * mandou mensagem nas últimas ~23h (dentro da janela de serviço de 24h do
 * WhatsApp = grátis, sem template pago da Meta). Resume as refeições do dia
 * ou dá um empurrão se a pessoa não registrou nada.
 */

function generatePhoneCandidates(raw: string): string[] {
  if (!raw) return [];
  const candidates: string[] = [];
  const num = raw.replace(/\D/g, "");
  if (!num) return candidates;
  candidates.push(num);
  const withoutDDI = num.startsWith("55") ? num.slice(2) : num;
  if (withoutDDI !== num) candidates.push(withoutDDI);
  if (!num.startsWith("55")) candidates.push("55" + num);
  const ddd = withoutDDI.slice(0, 2);
  const rest = withoutDDI.slice(2);
  if (rest.length === 8) { const w = ddd + "9" + rest; candidates.push(w); candidates.push("55" + w); }
  if (rest.length === 9 && rest.startsWith("9")) { const w = ddd + rest.slice(1); candidates.push(w); candidates.push("55" + w); }
  return [...new Set(candidates)];
}

export async function main() {
  const META_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN") as string;
  const META_PHONE_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID") as string;
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL") as string;
  const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY") as string;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const GRAPH = "https://graph.facebook.com/v19.0";

  // Janela grátis: interagiu nas últimas 23h
  const since = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
  const { data: sessions } = await supabase
    .from("whatsapp_sessions")
    .select("phone_number, updated_at")
    .gte("updated_at", since);

  // Início do dia (Brasília)
  const startBR = new Date(Date.now() - 3 * 60 * 60 * 1000);
  startBR.setUTCHours(3, 0, 0, 0);

  let sent = 0, skipped = 0;

  for (const s of sessions || []) {
    const phone = s.phone_number as string;
    const cands = generatePhoneCandidates(phone);

    let user: any = null;
    for (const c of cands) {
      const { data } = await supabase.from("profiles").select("id").eq("phone", c).maybeSingle();
      if (data) { user = data; break; }
    }
    if (!user) { skipped++; continue; }

    // Só assinantes ativos
    const { data: sub } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle();
    if (!sub || sub.status !== "active") { skipped++; continue; }

    // Refeições de hoje
    const { data: rows } = await supabase
      .from("food_analyses")
      .select("total_calories, total_protein, calories, protein")
      .eq("user_id", user.id)
      .gte("created_at", startBR.toISOString());

    const n = (rows || []).length;
    let kcal = 0, prot = 0;
    for (const r of rows || []) {
      kcal += Number((r as any).total_calories ?? (r as any).calories ?? 0);
      prot += Number((r as any).total_protein ?? (r as any).protein ?? 0);
    }

    const body = n > 0
      ? `📊 *Resumo de hoje*\n\n🔥 *${Math.round(kcal)}* kcal\n🍗 *${Math.round(prot)}g* de proteína\n🍽️ ${n} ${n === 1 ? "refeição registrada" : "refeições registradas"}\n\nMandou bem! Amanhã tem mais 💪`
      : `👀 Vi que você passou por aqui hoje mas não registrou nenhuma refeição.\n\nQue tal mandar a foto da próxima? Leva 5 segundos e eu cuido do resto! 🍽️`;

    const res = await fetch(`${GRAPH}/${META_PHONE_ID}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${META_TOKEN}` },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: phone, type: "text", text: { body } })
    });
    if (res.ok) sent++; else { skipped++; console.error("Falha envio", phone, await res.text()); }
  }

  return { total_sessions: (sessions || []).length, sent, skipped };
}
