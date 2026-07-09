const DEFAULT_LOOKUP_FIELDS = ['created_at', 'text', 'author_id', 'public_metrics', 'article', 'entities'].join(',');

function parseArgs(argv) {
  const options = {
    inputs: [],
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

    options.inputs.push(arg);
  }

  return options;
}

function printHelp() {
  console.log([
    'Usage: npm run x:article-resolve -- <article-url-or-id> [more URLs or IDs]',
    '       npm run x:article-resolve -- --raw --out lists/x/distilled/article.json https://x.com/hanakoxbt/article/2065807526268920103',
    '',
    'Accepted inputs:',
    '  - x.com/{username}/article/{id}',
    '  - x.com/i/article/{id}',
    '  - bare numeric article/tweet id',
    '',
    'Environment variables:',
    '  X_BEARER_TOKEN   Required. Use the App-Only Authentication bearer token from the X app.',
    '  X_OUTPUT_FILE    Optional. Save the resolved JSON response to a file.',
    '',
    'Flags:',
    '  --raw            Print the raw JSON response instead of the formatted summary.',
    '  --out <path>     Save the JSON response to a file.',
  ].join('\n'));
}

function normalizeInput(input) {
  const value = input.trim();
  if (!value) {
    throw new Error('Article input cannot be empty.');
  }

  if (/^\d+$/.test(value)) {
    return { input: value, id: value, url: `https://x.com/i/article/${value}` };
  }

  let url;

  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`);
  } catch {
    throw new Error(`Unsupported article input: ${value}`);
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const articleIndex = pathParts.indexOf('article');
  const id = articleIndex >= 0 ? pathParts[articleIndex + 1] : '';

  if (!id || !/^\d+$/.test(id)) {
    throw new Error(`Could not extract article id from: ${value}`);
  }

  return {
    input: value,
    id,
    url: `https://x.com/${pathParts.join('/')}`,
  };
}

async function writeOutputFile(outFile, responseBody) {
  if (!outFile) return;

  await import('node:fs/promises').then(({ mkdir, writeFile }) =>
    mkdir(new URL('.', new URL(`file://${process.cwd().replace(/\\/g, '/')}/${outFile}`)), {
      recursive: true,
    }).then(() => writeFile(outFile, JSON.stringify(responseBody, null, 2))),
  );
}

async function fetchLookup(id, bearerToken) {
  const params = new URLSearchParams({
    'tweet.fields': DEFAULT_LOOKUP_FIELDS,
    expansions: 'author_id',
    'user.fields': 'username,name,verified,public_metrics',
  });
  const url = `https://api.x.com/2/tweets/${id}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API request failed for ${id}: ${response.status} ${response.statusText}\n${body}`);
  }

  return {
    requestUrl: url,
    body: await response.json(),
  };
}

function buildResolvedArticle(normalized, lookup) {
  const post = lookup.body?.data;
  if (!post) {
    throw new Error(`No post payload returned for ${normalized.input}`);
  }

  const author = (lookup.body?.includes?.users ?? []).find((user) => user.id === post.author_id) ?? null;
  const article = post.article ?? null;

  return {
    input: normalized.input,
    requested_url: normalized.url,
    request_url: lookup.requestUrl,
    id: post.id,
    created_at: post.created_at ?? null,
    text: post.text ?? '',
    entities: post.entities ?? null,
    author,
    public_metrics: post.public_metrics ?? null,
    article,
  };
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

if (!options.inputs.length) {
  printHelp();
  process.exit(1);
}

const normalizedInputs = options.inputs.map(normalizeInput);
const resolvedArticles = [];

try {
  for (const input of normalizedInputs) {
    const lookup = await fetchLookup(input.id, bearerToken);
    resolvedArticles.push(buildResolvedArticle(input, lookup));
  }
} catch (error) {
  console.error(String(error instanceof Error ? error.message : error));
  process.exit(1);
}

const responseBody = {
  count: resolvedArticles.length,
  resolved_at: new Date().toISOString(),
  articles: resolvedArticles,
};

await writeOutputFile(options.outFile, responseBody);

if (options.raw) {
  console.log(JSON.stringify(responseBody, null, 2));
  process.exit(0);
}

for (const article of resolvedArticles) {
  console.log(`Resolved ${article.id}`);
  console.log(`  Input: ${article.input}`);
  console.log(`  Author: ${article.author?.name ?? 'unknown'}${article.author?.username ? ` (@${article.author.username})` : ''}`);
  console.log(`  Title: ${article.article?.title ?? 'n/a'}`);
  console.log(`  Preview: ${article.article?.preview_text ? article.article.preview_text.slice(0, 160) : 'n/a'}`);
  console.log(`  Plain text length: ${article.article?.plain_text?.length ?? 0}`);
  console.log(`  Request URL: ${article.request_url}`);
}

if (options.outFile) {
  console.log(`Saved JSON to ${options.outFile}`);
}