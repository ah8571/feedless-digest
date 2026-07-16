/**
 * X Recent Search — Step 1 of the article discovery pipeline.
 *
 * Queries the X API v2 recent search endpoint for tweets matching a search query
 * within a time window. Saves the raw JSON response for downstream processing.
 *
 * Pipeline:
 *   1. x-recent-search.mjs       → raw search results (this script)
 *   2. x-consolidate-articles.mjs → isolate X Article cards, rank by likes, output JSON + MD
 *   3. Human review of the MD file → select articles for new editions
 *   4. Create edition files in lists/editions/ → send via listmonk
 *
 * === Two complementary search strategies ===
 *
 * Strategy A — Article-gated (formal X Articles, 1,000-10,000+ words):
 *   Query includes the "(article)" operator. No lang:en filter (articles
 *   are predominantly English anyway). Use recency since articles are sparse.
 *   Yields: article.plain_text via separate tweet lookup (x-article-resolve.mjs).
 *
 * Strategy B — No-gate long-form (note_tweet posts, 100-400 words):
 *   Query omits "(article)" but adds lang:en to filter noise. Use RELEVANCE
 *   sorting — it surfaces higher-liked content vs recency which returns
 *   chronological but often zero-engagement posts.
 *   Yields: note_tweet.text directly in search results.
 *
 *   Run with:
 *     $env:X_SORT_ORDER='relevancy'
 *     $env:X_OUTPUT_FILE='lists/x/<date>-<topic>-relevance-en-300.json'
 *     npm run x:recent-search
 *
 * Recommended: run BOTH strategies per topic — they find different content.
 *
 * Search queries are maintained in docs/api-research/x-query-workbench.md
 */
const DEFAULT_QUERY = '((Gemini OR GPT OR Sonnet OR Opus OR OpenAI OR Claude OR AI OR Cursor OR Codex OR Copilot OR vibe OR LLM OR openclaw OR hermes) (code OR agent OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price lang:en';
const DEFAULT_TWEET_FIELDS = ['created_at', 'text'].join(',');
const DEFAULT_ARTICLE_FIELDS = ['plain_text'].join(',');

function parseArgs(argv) {
  const options = {
    queryParts: [],
    raw: false,
    outFile: process.env.X_OUTPUT_FILE?.trim() || '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--raw') {
      options.raw = true;
      continue;
    }

    if (arg === '--out') {
      const next = argv[index + 1]?.trim();
      if (!next) {
        throw new Error('--out requires a file path.');
      }
      options.outFile = next;
      index += 1;
      continue;
    }

    options.queryParts.push(arg);
  }

  return options;
}

function printHelp() {
  console.log([
    'Usage: npm run x:recent-search -- [query]',
    '       npm run x:recent-search -- --raw --out docs/api-research/x-last-response.json [query]',
    '',
    'Environment variables:',
    '  X_BEARER_TOKEN   Required. Use the App-Only Authentication bearer token from the X app.',
    '  X_SEARCH_QUERY   Optional fallback query if no CLI query is provided.',
    '  X_TWEET_FIELDS   Optional. Defaults to created_at,text.',
    '  X_EXPANSIONS     Optional. Defaults to none.',
    '  X_USER_FIELDS    Optional. Defaults to none.',
    '  X_MAX_RESULTS    Optional. Defaults to 10. Supports 10-300 total results.',
    '  X_START_TIME     Optional. ISO 8601 UTC lower bound, e.g. 2026-07-06T00:00:00Z.',
    '  X_END_TIME       Optional. ISO 8601 UTC upper bound, e.g. 2026-07-07T00:00:00Z.',
    '  X_OUTPUT_FILE    Optional. Save the raw JSON response to a file.',
    '',
    'Flags:',
    '  --raw            Print the raw JSON response instead of the formatted summary.',
    '  --out <path>     Save the raw JSON response to a file.',
  ].join('\n'));
}

function getQuery(cliQueryParts) {
  const cliQuery = cliQueryParts.join(' ').trim();
  if (cliQuery) return cliQuery;

  const envQuery = process.env.X_SEARCH_QUERY?.trim();
  if (envQuery) return envQuery;

  return DEFAULT_QUERY;
}

function getMaxResults() {
  const raw = process.env.X_MAX_RESULTS?.trim();
  if (!raw) return '10';

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 10 || parsed > 300) {
    throw new Error('X_MAX_RESULTS must be an integer between 10 and 300.');
  }

  return parsed;
}

function getOptionalValue(name) {
  return process.env[name]?.trim() || '';
}

function getTweetFields() {
  return getOptionalValue('X_TWEET_FIELDS') || DEFAULT_TWEET_FIELDS;
}

