function parseArgs(argv) {
  const options = {
    raw: false,
    outFile: process.env.X_OUTPUT_FILE?.trim() || '',
    minWords: Number(process.env.X_MIN_WORDS?.trim() || '0'),
    inputFile: '',
    listFile: '',
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

    if (arg === '--min-words') {
      const next = argv[index + 1]?.trim();
      const parsed = Number(next);
      if (!next || !Number.isInteger(parsed) || parsed < 0) {
        throw new Error('--min-words requires a non-negative integer.');
      }
      options.minWords = parsed;
      index += 1;
      continue;
    }

    if (arg === '--input') {
      const next = argv[index + 1]?.trim();
      if (!next) {
        throw new Error('--input requires a file path.');
      }
      options.inputFile = next;
      index += 1;
      continue;
    }

    if (arg === '--list') {
      const next = argv[index + 1]?.trim();
      if (!next) {
        throw new Error('--list requires a file path.');
      }
      options.listFile = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log([
    'Usage: npm run x:apify-dataset -- [--raw] [--out path] [--min-words 500] [--input path] [--list path]',
    '',
    'Environment variables:',
    '  APIFY_X_DATASET_URL   Required unless --input is provided. Full Apify dataset items endpoint, including token if needed.',
    '  X_OUTPUT_FILE         Optional. Save the raw Apify dataset response to a file.',
    '  X_MIN_WORDS           Optional. Filter printed rows to this minimum word count.',
    '',
    'Arguments:',
    '  --input path         Optional. Read a saved local JSON file instead of fetching APIFY_X_DATASET_URL.',
    '  --list path          Optional. Save a markdown shortlist with dated entries.',
  ].join('\n'));
}

function getDatasetUrl() {
  const url = process.env.APIFY_X_DATASET_URL?.trim();
  if (!url) {
    throw new Error('Missing APIFY_X_DATASET_URL. Put the Apify dataset items endpoint in .env and rerun.');
  }

  return url;
}

function getText(item) {
  const candidates = [
    item?.noteTweet?.text,
    item?.note_tweet?.text,
    item?.text,
    item?.fullText,
    item?.article?.previewText,
  ].filter((value) => typeof value === 'string' && value.length > 0);

  if (candidates.length === 0) {
    return '';
  }

  return candidates.sort((left, right) => right.length - left.length)[0];
}

function getUrl(item) {
  return item?.twitterUrl ?? item?.url ?? item?.tweetUrl ?? (item?.id ? `https://x.com/i/web/status/${item.id}` : '');
}

function getQuotedArticleUrl(item) {
  const candidates = [
    ...(item?.quote?.entities?.urls ?? []),
    ...(item?.entities?.urls ?? []),
  ];

  const match = candidates.find((entry) => {
    const expandedUrl = entry?.expanded_url ?? '';
    return typeof expandedUrl === 'string' && expandedUrl.includes('/article/');
  });

  return match?.expanded_url ?? '';
}

function getWordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

function getTimestamp() {
  return new Date().toISOString();
}

function getPreview(text, limit = 280) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
}

function escapeMarkdown(text) {
  return text.replace(/\|/g, '\\|');
}

async function writeOutputFile(outFile, responseBody) {
  if (!outFile) return;

  const { mkdir, writeFile } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(responseBody, null, 2));
}

async function loadBody(options) {
  if (options.inputFile) {
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(options.inputFile, 'utf8');
    return JSON.parse(raw);
  }

  const response = await fetch(getDatasetUrl(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Apify dataset request failed: ${response.status} ${response.statusText}`);
    console.error(body);
    process.exit(1);
  }

  return response.json();
}

async function writeListFile(listFile, rows, meta) {
  if (!listFile) return;

  const { mkdir, writeFile } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  await mkdir(dirname(listFile), { recursive: true });

  const lines = [
    '# X Pull List',
    '',
    `- generatedAt: ${meta.generatedAt}`,
    `- source: ${meta.sourceLabel}`,
    `- totalRows: ${meta.totalRows}`,
    `- filteredRows: ${rows.length}`,
    `- minWords: ${meta.minWords}`,
    '',
  ];

  for (const row of rows) {
    lines.push(`## ${row.createdAt || 'unknown date'} | ${row.wordCount} words`);
    lines.push('');
    lines.push('- reviewed: ');
    lines.push(`- url: ${row.url}`);
    if (row.quotedArticleUrl) {
      lines.push(`- quotedArticleUrl: ${row.quotedArticleUrl}`);
    }
    lines.push(`- likes: ${row.likeCount}`);
    lines.push(`- replies: ${row.replyCount}`);
    lines.push(`- reposts: ${row.retweetCount}`);
    lines.push(`- quotes: ${row.quoteCount}`);
    lines.push('- fullText: |-');
    for (const line of row.text.split('\n')) {
      lines.push(`  ${escapeMarkdown(line)}`);
    }
    lines.push('');
  }

  await writeFile(listFile, lines.join('\n'));
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

const options = parseArgs(process.argv.slice(2));
const body = await loadBody(options);
await writeOutputFile(options.outFile, body);

if (options.raw) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const rows = body
  .map((item) => {
    const text = getText(item);
    return {
      createdAt: item?.createdAt ?? item?.created_at ?? '',
      wordCount: getWordCount(text),
      charCount: text.length,
      likeCount: item?.likeCount ?? item?.likes ?? 0,
      replyCount: item?.replyCount ?? item?.replies ?? 0,
      retweetCount: item?.retweetCount ?? item?.retweets ?? 0,
      quoteCount: item?.quoteCount ?? item?.quotes ?? 0,
      url: getUrl(item),
      quotedArticleUrl: getQuotedArticleUrl(item),
      text,
    };
  })
  .filter((item) => item.wordCount >= options.minWords)
  .sort((left, right) => right.wordCount - left.wordCount);

await writeListFile(options.listFile, rows, {
  generatedAt: getTimestamp(),
  sourceLabel: options.inputFile || 'APIFY_X_DATASET_URL',
  totalRows: body.length,
  minWords: options.minWords,
});

console.log(`Returned ${body.length} dataset rows.`);
console.log(`Filtered rows >= ${options.minWords} words: ${rows.length}`);
if (options.outFile) {
  console.log(`Raw response saved to ${options.outFile}`);
}
if (options.listFile) {
  console.log(`List saved to ${options.listFile}`);
}

for (const row of rows) {
  console.log('');
  console.log(`${row.createdAt || 'unknown date'} | ${row.wordCount} words | ${row.charCount} chars`);
  console.log(row.url);
  console.log(`likes=${row.likeCount} replies=${row.replyCount} reposts=${row.retweetCount} quotes=${row.quoteCount}`);
  console.log(row.text);
}