# X API Guide

Initial pass collected on 2026-07-06.

Purpose: document the practical X API path for Feedfree research and eventual ingestion, with emphasis on finding native long-form posts rather than only shared links.

Note: use the official X docs as the canonical reference. This file is meant to summarize the practical implications for Feedfree, not to replicate the X documentation.

## Docs Entry Points

- Full machine-readable docs index: https://docs.x.com/llms-full.txt
- API overview: https://docs.x.com/x-api
- Search overview: https://docs.x.com/x-api/posts/search/introduction
- Search operators: https://docs.x.com/x-api/posts/search/integrate/operators
- Fields: https://docs.x.com/x-api/fundamentals/fields
- Expansions: https://docs.x.com/x-api/fundamentals/expansions
- Pricing: https://docs.x.com/x-api/getting-started/pricing

## Practical MVP Goal

Use X as a discovery source for substantial native posts about:

- AI
- artificial intelligence
- LLM
- agent / agents

The main challenge is that X does not expose a native search operator for minimum word count, article length, or "only long-form posts".

That means the practical workflow is:

1. run a broad topic search
2. request full text plus metadata
3. filter in our own code for long-form signals such as word count, structure, and engagement

## Auth For First Tests

For the first read-only search probes, the credential to use is the app-only bearer token.

- use the bearer token generated under `Keys & Tokens` -> `App-Only Authentication`
- do not start with the consumer key alone for this use case
- the consumer key and secret are part of OAuth app credentials, but the search examples we have already confirmed use `Authorization: Bearer ...`

Practical implication:

- if the goal is to call recent search now, generate the bearer token and use that first
- move to OAuth user auth only if a later endpoint actually requires acting on behalf of a user

Local probe added in this repo:

```bash
npm run x:recent-search -- '(AI OR "artificial intelligence" OR LLM OR agent OR agents) -is:retweet -is:reply lang:en'
```

Required environment variable:

```bash
X_BEARER_TOKEN=...
```

## Search Endpoints

### Recent search

- Endpoint: `GET /2/tweets/search/recent`
- Window: last 7 days
- Access: available to all developers
- Limit: up to 100 posts per request

### Full archive search

- Endpoint: `GET /2/tweets/search/all`
- Window: full public archive back to 2006
- Access: pay-per-use / enterprise
- Limit: up to 500 posts per request

## First Search To Try

Start broad and avoid biases like links, `thread`, or `1/`.

```text
(AI OR "artificial intelligence" OR LLM OR agent OR agents) -is:retweet -is:reply lang:en
```

Why this is the right first pass:

- includes the core topic family you already isolated for Google Alerts
- excludes retweets and replies, which are usually lower-signal for this use case
- keeps the result set broad enough to capture native long-form posts that do not advertise themselves as threads

## Useful Operators For Feedfree

- `from:` posts from a specific user
- `to:` replies to a specific user
- `url:` posts containing a specific URL or domain
- `has:links` useful later, but not the right default for native long-form discovery
- `conversation_id:` useful after discovering a promising thread root
- `list:` useful later if you build curated X lists of strong authors
- `-is:retweet` exclude retweets
- `-is:reply` exclude replies
- `is:quote` optionally isolate quote posts
- `is:verified` optional secondary quality filter
- `lang:en` or other language filters

## Parameters To Request

To evaluate whether a post is worth surfacing, request:

```text
tweet.fields=created_at,public_metrics,author_id,conversation_id,referenced_tweets,lang
expansions=author_id,referenced_tweets.id
user.fields=username,name,verified,public_metrics,description
max_results=10
```

These fields give enough data for a first-pass scoring model.

## Confirmed Parameter Surface From `llms-full.txt`

The machine-readable docs reference reinforces the standard parameter surface for search and lookup flows:

- `query`
- `tweet.fields`
- `user.fields`
- `expansions`
- `max_results`
- `pagination_token`

That is useful because it confirms the practical knobs we can control early.

It does not appear to introduce a native parameter for:

- minimum word count
- character count filtering
- article-only discovery
- long-form-only search

