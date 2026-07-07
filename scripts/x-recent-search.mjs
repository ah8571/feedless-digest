const DEFAULT_QUERY = '(AI OR "artificial intelligence" OR LLM OR agent OR agents) -is:retweet -is:reply lang:en';
const DEFAULT_TWEET_FIELDS = ['created_at', 'text'].join(',');

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
    '  X_MAX_RESULTS    Optional. Defaults to 10.',
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
  if (!Number.isInteger(parsed) || parsed < 10 || parsed > 100) {
    throw new Error('X_MAX_RESULTS must be an integer between 10 and 100.');
  }

  return String(parsed);
}

function getOptionalValue(name) {
  return process.env[name]?.trim() || '';
}

function getTweetFields() {
  return getOptionalValue('X_TWEET_FIELDS') || DEFAULT_TWEET_FIELDS;
}

function buildRequestParams(query) {
  const params = new URLSearchParams({
    query,
    'tweet.fields': getTweetFields(),
    max_results: getMaxResults(),
  });

  const expansions = getOptionalValue('X_EXPANSIONS');
  if (expansions) {
    params.set('expansions', expansions);
  }

  const userFields = getOptionalValue('X_USER_FIELDS');
  if (userFields) {
    params.set('user.fields', userFields);
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

const params = buildRequestParams(getQuery(options.queryParts));

const url = `https://api.x.com/2/tweets/search/recent?${params.toString()}`;

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${bearerToken}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(`X API request failed: ${response.status} ${response.statusText}`);
  console.error(body);
  process.exit(1);
}

const body = await response.json();
await writeOutputFile(options.outFile, body);

if (options.raw) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const authorMap = buildAuthorMap(body.includes);
const posts = body.data ?? [];

console.log(`Returned ${posts.length} posts.`);
console.log(`Request URL: ${url}`);
if (options.outFile) {
  console.log(`Raw response saved to ${options.outFile}`);
}

for (const post of posts) {
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