function getOptionalDateTime(name) {
  const value = getOptionalValue(name);
  if (!value) return '';

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a valid ISO 8601 datetime.`);
  }

  return new Date(parsed).toISOString().replace('.000Z', 'Z');
}

function buildRequestParams(query, pageSize, nextToken = '') {
  const params = new URLSearchParams({
    query,
    'tweet.fields': getTweetFields(),
    max_results: String(pageSize),
    sort_order: getOptionalValue('X_SORT_ORDER') || 'recency',
  });

  const expansions = getOptionalValue('X_EXPANSIONS');
  const articleFields = getOptionalValue('X_ARTICLE_FIELDS') || DEFAULT_ARTICLE_FIELDS;
  if (articleFields) {
    params.set('article.fields', articleFields);
    // article.fields requires expansions=article to resolve
    const hasArticleExpansion = expansions && expansions.split(',').map(s => s.trim()).includes('article');
    if (!hasArticleExpansion) {
      params.set('expansions', expansions ? `${expansions},article` : 'article');
    } else {
      params.set('expansions', expansions);
    }
  } else if (expansions) {
    params.set('expansions', expansions);
  }

  const userFields = getOptionalValue('X_USER_FIELDS');
  if (userFields) {
    params.set('user.fields', userFields);
  }

  const startTime = getOptionalDateTime('X_START_TIME');
  if (startTime) {
    params.set('start_time', startTime);
  }

  const endTime = getOptionalDateTime('X_END_TIME');
  if (endTime) {
    params.set('end_time', endTime);
  }

  if (nextToken) {
    params.set('next_token', nextToken);
  }

  return params;
}

function buildAuthorMap(includes) {
  const users = includes?.users ?? [];
  return new Map(users.map((user) => [user.id, user]));
}

function getPostUrl(post) {
  if (!post?.id) return '';
  return `https://x.com/i/web/status/${post.id}`;
}

function getDisplayText(post) {
  return post?.note_tweet?.text ?? post?.text ?? '';
}

async function writeOutputFile(outFile, responseBody) {
  if (!outFile) return;

  await import('node:fs/promises').then(({ mkdir, writeFile }) =>
    mkdir(new URL('.', new URL(`file://${process.cwd().replace(/\\/g, '/')}/${outFile}`)), {
      recursive: true,
    }).then(() => writeFile(outFile, JSON.stringify(responseBody, null, 2))),
  );
}

function mergeIncludes(allIncludes) {
  const users = [];
  const seenUserIds = new Set();

  for (const includes of allIncludes) {
    for (const user of includes?.users ?? []) {
      if (!user?.id || seenUserIds.has(user.id)) continue;
      seenUserIds.add(user.id);
      users.push(user);
    }
  }

  return users.length ? { users } : undefined;
}

async function fetchPage(url, bearerToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  return response.json();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

const options = parseArgs(process.argv.slice(2));

const bearerToken = process.env.X_BEARER_TOKEN?.trim();

if (!bearerToken) {
  console.error('Missing X_BEARER_TOKEN. Generate the App-Only bearer token in the X developer console and export it before running this script.');
  process.exit(1);
}

const query = getQuery(options.queryParts);
const maxResults = getMaxResults();
const posts = [];
const includesList = [];
const pageMeta = [];
const requestUrls = [];

let nextToken = '';

try {
  while (posts.length < maxResults) {
    const remaining = maxResults - posts.length;
    const pageSize = Math.min(Math.max(remaining, 10), 100);
    const params = buildRequestParams(query, pageSize, nextToken);
    const url = `https://api.x.com/2/tweets/search/recent?${params.toString()}`;
    const body = await fetchPage(url, bearerToken);

    requestUrls.push(url);
    posts.push(...((body.data ?? []).slice(0, remaining)));
    includesList.push(body.includes);
    pageMeta.push(body.meta ?? {});

    nextToken = body.meta?.next_token ?? '';
    if (!nextToken || !(body.data?.length)) {
      break;
    }
  }
} catch (error) {
  console.error(String(error instanceof Error ? error.message : error));
  process.exit(1);
}

const body = {
  data: posts,
  includes: mergeIncludes(includesList),
  meta: {
    result_count: posts.length,
    pages_fetched: pageMeta.length,
    next_token: nextToken || undefined,
  },
  request_urls: requestUrls,
  page_meta: pageMeta,
};

await writeOutputFile(options.outFile, body);

if (options.raw) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const authorMap = buildAuthorMap(body.includes);
const returnedPosts = body.data ?? [];

console.log(`Returned ${returnedPosts.length} posts across ${pageMeta.length} page(s).`);
console.log(`Last request URL: ${requestUrls.at(-1) ?? 'n/a'}`);
if (options.outFile) {
  console.log(`Raw response saved to ${options.outFile}`);
}

for (const post of returnedPosts) {
  const author = authorMap.get(post.author_id);
  const username = author?.username ? `@${author.username}` : post.author_id ?? 'unknown';
  console.log('');
  console.log(`${username} | ${post.created_at ?? 'unknown date'}`);
  console.log(getPostUrl(post));
  console.log(getDisplayText(post));
  if (post.public_metrics) {
    console.log(
      `likes=${post.public_metrics.like_count ?? 0} reposts=${post.public_metrics.retweet_count ?? 0} replies=${post.public_metrics.reply_count ?? 0} quotes=${post.public_metrics.quote_count ?? 0}`,
    );
  }
}