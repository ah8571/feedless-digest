import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";

function redirectTo(path: string) {
  return Response.redirect(path, 303);
}

const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://feedfree.tech";

function redirectToStatus(status: "unsubscribed" | "invalid" | "error") {
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
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (lookupError) {
    return redirectToStatus("error");
  }

  if (!signup || signup.status === "unsubscribed") {
    return redirectToStatus("invalid");
  }

  const timestamp = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("newsletter_signups")
    .update({
      status: "unsubscribed",
      unsubscribed_at: timestamp,
      updated_at: timestamp,
    })
    .eq("id", signup.id)
    .neq("status", "unsubscribed");

  if (updateError) {
    return redirectToStatus("error");
  }

  return redirectToStatus("unsubscribed");
});