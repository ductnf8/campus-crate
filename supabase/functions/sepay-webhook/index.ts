/// <reference types="https://deno.land/x/deno.ns/mod.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify SePay API key from request headers
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      req.headers.get("x-api-key") ||
      req.headers.get("apikey") ||
      "";
    const apiKey = Deno.env.get("SEPAY_API_KEY");
    const normalizeKey = (value: string) =>
      value
        .trim()
        .replace(/^(apikey|bearer)\s+/i, "")
        .trim();
    if (apiKey && normalizeKey(authHeader) !== normalizeKey(apiKey)) {
      console.warn("Invalid SePay auth header:", authHeader.slice(0, 32));
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawPayload = await req.json();
    const payload = (rawPayload?.data && typeof rawPayload.data === "object")
      ? rawPayload.data
      : rawPayload;
    console.log("SePay webhook payload:", JSON.stringify(payload));

    const parseMoney = (value: unknown): number => {
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      if (typeof value === "string") {
        const normalized = value.replace(/[^\d.-]/g, "");
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    // SePay payload fields
    const amount = parseMoney(payload.transferAmount ?? payload.amount ?? payload.amountIn ?? 0);
    const transferType = String(payload.transferType || payload.type || "").toLowerCase(); // "in" = nhận tiền
    const content = String(payload.content || payload.description || payload.transferContent || "");
    const referenceCode = String(payload.referenceCode || payload.code || payload.id || "");
    const bankBrand = String(payload.gateway || payload.bank_brand || payload.bankName || "");

    const isIncoming = transferType ? transferType === "in" : parseMoney(payload.amountIn || 0) > 0;
    if (!isIncoming || amount <= 0) {
      return new Response(JSON.stringify({ success: true, message: "Ignored (not incoming)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract user code from content: NAPTIEN<userId8chars> or NAPTIEN_<userId8chars>
    const match = content.toUpperCase().match(/NAPTIEN[_\s]?([A-Z0-9]{6,})/);
    if (!match) {
      console.warn("No NAPTIEN code found in content:", content);
      return new Response(JSON.stringify({ success: false, message: "No transaction code found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const codeFragment = match[1].toLowerCase();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user whose id starts with codeFragment via RPC
    const { data: profiles, error: pErr } = await supabase
      .rpc("find_profile_by_id_prefix", { _prefix: codeFragment });

    if (pErr || !profiles || profiles.length === 0) {
      console.warn("User not found for code:", codeFragment);
      return new Response(JSON.stringify({ success: false, message: "User not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const profile = profiles[0];

    // Check duplicate by reference_code
    if (referenceCode) {
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("reference_code", referenceCode)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ success: true, message: "Duplicate ignored" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Insert transaction
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: profile.id,
      amount,
      type: "deposit",
      status: "completed",
      transaction_code: `NAPTIEN_${codeFragment.toUpperCase()}`,
      reference_code: referenceCode,
      bank_brand: bankBrand,
      description: content,
      raw_webhook: payload,
    });
    if (txError) {
      console.error("Insert transaction failed:", txError);
      return new Response(JSON.stringify({ success: false, message: "Insert transaction failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update balance
    const newBalance = Number(profile.balance) + amount;
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", profile.id);
    if (balanceError) {
      console.error("Update balance failed:", balanceError);
      return new Response(JSON.stringify({ success: false, message: "Update balance failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Credited ${amount} to user ${profile.id}, new balance: ${newBalance}`);

    return new Response(JSON.stringify({ success: true, message: "Balance updated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("SePay webhook error:", err);
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
