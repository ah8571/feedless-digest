import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const confirmBaseUrl = Deno.env.get("CONFIRM_BASE_URL");
  const fromEmail =
    Deno.env.get("RESEND_FROM_EMAIL") ??
    "Feedfree Digest <onboarding@resend.dev>";

  if (!resendApiKey || !confirmBaseUrl) {
    return jsonResponse(500, {
      error: "Missing required environment variables.",
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

  const confirmationUrl = new URL(confirmBaseUrl);
  confirmationUrl.searchParams.set("token", confirmToken);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: "Confirm your Feedfree Digest signup",
      text: [
        "Thanks for joining Feedfree Digest.",
        "",
        "Confirm your email by opening the link below:",
        confirmationUrl.toString(),
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h1 style="font-size: 20px; margin-bottom: 12px;">Confirm your Feedfree Digest signup</h1>
          <p style="margin-bottom: 12px;">Thanks for joining Feedfree Digest.</p>
          <p style="margin-bottom: 20px;">Click the link below to confirm your email address:</p>
          <p style="margin-bottom: 20px;">
            <a href="${confirmationUrl.toString()}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 999px;">Confirm email</a>
          </p>
          <p style="font-size: 14px; color: #4b5563;">If the button does not work, open this URL:</p>
          <p style="font-size: 14px; word-break: break-all; color: #4b5563;">${confirmationUrl.toString()}</p>
        </div>
      `.trim(),
    }),
  });

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text();

    return jsonResponse(502, {
      error: "Resend request failed.",
      details: resendError,
    });
  }

  const resendBody = await resendResponse.json();

  return jsonResponse(200, {
    ok: true,
    id: resendBody.id ?? null,
  });
});