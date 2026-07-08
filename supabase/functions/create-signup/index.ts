import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateSignupPayload = {
  email?: string;
  topics?: string[];
};

type SignupStatus = "pending_confirmation" | "confirmed_existing";

type SendConfirmationEmailResult = {
  ok: true;
} | {
  ok: false;
  status: number;
  error: string;
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

function normalizeTopics(topics: string[] | undefined) {
  if (!Array.isArray(topics)) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      topics
        .map((topic) => topic.trim())
        .filter((topic) => topic.length > 0)
    )
  );
}

function formatFromEmail(rawFromEmail: string) {
  return rawFromEmail.includes("<") ? rawFromEmail : `Feedfree Digest <${rawFromEmail}>`;
}

async function sendConfirmationEmail(
  email: string,
  confirmToken: string
): Promise<SendConfirmationEmailResult> {
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

  let confirmationUrl: URL;

  try {
    confirmationUrl = new URL(confirmBaseUrl);
  } catch {
    return {
      ok: false,
      status: 500,
      error: "CONFIRM_BASE_URL must be a full URL.",
    };
  }

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
        <div style="margin:0; padding:32px 20px; background:#f8f6f1; color:#111827; font-family:Arial, sans-serif;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e7e1d6; border-radius:24px; padding:36px 32px;">
            <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; color:#6b6254; margin-bottom:16px;">Feedfree Digest</div>
            <h1 style="font-size:34px; line-height:1.05; margin:0 0 18px; color:#111827; font-weight:700;">Confirm your signup</h1>
            <p style="font-size:18px; line-height:1.7; margin:0 0 14px; color:#3f3a33;">Thanks for joining Feedfree Digest.</p>
            <p style="font-size:18px; line-height:1.7; margin:0 0 26px; color:#3f3a33;">Click below to confirm your email address and finish joining the list.</p>
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

Deno.serve(async (request: Request) => {
  try {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(500, {
        error: "Missing required environment variables.",
      });
    }

    let payload: CreateSignupPayload;

    try {
      payload = await request.json();
    } catch {
      return jsonResponse(400, {
        error: "Invalid JSON body.",
      });
    }

    const email = payload.email?.trim().toLowerCase();
    const topics = normalizeTopics(payload.topics);

    if (!email) {
      return jsonResponse(400, {
        error: "Email is required.",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: existingSignup, error: lookupError } = await supabase
      .from("newsletter_signups")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      return jsonResponse(500, {
        error: "Could not check existing signup state.",
        details: lookupError.message,
      });
    }

    if (existingSignup?.status === "confirmed") {
      const { error: updateConfirmedError } = await supabase
        .from("newsletter_signups")
        .update({
          topics,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSignup.id);

      if (updateConfirmedError) {
        return jsonResponse(500, {
          error: "Could not update topic preferences.",
          details: updateConfirmedError.message,
        });
      }

      return jsonResponse(200, {
        ok: true,
        status: "confirmed_existing" satisfies SignupStatus,
      });
    }

    const timestamp = new Date().toISOString();
    const confirmToken = `${crypto.randomUUID()}-${Date.now().toString(36)}`;
    const unsubscribeToken = crypto.randomUUID();

    if (existingSignup) {
      const { error: updateError } = await supabase
        .from("newsletter_signups")
        .update({
          status: "pending",
          confirm_token: confirmToken,
          topics,
          unsubscribe_token: unsubscribeToken,
          unsubscribed_at: null,
          updated_at: timestamp,
        })
        .eq("id", existingSignup.id);

      if (updateError) {
        return jsonResponse(500, {
          error: "Could not refresh signup.",
          details: updateError.message,
        });
      }
    } else {
      const { error: insertError } = await supabase.from("newsletter_signups").insert({
        email,
        status: "pending",
        confirm_token: confirmToken,
        topics,
        unsubscribe_token: unsubscribeToken,
        updated_at: timestamp,
      });

      if (insertError) {
        return jsonResponse(500, {
          error: "Could not create signup.",
          details: insertError.message,
        });
      }
    }

    const emailResult = await sendConfirmationEmail(email, confirmToken);

    if (!emailResult.ok) {
      return jsonResponse(emailResult.status, {
        error: "Confirmation email failed.",
        details: emailResult.error,
      });
    }

    return jsonResponse(200, {
      ok: true,
      status: "pending_confirmation" satisfies SignupStatus,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "Unhandled signup error.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});