So the core approach remains: search broadly, then distill locally.

## Why Word Count Must Be Local

X search operators do not include:

- minimum words
- minimum characters
- article mode only
- native long-form only

So if you want a threshold like `>= 500 words`, you must:

1. retrieve candidate posts
2. count words in your own script
3. discard anything below threshold

## Longform Support: What Looks Potentially Useful

From the X docs material, the most promising longform-related properties to remember for later testing are:

- `truncated: true`
- `extended_tweet.full_text`
- `extended_tweet.display_text_range`
- `extended_tweet.entities`

What these seem to mean:

- `truncated: true` suggests the short text field is only a preview
- `extended_tweet.full_text` carries the full post body when a longer post is represented in that payload shape
- `display_text_range` describes the visible character span
- `entities` and their `indices` mark where hashtags, URLs, mentions, or media occur in the text

### About `indices`

The `indices` arrays are text offsets inside the string.

Example:

- `indices: [192, 215]`

means the entity occupies that character range in the text.

This is useful for parsing, but it is not itself a quality or length filter.

### Important Caution

The longform examples found so far appear tied to Account Activity or event-style payloads.

That means:

- they show how X may represent longer posts in some contexts
- they do not yet prove that broad topic search returns the same longform structure in the same way

So for now, treat these as properties worth testing, not as guaranteed search response fields for the discovery workflow.

## Articles vs Long Posts

The docs also reference Articles endpoints such as:

- `POST /2/articles/draft`
- `POST /2/articles/{article_id}/publish`

These appear to be write-oriented endpoints for creating and publishing Articles on X.

That is not the same as a public discovery surface for finding native long-form posts by topic.

Observed UI clue worth remembering:

- at least some X Article links appear to use a path shape like `/{username}/article/{id}`
- example pattern observed in page markup: `/ClaudeDevs/article/2074208949205881033`

Why that may matter later:

- if scraped output or rendered HTML includes full post URLs, this path shape may help distinguish Article-style content from ordinary status URLs
- that could become a cheap downstream classifier even if the search or scraping entrypoint does not label Articles explicitly

So for Feedfree, Articles are currently interesting as a product surface, but not yet useful as the main ingestion path.

## Recommended Local Heuristics

For a Feedfree-style filter, test some combination of:

- minimum 500 words
- high character count as a preliminary filter
- multiple paragraphs or line breaks
- strong engagement relative to the topic
- lower hashtag density
- fewer throwaway mentions
- optional bonus for verified or strong-author accounts

This is the real way to approximate "article-like" posts.

## Example Request Shape

