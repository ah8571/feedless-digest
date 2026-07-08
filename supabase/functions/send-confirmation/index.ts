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

function formatFromEmail(rawFromEmail: string) {
  return rawFromEmail.includes("<") ? rawFromEmail : `Feedfree Digest <${rawFromEmail}>`;
}

async function sendConfirmationEmail(email: string, confirmToken: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const confirmBaseUrl = Deno.env.get("CONFIRM_BASE_URL");
  const fromEmail = formatFromEmail(
    Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev"
  );

  if (!resendApiKey || !confirmBaseUrl) {
    return {
      ok: false,
      status: 500,
      error: "Missing required environment variables.",
    };
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
        <div style="margin:0; padding:32px 20px; background-color:#ffffff; background-image:linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.06) 1px, transparent 1px); background-size:34px 34px; color:#111827; font-family:Arial, sans-serif;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e7e1d6; border-radius:24px; padding:36px 32px; box-shadow:0 18px 50px rgba(17, 24, 39, 0.08);">
            <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; color:#6b6254; margin-bottom:16px;">Feedfree Digest</div>
            <h1 style="font-size:34px; line-height:1.05; margin:0 0 18px; color:#111827; font-weight:700; max-width:11ch;">Confirm your signup</h1>
            <div style="width:100%; height:1px; margin:0 0 20px; background:#e7e1d6;"></div>
            <p style="font-size:18px; line-height:1.7; margin:0 0 14px; color:#3f3a33;">Thanks for joining Feedfree Digest.</p>
            <p style="font-size:18px; line-height:1.7; margin:0 0 26px; color:#3f3a33; max-width:30ch;">Click below to confirm your email address and finish joining the list.</p>
            <a href="${confirmationUrl.toString()}" style="display:inline-block; padding:14px 22px; background:#111827; color:#ffffff; text-decoration:none; border-radius:999px; font-size:16px; font-weight:700;">Confirm email</a>
          </div>
        </div>
      `.trim(),
    }),
  });

  if (!resendResponse.ok) {
    return {
      ok: false,
      status: 502,
      error: await resendResponse.text(),
    };
  }

  return {
    ok: true,
  };
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