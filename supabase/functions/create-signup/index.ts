import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";
import { reconcileListmonkSubscriber } from "../_shared/listmonk.ts";

async function sha256(message: string) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── OAuth 1.0a (HMAC-SHA1) signing for X Ads API ─────────────────────────

async function hmacSha1(key: Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

function base64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function oauthHeader(
  method: string, url: string,
  consumerKey: string, consumerSecret: string,
  accessToken: string, accessTokenSecret: string,
): Promise<string> {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const encodedParams = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const signatureBase = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(encodedParams)].join("&");
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const sigBuffer = await hmacSha1(new TextEncoder().encode(signingKey), signatureBase);
  oauthParams.oauth_signature = base64Encode(sigBuffer);

  const headerValue = "OAuth " +
    Object.entries(oauthParams)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ");

  return headerValue;
}

// ── X Ads Conversion API ──────────────────────────────────────────────────

async function sendXConversion(eventName: string, twclid?: string) {
  const pixelId = Deno.env.get("X_PIXEL_ID") ?? "rdp4k";
  const eventId = Deno.env.get("X_EVENT_ID") ?? "tw-rdp4k-rdp4x";

  if (!pixelId || !eventId) {
    console.log("[x-conversion] SKIPPED — missing X_PIXEL_ID or X_EVENT_ID.");
    return;
  }

  // OAuth 1.0a credentials (same as x-post.mjs)
  const consumerKey = Deno.env.get("X_CONSUMER_KEY") ?? Deno.env.get("consumer_key");
  const consumerSecret = Deno.env.get("X_CONSUMER_KEY_SECRET") ?? Deno.env.get("consumer_key_secret");
  const accessToken = Deno.env.get("X_ACCESS_TOKEN") ?? Deno.env.get("access_token");
  const accessTokenSecret = Deno.env.get("X_ACCESS_TOKEN_SECRET") ?? Deno.env.get("access_token_secret");

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    console.log("[x-conversion] SKIPPED — missing OAuth 1.0a credentials.");
    return;
  }

  console.log("[x-conversion] Starting — pixel:", pixelId, "event:", eventId, "name:", eventName, "twclid:", twclid?.slice(0, 8) + "..." ?? "none");

  try {
    const conversion: Record<string, unknown> = {
      event_id: eventId,
      conversion_time: new Date().toISOString(),
    };

    if (twclid) {
      conversion.identifiers = [{ twclid }];
      conversion.conversion_id = twclid.slice(0, 36); // dedup key
    }

    const payload = { conversions: [conversion] };
    const url = `https://ads-api.x.com/12/measurement/conversions/${pixelId}`;

    console.log("[x-conversion] Sending — payload:", JSON.stringify(payload));

    const authHeader = await oauthHeader(
      "POST", url,
      consumerKey, consumerSecret, accessToken, accessTokenSecret,
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("[x-conversion] FAILED — HTTP", response.status, "— body:", responseText.slice(0, 500));
    } else {
      console.log("[x-conversion] SUCCESS — HTTP", response.status, "—", responseText.slice(0, 200));
    }
  } catch (error) {
    console.error("[x-conversion] EXCEPTION —", error instanceof Error ? error.message : String(error));
  }
}

// ── Deprecated: old OAuth 2.0 token function (no longer used) ─────────────
// sendXConversion now uses OAuth 1.0a directly, matching the X Ads API docs.

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