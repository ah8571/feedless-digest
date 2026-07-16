/**
 * X Article Consolidation — Step 2 of the article discovery pipeline.
 *
 * Reads raw search JSON files from x-recent-search.mjs, refetches tweets with
 * richer fields (author, public_metrics, entities), isolates tweets that link to
 * X Article cards, ranks them by like count per category, and outputs:
 *   - A JSON file with full article objects for programmatic use
 *   - A Markdown file grouped by newsletter topic for human review
 *
 * Categories are inferred from input filenames (ai-engineering, social-media-marketing, seo).
 *
 * Pipeline:
 *   1. x-recent-search.mjs       → raw search results
 *   2. x-consolidate-articles.mjs → isolate X Article cards, rank by likes (this script)
 *   3. Human review of the MD file → select articles for new editions
 *   4. Create edition files in lists/editions/ → send via listmonk
 *
 * === Review MD format (newsletter-ready) ===
 *
 * Each article entry in the review markdown uses this convention:
 *
 *   ## N. Article Title
 *
 *   - **Author:** [@handle](https://x.com/handle)  |  **Date:** Jul 14, 2026
 *   - **Likes:** N  |  **Bookmarks:** N  |  **Retweets:** N  |  **Impressions:** N
 *   - **Link:** https://x.com/handle/status/tweetID
 *
 *   [full plain_text body]
 *
 * Key formatting rules:
 *   - Link uses author handle, NOT the x.com/i/article/ID format (that 404s in newsletters).
 *   - Date is human-readable "Mon DD, YYYY" not ISO 8601.
 *   - Author handle is clickable for attribution and engagement tracking.
 *   - Metrics on one line for quick scanning before reading the body.
 *
 * Usage:
 *   $env:X_BEARER_TOKEN = '...'
 *   node scripts/x-consolidate-articles.mjs \
 *     --out-json lists/x/<date>-article-candidates.json \
 *     --out-md lists/x/<date>-article-candidates.md \
 *     lists/x/<date>-<topic1>-yesterday-300.json \
 *     lists/x/<date>-<topic2>-yesterday-300.json
 */
import { readFile, writeFile } from 'node:fs/promises';

function parseArgs(argv) {
  const options = {
    outJson: 'lists/x/2026-07-11-article-candidates.json',
    outMd: 'lists/x/2026-07-11-article-candidates.md',
    files: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--out-json') {
      const next = argv[index + 1]?.trim();
      if (!next) throw new Error('--out-json requires a file path.');
      options.outJson = next;
      index += 1;
      continue;
    }

    if (arg === '--out-md') {
      const next = argv[index + 1]?.trim();
      if (!next) throw new Error('--out-md requires a file path.');
      options.outMd = next;
      index += 1;
      continue;
    }

    options.files.push(arg);
  }

  return options;
}

function getCategoryConfig(filePath) {
  if (filePath.includes('ai-engineering')) {
    return {
      key: 'ai-engineering',
      label: 'AI Engineering',
    };
  }

  if (filePath.includes('social-media-marketing')) {
    return {
      key: 'social-media-marketing',
      label: 'Social Media Marketing',
    };
  }

  if (filePath.includes('seo')) {
    return {
      key: 'seo',
      label: 'SEO',
    };
  }

  throw new Error(`Unable to infer category from ${filePath}`);
}

