import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";
import { reconcileListmonkSubscriber } from "../_shared/listmonk.ts";

function redirectTo(path: string) {
  return Response.redirect(path, 303);
}

const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://feedfree.tech";

function redirectToStatus(status: "confirmed" | "invalid" | "error") {
  return redirectTo(`${publicSiteUrl}/subscribed?status=${status}`);
}

Deno.serve(async (request) => {
  if (request.method !== "GET") {
    return redirectToStatus("invalid");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return redirectToStatus("error");
  }

  const token = new URL(request.url).searchParams.get("token")?.trim();

  if (!token) {
    return redirectToStatus("invalid");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: signup, error: lookupError } = await supabase
    .from("newsletter_signups")
    .select("id, email, status, topics, source, unsubscribe_token")
    .eq("confirm_token", token)
    .maybeSingle();

  if (lookupError) {
    return redirectToStatus("error");
  }

  if (!signup || signup.status !== "pending") {
    return redirectToStatus("invalid");
  }

  const timestamp = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("newsletter_signups")
    .update({
      status: "confirmed",
      confirmed_at: timestamp,
      updated_at: timestamp,
      confirm_token: null,
    })
    .eq("id", signup.id)
    .eq("status", "pending");

  if (updateError) {
    return redirectToStatus("error");
  }

  const syncResult = await reconcileListmonkSubscriber({
    email: signup.email,
    topics: signup.topics ?? [],
    source: signup.source,
    unsubscribeToken: signup.unsubscribe_token ?? null,
    subscribed: true,
  });
  if (!syncResult.ok) {
    console.error("Listmonk sync failed after confirmation", syncResult.reason);
  }

  return redirectToStatus("confirmed");
});