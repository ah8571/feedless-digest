/**
 * X Post — Post a tweet via X API v2 using OAuth 1.0a User Context.
 *
 * Requires all 4 OAuth 1.0a credentials from the X Developer dashboard
 * (Keys & Tokens → OAuth 1.0a section). The Bearer Token (app-only auth)
 * cannot be used for posting — this is a separate auth flow.
 *
 * Env vars:
 *   X_CONSUMER_KEY        — API Key from the app dashboard
 *   X_CONSUMER_KEY_SECRET — API Key Secret
 *   X_ACCESS_TOKEN        — Access Token (generated with Read & Write)
 *   X_ACCESS_TOKEN_SECRET — Access Token Secret
 *   X_CONSUMER_KEY / consumer_key fallbacks also accepted
 *
 * Usage:
 *   $env:X_CONSUMER_KEY='...'; $env:X_CONSUMER_KEY_SECRET='...'
 *   $env:X_ACCESS_TOKEN='...'; $env:X_ACCESS_TOKEN_SECRET='...'
 *
 *   # Post text directly:
 *   npm run x:post -- "Hello world"
 *
 *   # Post from stdin:
 *   echo "Hello from stdin" | npm run x:post
 *
 *   # Post from a file:
 *   npm run x:post -- --file path/to/post.txt
 *
 *   # Dry-run (print what would be posted without sending):
 *   npm run x:post -- --dry-run "testing"
 */

import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const POST_URL = 'https://api.x.com/2/tweets';

function getEnv(name, ...fallbacks) {
  for (const key of [name, ...fallbacks]) {
    const val = process.env[key]?.trim();
    if (val) return val;
  }
  return undefined;
}

function parseArgs(argv) {
  const options = { text: '', file: '', dryRun: false, textParts: [] };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--file') {
      options.file = argv[++i]?.trim() ?? '';
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else {
      options.textParts.push(arg);
    }
  }

  options.text = options.textParts.join(' ').trim();
  return options;
}

function oauthHeader(method, url, consumerKey, consumerSecret, accessToken, accessTokenSecret) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
        Math.floor(Math.random() * 62)
      ]
    ).join(''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  // Build the parameter string (percent-encode keys & values, sort lexicographically)
  const encodedParams = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  // Signature base string
  const signatureBase = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(encodedParams)].join('&');

  // Signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;

  const signature = createHmac('sha1', signingKey).update(signatureBase).digest('base64');

  oauthParams.oauth_signature = signature;

  // Build Authorization header
  const headerValue =
    'OAuth ' +
    Object.entries(oauthParams)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(', ');

  return headerValue;
}

async function postTweet(text) {
  const consumerKey = getEnv('X_CONSUMER_KEY', 'consumer_key');
  const consumerSecret = getEnv('X_CONSUMER_KEY_SECRET', 'consumer_key_secret');
  const accessToken = getEnv('X_ACCESS_TOKEN', 'access_token');
  const accessTokenSecret = getEnv('X_ACCESS_TOKEN_SECRET', 'access_token_secret');

  const missing = [];
  if (!consumerKey) missing.push('X_CONSUMER_KEY / consumer_key');
  if (!consumerSecret) missing.push('X_CONSUMER_KEY_SECRET / consumer_key_secret');
  if (!accessToken) missing.push('X_ACCESS_TOKEN / access_token');
  if (!accessTokenSecret) missing.push('X_ACCESS_TOKEN_SECRET / access_token_secret');
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }

  const authHeader = oauthHeader('POST', POST_URL, consumerKey, consumerSecret, accessToken, accessTokenSecret);

  const res = await fetch(POST_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const body = await res.json();

  if (!res.ok) {
    const err = new Error(`X API error ${res.status}: ${JSON.stringify(body, null, 2)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// ── Main ────────────────────────────────────────────────────────────────────

const opts = parseArgs(process.argv.slice(2));

let text = opts.text;

if (opts.file) {
  text = await readFile(opts.file, 'utf-8');
  text = text.trim();
}

// If no text from args or file, try stdin (piped input)
if (!text && !process.stdin.isTTY) {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  text = Buffer.concat(chunks).toString('utf-8').trim();
}

if (!text) {
  console.error('Usage: npm run x:post -- "Your tweet text"');
  console.error('       npm run x:post -- --file path/to/post.txt');
  console.error('       echo "text" | npm run x:post');
  console.error('       npm run x:post -- --dry-run "text"');
  process.exit(1);
}

if (text.length > 280) {
  // X API v2 supports longer tweets for some account types, but warn anyway
  console.warn(`⚠  Tweet is ${text.length} chars (limit: 280 for basic accounts).`);
}

if (opts.dryRun) {
  console.log('── Dry run — would post: ──');
  console.log(text);
  console.log('────────────────────────────');
  console.log(`Char count: ${text.length}`);
  process.exit(0);
}

try {
  const result = await postTweet(text);
  const tweetId = result?.data?.id;
  const tweetText = result?.data?.text;
  console.log(`✓ Posted: https://x.com/i/status/${tweetId}`);
  console.log(`  "${tweetText}"`);
} catch (err) {
  console.error(`✗ Failed: ${err.message}`);
  process.exit(1);
}
