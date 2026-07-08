import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendConfirmationEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SendConfirmationPayload = {
  email?: string;
  confirmToken?: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "Method not allowed. Use POST.",
    });
  }

  let payload: SendConfirmationPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, {
      error: "Invalid JSON body.",
    });
  }

  const email = payload.email?.trim().toLowerCase();
  const confirmToken = payload.confirmToken?.trim();

  if (!email || !confirmToken) {
    return jsonResponse(400, {
      error: "Both email and confirmToken are required.",
    });
  }

  const resendResult = await sendConfirmationEmail(email, confirmToken);

  if (!resendResult.ok) {
    return jsonResponse(502, {
      error: "Resend request failed.",
      details: resendResult.error,
    });
  }

  return jsonResponse(200, {
    ok: true,
    id: null,
  });
});