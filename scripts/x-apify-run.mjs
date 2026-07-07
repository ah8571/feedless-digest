function parseArgs(argv) {
  const options = {
    outFile: process.env.X_OUTPUT_FILE?.trim() || '',
    raw: false,
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

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log([
    'Usage: npm run x:apify-run -- [--raw] [--out path]',
    '',
    'Environment variables:',
    '  APIFY_TOKEN        Required. Personal Apify API token used to launch the actor.',
    '  X_OUTPUT_FILE      Optional. Save returned dataset rows to a file.',
    '  APIFY_X_SEARCH_TERMS_JSON  Optional. JSON array of search terms.',
    '  APIFY_X_SEARCH_TERM        Optional. Single search term if JSON array is not provided.',
    '  APIFY_X_MAX_ITEMS          Optional. Defaults to 100.',
    '  APIFY_X_SORT               Optional. Defaults to Latest.',
    '  APIFY_X_TWEET_LANGUAGE     Optional. Defaults to en.',
    '  APIFY_X_MIN_FAVORITES      Optional. Defaults to 5.',
    '  APIFY_X_MIN_REPLIES        Optional. Defaults to 2.',
    '  APIFY_X_MIN_RETWEETS       Optional. Defaults to 0.',
    '  APIFY_X_START              Optional. Start date passed to actor input.',
    '  APIFY_X_END                Optional. End date passed to actor input.',
    '  APIFY_X_INCLUDE_SEARCH_TERMS Optional. Defaults to true.',
    '  APIFY_X_ONLY_QUOTE         Optional. true/false.',
    '',
    'This script runs the Apify actor directly and returns dataset items for the current benchmark query.',
  ].join('\n'));
}

function getOptionalInt(name, fallback) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
  return parsed;
}

function getOptionalBoolean(name, fallback) {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new Error(`${name} must be true or false.`);
}

function getSearchTerms() {
  const rawJson = process.env.APIFY_X_SEARCH_TERMS_JSON?.trim();
  if (rawJson) {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== 'string' || value.trim().length === 0)) {
      throw new Error('APIFY_X_SEARCH_TERMS_JSON must be a JSON array of non-empty strings.');
    }
    return parsed;
  }

  const single = process.env.APIFY_X_SEARCH_TERM?.trim();
  if (single) {
    return [single];
  }

  return ['("artificial intelligence" OR "AI agents" OR LLM OR inference) -filter:replies -filter:retweets'];
}

function buildInput() {
  const input = {
    searchTerms: getSearchTerms(),
    maxItems: getOptionalInt('APIFY_X_MAX_ITEMS', 100),
    sort: process.env.APIFY_X_SORT?.trim() || 'Latest',
    tweetLanguage: process.env.APIFY_X_TWEET_LANGUAGE?.trim() || 'en',
    minimumFavorites: getOptionalInt('APIFY_X_MIN_FAVORITES', 5),
    minimumReplies: getOptionalInt('APIFY_X_MIN_REPLIES', 2),
    minimumRetweets: getOptionalInt('APIFY_X_MIN_RETWEETS', 0),
    includeSearchTerms: getOptionalBoolean('APIFY_X_INCLUDE_SEARCH_TERMS', true),
    onlyQuote: getOptionalBoolean('APIFY_X_ONLY_QUOTE', false),
  };

  const start = process.env.APIFY_X_START?.trim();
  if (start) {
    input.start = start;
  }

  const end = process.env.APIFY_X_END?.trim();
  if (end) {
    input.end = end;
  }

  return input;
}

async function writeOutputFile(outFile, responseBody) {
  if (!outFile) return;

  const { mkdir, writeFile } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(responseBody, null, 2));
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

const options = parseArgs(process.argv.slice(2));
const token = process.env.APIFY_TOKEN?.trim();

if (!token) {
  console.error('Missing APIFY_TOKEN. Add your personal Apify API token to .env and rerun.');
  process.exit(1);
}

const input = buildInput();

const endpoint = `https://api.apify.com/v2/acts/apidojo~tweet-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(input),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Apify actor run failed: ${response.status} ${response.statusText}`);
  console.error(body);
  process.exit(1);
}

const items = await response.json();
await writeOutputFile(options.outFile, items);

if (options.raw) {
  console.log(JSON.stringify(items, null, 2));
  process.exit(0);
}

console.log(`Returned ${items.length} rows.`);
if (options.outFile) {
  console.log(`Raw response saved to ${options.outFile}`);
}

for (const item of items.slice(0, 5)) {
  console.log('');
  console.log(`${item.createdAt ?? 'unknown date'} | ${item.likeCount ?? 0} likes | ${item.replyCount ?? 0} replies`);
  console.log(item.twitterUrl ?? item.url ?? '');
  console.log(item.fullText ?? item.text ?? '');
}