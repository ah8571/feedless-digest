import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";
import { reconcileListmonkSubscriber } from "../_shared/listmonk.ts";

async function sha256(message: string) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getXAdsAccessToken() {
  // Try OAuth 1.0a Bearer token first (works for posting — may work for conversions).
  // Many X Ads API endpoints accept the same Bearer token used for reading/posting.
  const bearerToken = Deno.env.get("X_BEARER_TOKEN");
  if (bearerToken) {
    console.log("[x-conversion] Using X_BEARER_TOKEN for Ads API auth.");
    return bearerToken;
  }

  // Fallback: OAuth 2.0 client credentials flow.
  const clientId = Deno.env.get("X_ADS_CONSUMER_KEY") || Deno.env.get("X_OAUTH2_CLIENT_ID");
  const clientSecret = Deno.env.get("X_ADS_CONSUMER_SECRET") || Deno.env.get("X_OAUTH2_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.log("[x-conversion] X Ads auth SKIPPED — no OAuth 2.0 credentials or X_BEARER_TOKEN set.");
    return null;
  }

  try {
    const response = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        client_type: "confidential",
        scope: "ads:write",
      }).toString(),
    });

    if (!response.ok) {
      console.error("Failed to get X Ads access token", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token as string | null;
  } catch (error) {
    console.error("X Ads token exchange error", error);
    return null;
  }
}

async function sendXConversion(eventName: string, twclid?: string) {
  const pixelId = Deno.env.get("X_PIXEL_ID");

  if (!pixelId) {
    console.log("[x-conversion] SKIPPED — missing X_PIXEL_ID env var.");
    return;
  }

  console.log("[x-conversion] Starting — pixel_id:", pixelId, "event:", eventName, "has_twclid:", !!twclid, "twclid_preview:", twclid ? twclid.slice(0, 8) + "..." : "none");

  const accessToken = await getXAdsAccessToken();
  if (!accessToken) {
    console.log("[x-conversion] SKIPPED — could not obtain X Ads access token.");
    return;
  }

  console.log("[x-conversion] Access token obtained (length:", accessToken.length, ")");

  try {
    const conversion: Record<string, unknown> = {
      event_name: eventName,
      event_time: new Date().toISOString(),
    };

    // Include twclid for precise ad attribution when available.
    // No hashed email is sent — twclid alone is sufficient since X already
    // knows which user clicked the ad.
    if (twclid) conversion.conversion_id = twclid;

    const payload = {
      pixel_id: pixelId,
      conversions: [conversion],
    };

    console.log("[x-conversion] Sending to X Ads API — payload:", JSON.stringify(payload));

    const response = await fetch("https://ads-api.x.com/11/measurement/conversions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[x-conversion] FAILED — HTTP", response.status, "— body:", errorBody.slice(0, 500));
    } else {
      console.log("[x-conversion] SUCCESS — HTTP", response.status, "— conversion recorded for pixel", pixelId);
    }
  } catch (error) {
    console.error("[x-conversion] EXCEPTION —", error instanceof Error ? error.message : String(error));
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateSignupPayload = {
  email?: string;
  topics?: string[];
  click_source?: {
    twclid?: string;
    gclid?: string;
    fbclid?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
  };
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
        <div style="margin:0; padding:32px 20px; background-color:#ffffff; background-image:linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.06) 1px, transparent 1px); background-size:34px 34px; color:#111827; font-family:Arial, sans-serif;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e7e1d6; border-radius:24px; padding:36px 32px; box-shadow:0 18px 50px rgba(17, 24, 39, 0.08);">
            <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; color:#6b6254; margin-bottom:16px;">Feedfree Digest</div>
            <h1 style="font-size:28px; line-height:1.1; margin:0 0 18px; color:#111827; font-weight:700;">Confirm your signup</h1>
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

    // ── Diagnostic: log incoming payload (mask email for privacy) ──
    const maskedEmail = payload.email
      ? payload.email.slice(0, 3) + "***@" + payload.email.split("@")[1]
      : "missing";
    console.log("[signup] Incoming payload:", JSON.stringify({
      email: maskedEmail,
      topics: payload.topics,
      click_source: payload.click_source ?? null,
      has_twclid: !!payload.click_source?.twclid,
      has_gclid: !!payload.click_source?.gclid,
      has_fbclid: !!payload.click_source?.fbclid,
      utm_source: payload.click_source?.utm_source ?? "none",
      utm_medium: payload.click_source?.utm_medium ?? "none",
      utm_campaign: payload.click_source?.utm_campaign ?? "none",
      utm_term: payload.click_source?.utm_term ?? "none",
      utm_content: payload.click_source?.utm_content ?? "none",
      referrer: payload.click_source?.referrer ?? "none",
    }));

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
      .select("id, status, source, unsubscribe_token")
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

      const syncResult = await reconcileListmonkSubscriber({
        email,
        topics,
        source: existingSignup.source,
        unsubscribeToken: existingSignup.unsubscribe_token ?? null,
        subscribed: true,
      });
      if (!syncResult.ok) {
        console.error("Listmonk sync failed after confirmed signup update", syncResult.reason);
      }

      return jsonResponse(200, {
        ok: true,
        status: "confirmed_existing" satisfies SignupStatus,
        listmonk_synced: syncResult.ok && syncResult.synced,
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

    // ── Route conversion events only to the ad network that sent the visitor ──
    // UTM source + medium is the primary signal. We require BOTH:
    //   utm_source = "x" (or "twitter") — came from X
    //   utm_medium = "cpc" / "paid" / "ppc" / "paid_social" — it was a paid click
    // This prevents organic X traffic from being counted as ad conversions.
    const utmSource = (payload.click_source?.utm_source ?? "").toLowerCase();
    const utmMedium = (payload.click_source?.utm_medium ?? "").toLowerCase();
    const referrer = payload.click_source?.referrer ?? "";
    const twclid = payload.click_source?.twclid;

    const isXSource = utmSource === "x" || utmSource === "twitter";
    const isPaidMedium = ["cpc", "paid", "ppc", "paid_social"].includes(utmMedium);
    const referrerMatch = referrer.includes("x.com") || referrer.includes("t.co");

    // Require paid medium for UTM-based detection. Allow referrer fallback
    // only when no UTM params are present (organic sharing usually has none).
    const cameFromX =
      (isXSource && isPaidMedium) ||
      (!utmSource && !utmMedium && referrerMatch);

    console.log("[signup] Conversion routing decision:", JSON.stringify({
      utm_source: utmSource || "none",
      utm_medium: utmMedium || "none",
      is_x_source: isXSource,
      is_paid_medium: isPaidMedium,
      referrer: referrer || "none",
      referrer_match: referrerMatch,
      came_from_x: cameFromX,
      has_twclid: !!twclid,
      twclid_preview: twclid ? twclid.slice(0, 8) + "..." : "none",
      action: cameFromX
        ? (twclid ? "SEND_X_WITH_TWCLID" : "SEND_X_WITHOUT_TWCLID")
        : "SKIP",
    }));

    if (cameFromX) {
      sendXConversion("SignUp", twclid || undefined);
    } else {
      console.log("[signup] Conversion tracking SKIPPED — not from X (utm_source='" + (utmSource || "none") + "', referrer='" + (referrer || "none") + "')");
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