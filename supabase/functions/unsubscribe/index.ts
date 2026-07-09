import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.3";

function redirectTo(path: string) {
  return Response.redirect(path, 303);
}

function textResponse(status: number, body: string) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://feedfree.tech";

function redirectToStatus(status: "unsubscribed" | "invalid" | "error") {
  return redirectTo(`${publicSiteUrl}/subscribed?status=${status}`);
}

Deno.serve(async (request) => {
  const isPost = request.method === "POST";
  const isGet = request.method === "GET";

  if (!isGet && !isPost) {
    return isPost
      ? textResponse(405, "Method not allowed")
      : redirectToStatus("invalid");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return isPost ? textResponse(500, "Configuration error") : redirectToStatus("error");
  }

  const token = new URL(request.url).searchParams.get("token")?.trim();

  if (!token) {
    return isPost ? textResponse(400, "Missing token") : redirectToStatus("invalid");
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
    return isPost ? textResponse(500, "Lookup error") : redirectToStatus("error");
  }

  if (!signup || signup.status === "unsubscribed") {
    return isPost ? textResponse(404, "Invalid token") : redirectToStatus("invalid");
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
    return isPost ? textResponse(500, "Update error") : redirectToStatus("error");
  }

  return isPost ? textResponse(200, "Unsubscribed") : redirectToStatus("unsubscribed");
});