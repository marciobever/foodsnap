//nobundling
import { createClient } from "@supabase/supabase-js";
import * as wmill from "windmill-client";

/**
 * Windmill Script 2: Fetch User and State
 * 
 * Verifica no Supabase quem enviou a mensagem e em qual "fase" a IA está.
 * Implementa o Bloqueio (Paywall) do Trial.
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

  return [...new Set(candidates)];
}

export async function main(sender_number: string, message_id: string) {
  const SUPABASE_URL = await wmill.getVariable("u/bevervansomarcio/SUPABASE_URL");
  const SUPABASE_KEY = await wmill.getVariable("u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY");
  
  if(!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing Supabase credentials in Windmill Variables");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const phoneCandidates = generatePhoneCandidates(sender_number);

  let user: any = null;
  for (const candidate of phoneCandidates) {
      const { data } = await supabase
          .from("profiles")
          .select("id, phone, coach_personality")
          .eq("phone", candidate)
          .maybeSingle();

      if (data) {
          user = data;
          break;
      }
  }

  let { data: conv } = await supabase
      .from("whatsapp_sessions")
      .select("*")
      .eq("phone_number", sender_number)
      .maybeSingle();

  // UPSERT DO CONTEXTO
  if (!conv) {
      const initialState = user ? "IDLE" : "ASK_NAME";
      const { data: newConv } = await supabase
          .from("whatsapp_sessions")
          .insert({
              phone_number: sender_number,
              state: initialState
          })
          .select()
          .single();
      conv = newConv;
  } else if (!user) {
      if (conv.state !== "AWAITING_NAME") {
          conv.state = "ASK_NAME";
      }
      await supabase
          .from("whatsapp_sessions")
          .update({ state: conv.state, updated_at: new Date().toISOString() })
          .eq("phone_number", sender_number);
  } else {
      await supabase
          .from("whatsapp_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("phone_number", sender_number);
  }

  if (!user) {
      return { 
          has_account: false, 
          state: conv.state, 
          user_id: null,
          is_duplicate: false
      };
  }

  // Paywall Logic - Verifica se o Trial ou Assinatura está ativo
  let isLimitReached = true; // Por padrão, bloqueado
  
  const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

  if (sub && sub.status === "active") {
      isLimitReached = false;
  }

  const finalState = isLimitReached ? "LIMIT_REACHED" : (conv?.state || "IDLE");

  return {
      has_account: true,
      is_duplicate: false,
      user_id: user.id,
      state: finalState,
      conversation_id: sender_number,
      coach_personality: user.coach_personality || "gordon_ramsay",
      limit_reached: isLimitReached
  };
}