```bash
curl "https://api.x.com/2/tweets/search/recent?query=(AI%20OR%20%22artificial%20intelligence%22%20OR%20LLM%20OR%20agent%20OR%20agents)%20-is%3Aretweet%20-is%3Areply%20lang%3Aen&tweet.fields=created_at,public_metrics,author_id,conversation_id,referenced_tweets,lang&expansions=author_id,referenced_tweets.id&user.fields=username,name,verified,public_metrics,description&max_results=10" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

## Read Pricing Notes

Initial pricing note captured on 2026-07-06.

Read operations are charged per resource returned in the response.

| Resource | Unit cost |
| :-- | :-- |
| Posts: Read | `$0.005` per resource |
| User: Read | `$0.010` per resource |
| DM Event: Read | `$0.010` per resource |
| Following/Followers: Read | `$0.010` per resource |
| List: Read | `$0.005` per resource |
| Space: Read | `$0.005` per resource |
| Community: Read | `$0.005` per resource |
| Note: Read | `$0.005` per resource |
| Like: Read | `$0.001` per resource |
| Mute: Read | `$0.001` per resource |
| Block: Read | `$0.001` per resource |
| Profile Update: Read | `$0.005` per resource |

Practical implication:

- broad search plus lots of expansions can get expensive if done carelessly
- start with small `max_results`
- avoid asking for unnecessary related objects early
- test query quality before scaling the number of requests

## Scraping Fallback To Consider

If the official X API remains too expensive for broad discovery pulls, a scraping layer may be the practical fallback for MVP-stage collection.

Candidate to review:

- Scrape.do X/Twitter scraping guide: https://scrape.do/blog/twitter-x-scraping/

Why it is worth keeping on the table:

- the X API pricing can make large exploratory pulls uneconomical
- Scrape.do positions itself as a cheaper path for collecting publicly visible X content
- it supports JavaScript rendering and waiting on tweet selectors such as `article[data-testid="tweet"]`
- the guide covers extracting tweet text, author info, URLs, embeds, and metrics from rendered HTML

Important constraints:

- scraping does not solve the ranking problem; it only changes the collection method and cost profile
- X uses aggressive anti-bot defenses and login walls, so scraper reliability can change over time
- this should be treated as a fallback or hybrid ingestion option, not yet the primary documented path

Practical Feedfree use:

- use the X API first for query and filter validation
- if cost per useful candidate stays too high, test a narrow scraping workflow against public pages or targeted author/profile surfaces
- keep the same local filtering logic either way: choose `note_tweet.text` or scraped text, count words, penalize promo/link-heavy posts, shortlist candidates

### Apify Programmatic Example

If Apify's paid tier is enabled, the actor can also be run directly from code.

Important note:

- keep the Apify token in an environment variable, not inline in source
- free users are limited to demo mode, with 10 items per run

```ts
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const input = {
  searchTerms: [
    '("artificial intelligence" OR "AI agents" OR LLM OR inference) -filter:replies -filter:retweets',
  ],
  maxItems: 100,
  sort: 'Latest',
  tweetLanguage: 'en',
  minimumFavorites: 5,
  minimumReplies: 2,
  includeSearchTerms: true,
};

const run = await client.actor('apidojo/tweet-scraper').call(input);
const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Dataset: ${run.defaultDatasetId}`);
console.log(`Fetched rows: ${items.length}`);
```

Why this example matters:

- it keeps the search logic explicit in `searchTerms`
- it uses only light engagement thresholds, so niche but substantive posts still have a chance to survive
- it gives a reproducible benchmark path for comparing Apify results against the official X API
- the actor docs indicate output may include an `article` object for some results, which is relevant for downstream Article detection

### Apify Output Fields Worth Retaining

From actual benchmark runs, the most useful Apify output fields to preserve for downstream analysis are:

- `url`
- `twitterUrl`
- `text`
- `fullText`
- `createdAt`
- `likeCount`
- `replyCount`
- `retweetCount`
- `quoteCount`
- `bookmarkCount`
- `viewCount`
- `author`
- `entities`
- `extendedEntities`
- `media`
- `searchTerm`
- `article`

Practical notes from real runs:

- do not assume `fullText` is always the best field; in some Apify rows, `text` is materially longer than `fullText`
- for local filtering, prefer the longest available content among `noteTweet.text`, `note_tweet.text`, `text`, `fullText`, and `article.previewText`
- `searchTerm` in returned rows may be normalized or expanded by the actor, for example by appending `lang:en`, `min_replies:3`, or `since:...`
- `author` is much richer than the lean X API probe and is useful for later heuristics like follower thresholds or blue-check filtering
- `entities`, `extendedEntities`, and `media` are useful for penalizing link-heavy or media-heavy posts

Important caution from the current benchmark set:

- the actor docs show that an `article` object can exist in output
- however, the paid 100-row and 1000-row benchmark runs for the broad AI discovery query returned `0` rows with a populated `article` field
- so `article` should be treated as a possible but not yet commonly observed field for this workflow

## Pattern Notes From A Strong Example

One useful X Article example we inspected was Ryan Carson's post linking to:

- `How to use Fable to orchestrate a huge project with 40 sub-agents`

Even without full article-body access, the visible title and teaser text exposed a pattern that is more specific than generic AI search terms.

High-signal terms in that example:

