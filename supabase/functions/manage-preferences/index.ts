import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedTopics = new Set([
  "ai-engineering",
  "open-source-intrigues",
  "crypto-investing",
  "security",
  "compliance",
  "early-founder-bootstrapping",
  "lead-generation",
  "seo",
  "cold-outreach-marketing",
  "social-media-marketing",
]);

type ManagePreferencesPayload = {
  action?: "load" | "save" | "unsubscribe";
  token?: string;
  topics?: string[];
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
        .filter((topic) => topic.length > 0 && allowedTopics.has(topic))
    )
  );
}

Deno.serve(async (request) => {
  try {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
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

    let payload: ManagePreferencesPayload;

    try {
      payload = await request.json();
    } catch {
      return jsonResponse(400, {
        error: "Invalid JSON body.",
      });
    }

    const action = payload.action;
    const token = payload.token?.trim();

    if (!token) {
      return jsonResponse(400, {
        error: "Token is required.",
      });
    }

    if (action !== "load" && action !== "save" && action !== "unsubscribe") {
      return jsonResponse(400, {
        error: "Invalid action.",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: signup, error: lookupError } = await supabase
      .from("newsletter_signups")
      .select("id, email, status, topics")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (lookupError) {
      return jsonResponse(500, {
        error: "Could not load preferences.",
        details: lookupError.message,
      });
    }

    if (!signup) {
      return jsonResponse(404, {
        error: "Invalid token.",
      });
    }

    if (action === "load") {
      return jsonResponse(200, {
        ok: true,
        email: signup.email,
        status: signup.status,
        topics: signup.topics ?? [],
      });
    }

    const timestamp = new Date().toISOString();

    if (action === "unsubscribe") {
      const { error: updateError } = await supabase
        .from("newsletter_signups")
        .update({
          status: "unsubscribed",
          unsubscribed_at: timestamp,
          updated_at: timestamp,
        })
        .eq("id", signup.id);

      if (updateError) {
        return jsonResponse(500, {
          error: "Could not unsubscribe.",
          details: updateError.message,
        });
      }

      return jsonResponse(200, {
        ok: true,
        status: "unsubscribed",
      });
    }

    const topics = normalizeTopics(payload.topics);

    const { error: updateError } = await supabase
      .from("newsletter_signups")
      .update({
        topics,
        status: topics.length > 0 ? "confirmed" : "unsubscribed",
        unsubscribed_at: topics.length > 0 ? null : timestamp,
        updated_at: timestamp,
      })
      .eq("id", signup.id);

    if (updateError) {
      return jsonResponse(500, {
        error: "Could not save preferences.",
        details: updateError.message,
      });
    }

    return jsonResponse(200, {
      ok: true,
      status: topics.length > 0 ? "confirmed" : "unsubscribed",
      topics,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "Unhandled preferences error.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});