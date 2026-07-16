/**
 * X Replies — Fetch replies to a tweet via X API v2.
 *
 * Requires X_BEARER_TOKEN (app-only Bearer token).
 *
 * The X API v2 search endpoint can find tweets in a conversation by
 * filtering on conversation_id. This returns recent replies so you
 * can review them and reply via the --reply-to flag in x-post.mjs.
 *
 * Usage:
 *   $env:X_BEARER_TOKEN='...'
 *
 *   # Get replies to a tweet:
 *   node scripts/x-replies.mjs 2077859250143990188
 *
 *   # From URL:
 *   node scripts/x-replies.mjs https://x.com/user/status/2077859250143990188
 *
 *   # Limit results (default: 25, max: 100):
 *   node scripts/x-replies.mjs 2077859250143990188 --max 50
 */

const BEARER = process.env.X_BEARER_TOKEN;

if (!BEARER) {
  console.error("Missing X_BEARER_TOKEN env var.");
  process.exit(1);
}

function extractId(input) {
  const match = input.match(/status\/(\d+)/);
  return match ? match[1] : input.replace(/[^\d]/g, "");
}

const args = process.argv.slice(2).filter(Boolean);
let tweetId = "";
let maxResults = 25;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--max" || args[i] === "-n") {
    maxResults = Math.min(100, Math.max(1, parseInt(args[++i], 10) || 25));
  } else if (!tweetId) {
    tweetId = extractId(args[i]);
  }
}

if (!tweetId) {
  console.error("Usage: node scripts/x-replies.mjs <tweet-id-or-url> [--max 50]");
  process.exit(1);
}

const url = new URL("https://api.x.com/2/tweets/search/recent");
url.searchParams.set("query", `conversation_id:${tweetId}`);
url.searchParams.set("max_results", maxResults.toString());
url.searchParams.set("tweet.fields", "author_id,created_at,in_reply_to_user_id,referenced_tweets");
url.searchParams.set("expansions", "author_id,referenced_tweets.id");
url.searchParams.set("user.fields", "username,name");

try {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${BEARER}` },
  });

  if (!response.ok) {
    console.error(`HTTP ${response.status}: ${await response.text()}`);
    process.exit(1);
  }

  const { data, meta, includes } = await response.json();

  if (!data || data.length === 0) {
    console.log(`No replies found for tweet ${tweetId}.`);
    process.exit(0);
  }

  const users = new Map();
  if (includes?.users) {
    for (const user of includes.users) {
      users.set(user.id, user);
    }
  }

  // Sort by creation time (oldest first is usually most readable)
  data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  Replies to https://x.com/i/status/${tweetId}`);
  console.log(`  Found: ${meta?.result_count ?? data.length} | Showing: ${data.length}`);
  console.log(`${"=".repeat(70)}`);

  for (const reply of data) {
    const user = users.get(reply.author_id);
    const replyTo = reply.referenced_tweets?.find((r) => r.type === "replied_to");
    const isDirectReply = replyTo?.id === tweetId;

    console.log(`\n  ${isDirectReply ? "├─▶" : "│  └─▶"} @${user?.username ?? "unknown"}`);
    console.log(`     ID:    ${reply.id}`);
    console.log(`     Time:  ${reply.created_at}`);
    console.log(`     Reply: ${reply.text.slice(0, 100)}${reply.text.length > 100 ? "..." : ""}`);
    console.log(`     Cmd:   npm run x:post -- --reply-to ${reply.id} "..."`);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  To reply to any of these:`);
  console.log(`  npm run x:post -- --reply-to <id> "Your response"`);
  console.log(`${"=".repeat(70)}\n`);
} catch (err) {
  console.error("Error fetching replies:", err.message);
  process.exit(1);
}