- product or model names such as `Fable`, `Claude`, `Sonnet`, `Opus`, `Cursor`, `OpenCode`
- agent execution terms such as `sub-agent`, `subagents`, `orchestrate`, `orchestration`
- software delivery terms such as `PR`, `PRs`, `pull request`, `repo`, `codebase`, `prod`, `production`, `deploy`, `refactor`
- data or backend migration terms such as `DB schema`, `schema`, `migration`, `data mutation`
- concrete scale markers such as file counts, PR counts, or time-bounded delivery claims

Practical implication:

- strong newsletter candidates often describe a specific tool, model, or engineering workflow
- many good posts do not say `AI` repeatedly; they say `Claude`, `Fable`, or another product name instead
- query quality improves when topic terms are paired with workflow terms, instead of searching for AI terms alone

Prototype query shape worth iterating on:

```text
(("Claude" OR "Claude Code" OR Sonnet OR Opus OR Fable OR Cursor OR OpenCode OR Gemini OR GPT OR LLM) (agent OR agents OR "sub-agent" OR subagents OR orchestrate OR orchestration OR codebase OR repo OR PR OR PRs OR "pull request" OR migration OR schema OR prod OR production OR deploy OR refactor OR evals OR benchmark)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price
```

Early result from a 300-row Apify test on 2026-07-06:

- returned `284` rows
- surfaced much more on-target examples such as `Fable`, `OpenCode`, and coding-agent workflow posts
- still let some off-topic results through, so it should be treated as a better prototype, not a solved query

Working two-bucket variant that broadened recall without collapsing relevance:

```text
(("AI" OR "artificial intelligence" OR LLM OR Claude OR "AI agent" OR "AI agents" OR Cursor OR Fable OR OpenCode) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price
```

Observed result from a 300-row Apify test on 2026-07-06:

- returned the full `300` rows requested
- immediately surfaced `Claude Code`, Anthropic-builder, and inference-engineering posts
- still allowed some political or market-adjacent leakage, so the second bucket is doing useful work but not complete cleanup

Important practical note:

- a more ambitious first-bucket expansion with too many loosely related model names returned `[{ "noResults": true }]`
- the simpler two-bucket form above behaved much better
- so the query parser or ranking behavior seems sensitive to overstuffed first buckets; expand gradually and validate each variant

Better scaling pattern for first-bucket expansion:

- do not keep appending every model or tool name into one giant first bucket
- instead, keep the same second bucket and split the first bucket into several smaller search families
- pass those families as multiple `searchTerms` entries so the actor can return a mixed dataset without collapsing to `noResults`

Example three-family split that worked on 2026-07-06:

```json
[
  "((\"AI\" OR \"artificial intelligence\" OR LLM OR Claude OR \"Claude Code\") (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price",
  "((Cursor OR Fable OR OpenCode OR Copilot OR Codex OR Cline) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price",
  "((Gemini OR GPT OR Sonnet OR Opus OR NotebookLM) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

Observed result from a 300-row Apify test on 2026-07-06:

- returned the full `300` rows requested
- distributed almost evenly across the three families: `100`, `99`, and `101`
- surfaced strong commentary and builder-oriented posts around `Claude Code`, `OpenCode`, `Fable`, `Cursor`, `Gemini`, and related tools

Practical implication:

- if bucket 1 needs to keep expanding, the safer move is adding another search family, not making one family much longer
- this should make it easier to prototype category-specific newsletter sources while keeping each family interpretable

Working hypothesis for why native Articles remain hard to isolate:

- search and scraping flows seem to surface long posts more reliably than populated `article` objects
- Article pages are also more login-gated than ordinary status URLs
- that means Feedfree may need to optimize for `article-like` long posts first, and treat native X Articles as a bonus rather than the primary discovery surface

## MVP Recommendation

Current working pull queries now live in a separate editable workbench:

- `docs/api-research/x-query-workbench.md`

For Feedfree, the first sensible X workflow is:

1. use recent search with the broad AI / LLM / agents query
2. request text, author, and metrics
3. locally filter for minimum word count and basic quality heuristics
4. manually review the survivors
5. only later add more complex logic like allowlists, domain patterns, or conversation expansion

That keeps cost and complexity under control while still letting X contribute to early issue sourcing.