function getBearerToken() {
  const token = process.env.X_BEARER_TOKEN?.trim();
  if (!token) {
    throw new Error('Missing X_BEARER_TOKEN. Load .env before running this script.');
  }
  return token;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function getBaseRequestParams(sourceBody) {
  const requestUrl = sourceBody.request_urls?.[0];
  if (!requestUrl) {
    throw new Error('Source file is missing request_urls[0].');
  }

  const url = new URL(requestUrl);
  const query = url.searchParams.get('query');
  const startTime = url.searchParams.get('start_time') || '';
  const endTime = url.searchParams.get('end_time') || '';

  if (!query) {
    throw new Error('Source request URL is missing query.');
  }

  return {
    query,
    startTime,
    endTime,
  };
}

function buildRequestUrl(query, startTime, endTime, maxResults, nextToken = '') {
  const params = new URLSearchParams({
    query,
    'tweet.fields': 'created_at,text,author_id,entities,public_metrics',
    expansions: 'author_id',
    'user.fields': 'name,username',
    max_results: String(maxResults),
  });

  if (startTime) {
    params.set('start_time', startTime);
  }

  if (endTime) {
    params.set('end_time', endTime);
  }

  if (nextToken) {
    params.set('next_token', nextToken);
  }

  return `https://api.x.com/2/tweets/search/recent?${params.toString()}`;
}

async function fetchJson(url, bearerToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API request failed for ${url}\n${response.status} ${response.statusText}\n${body}`);
  }

  return response.json();
}

async function refetchSource(sourcePath, bearerToken) {
  const sourceBody = await readJson(sourcePath);
  const { query, startTime, endTime } = getBaseRequestParams(sourceBody);
  const targetCount = Number(sourceBody.meta?.result_count ?? 0) || 300;
  const posts = [];
  const users = new Map();
  const pageUrls = [];
  let nextToken = '';

  while (posts.length < targetCount) {
    const remaining = targetCount - posts.length;
    const pageSize = Math.min(Math.max(remaining, 10), 100);
    const requestUrl = buildRequestUrl(query, startTime, endTime, pageSize, nextToken);
    const body = await fetchJson(requestUrl, bearerToken);

    pageUrls.push(requestUrl);

    for (const user of body.includes?.users ?? []) {
      if (user?.id) {
        users.set(user.id, user);
      }
    }

    const pagePosts = (body.data ?? []).slice(0, remaining);
    posts.push(...pagePosts);

    nextToken = body.meta?.next_token ?? '';
    if (!nextToken || pagePosts.length === 0) {
      break;
    }
  }

  return {
    sourcePath,
    query,
    startTime,
    endTime,
    posts,
    users,
    pageUrls,
  };
}

function getExpandedUrl(post) {
  const firstEntityUrl = post.entities?.urls?.find((entry) => entry.expanded_url)?.expanded_url;
  if (firstEntityUrl) {
    return firstEntityUrl;
  }

  const textUrlMatch = post.text?.match(/https:\/\/t\.co\/\w+/);
  return textUrlMatch?.[0] ?? '';
}

function getPostUrl(id) {
  return `https://x.com/i/web/status/${id}`;
}

function getArticleUrl(postId, username) {
  // Use the status URL — this is the canonical X URL that renders the article inline.
  // The article entity URL (i/article/ID) uses a different ID and redirects unreliably on mobile.
  return username ? `https://x.com/${username}/status/${postId}` : `https://x.com/i/web/status/${postId}`;
}

function toArticleRecord(category, post, users, sourceInfo) {
  const author = users.get(post.author_id);
  const likeCount = Number(post.public_metrics?.like_count ?? 0);

  return {
    object_id: `${category.key}:${post.id}`,
    category: category.key,
    category_label: category.label,
    tweet_id: post.id,
    post_url: getPostUrl(post.id),
    article_url: getArticleUrl(post.id, author?.username),
    article_title: post.article?.title ?? '',
    created_at: post.created_at,
    like_count: likeCount,
    retweet_count: Number(post.public_metrics?.retweet_count ?? 0),
    reply_count: Number(post.public_metrics?.reply_count ?? 0),
    quote_count: Number(post.public_metrics?.quote_count ?? 0),
    author: {
      id: post.author_id ?? '',
      name: author?.name ?? '',
      username: author?.username ?? '',
    },
    text: post.text ?? '',
    source: {
      source_file: sourceInfo.sourcePath,
      query: sourceInfo.query,
      start_time: sourceInfo.startTime,
      end_time: sourceInfo.endTime,
    },
  };
}

function sortByLikeCount(items) {
  return [...items].sort((left, right) => {
    if (right.like_count !== left.like_count) {
      return right.like_count - left.like_count;
    }

    return right.created_at.localeCompare(left.created_at);
  });
}

function buildMarkdown(groups) {
  const lines = [
    '# Article Candidate Links',
    '',
    'Each entry includes the same `object_id` used in the consolidated JSON so you can map review decisions back later.',
    '',
  ];

  for (const group of groups) {
    lines.push(`## ${group.label}`);
    lines.push('');

    for (const item of group.items) {
      const title = item.article_title || item.article_url || item.post_url;
      const url = item.article_url || item.post_url;
      const authorHandle = item.author.username ? `@${item.author.username}` : 'unknown';
      lines.push(`${item.rank_by_like_count}. [${title}](${url})`);
      lines.push(`   - object_id: ${item.object_id}`);
      lines.push(`   - likes: ${item.like_count}`);
      lines.push(`   - author: ${authorHandle}`);
      lines.push(`   - source tweet: ${item.post_url}`);
    }

    lines.push('');
  }

  return `${lines.join('\n').trim()}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.files.length === 0) {
    throw new Error('Provide at least one source JSON file.');
  }

  const bearerToken = getBearerToken();
  const categoryBuckets = new Map();
  const sources = [];

  for (const filePath of options.files) {
    const category = getCategoryConfig(filePath);
    const sourceInfo = await refetchSource(filePath, bearerToken);
    const articles = sourceInfo.posts
      .filter((post) => post.article)
      .map((post) => toArticleRecord(category, post, sourceInfo.users, sourceInfo));

    const rankedArticles = sortByLikeCount(articles).map((item, index) => ({
      ...item,
      rank_by_like_count: index + 1,
    }));

    categoryBuckets.set(category.key, {
      key: category.key,
      label: category.label,
      source_file: filePath,
      total_articles: rankedArticles.length,
      items: rankedArticles,
    });

    sources.push({
      category: category.key,
      label: category.label,
      source_file: filePath,
      start_time: sourceInfo.startTime,
      end_time: sourceInfo.endTime,
      query: sourceInfo.query,
      pages_fetched: sourceInfo.pageUrls.length,
      articles_found: rankedArticles.length,
    });
  }

  const groups = Array.from(categoryBuckets.values());
  const consolidated = {
    generated_at: new Date().toISOString(),
    sort: 'like_count_desc',
    sources,
    categories: Object.fromEntries(groups.map((group) => [group.key, group])),
  };

  await writeFile(options.outJson, JSON.stringify(consolidated, null, 2));
  await writeFile(options.outMd, buildMarkdown(groups));

  console.log(`Wrote ${options.outJson}`);
  console.log(`Wrote ${options.outMd}`);
  for (const group of groups) {
    console.log(`${group.label}: ${group.total_articles} article objects`);
  }
}

await main();