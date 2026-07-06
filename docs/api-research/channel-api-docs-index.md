# Channel API Docs Index

Initial pass collected on 2026-07-04.

This file is a routing index for the channels currently listed in `docs/FORUMS LIST.md`.
It is intentionally lightweight: the goal is to capture the best official API doc entry point for each source, plus a quick note on whether the source looks usable for Feedfree ingestion.

## Open Blog Forums

### dev.to
- Status: usable
- Docs: https://developers.forem.com/api
- Current API version docs: https://developers.forem.com/api/v1
- Notes: dev.to runs on Forem. V1 is the recommended API surface and uses the `accept: application/vnd.forem.api-v1+json` header; many endpoints also require a user API key.

### Hashnode
- Status: usable, but paid/gated
- Docs entry: https://hashnode.com/headless
- GraphQL endpoint: https://gql.hashnode.com/
- Access change note: https://hashnode.com/announcements/graphql-api
- Notes: Hashnode's GraphQL API is now tied to Hashnode Pro. The current practical path is the headless / GraphQL surface, but read and write access are no longer effectively open.

### Medium
- Status: limited and effectively deprecated
- Docs: https://github.com/Medium/medium-api-docs
- Notes: Medium's official API docs still exist in an archived repository, but the docs explicitly state the API is no longer supported and new integrations are not recommended.

### HackerNoon
- Status: no clear public API found in the initial pass
- Closest checked URL: https://hackernoon.com/p/about-api
- Notes: I did not find an official public API reference or stable developer docs for content ingestion. Treat HackerNoon as a crawl/discovery source unless a private or partner API turns up later.

## Structured Social Forums & Aggregators

### Hacker News
- Status: usable
- Docs: https://github.com/HackerNews/API
- Notes: This is the official HN API reference. It exposes stories, comments, users, live update feeds, and top / new / ask / show / job story lists over Firebase-backed JSON endpoints.

### Reddit
- Status: usable
- REST API docs: https://www.reddit.com/dev/api/
- OAuth docs: https://github.com/reddit-archive/reddit/wiki/OAuth2
- API rules: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- Notes: The main API surface for listings, comments, search, and subreddit metadata is still documented on `reddit.com/dev/api`. The OAuth explainer is older and archived, but it remains the clearest reference for auth flows and token usage.

### Lemmy
- Status: usable
- API docs entry: https://join-lemmy.org/docs/contributors/04-api.html
- JS client and generated OpenAPI reference source: https://github.com/LemmyNet/lemmy-js-client
- Server source: https://github.com/LemmyNet/lemmy
- Notes: Lemmy does expose a real API, but the most practical reference path today appears to run through the contributor API page plus the official JS client repo, which generates OpenAPI / Swagger artifacts.

### Indie Hackers
- Status: no clear public API found in the initial pass
- Site: https://www.indiehackers.com/
- Notes: I did not find an official public API or developer docs surface. Treat this as a web discovery target unless a partner or private API appears later.

## Social Media Platforms

### X
- Status: usable, but paid
- Docs: https://docs.x.com/x-api
- Notes: X's current docs cover posts, users, search, trends, and streaming. The platform is now pay-per-usage rather than the older tiered developer plans.

### LinkedIn
- Status: limited / gated for Feedfree-style discovery
- Docs root: https://learn.microsoft.com/en-us/linkedin/
- Share APIs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
- Notes: LinkedIn does have official APIs for posting and related member workflows, but broad public-content discovery is not exposed as a simple open ingestion API. This is likely better treated as a constrained or search-assisted source.

### Threads
- Status: usable, but permission-gated
- Docs root: https://developers.facebook.com/docs/threads
- API reference: https://developers.facebook.com/documentation/threads/reference
- Keyword search: https://developers.facebook.com/documentation/threads/keyword-search
- Notes: Threads now exposes keyword and topic-tag search via `/keyword_search`, but public search behavior depends on `threads_keyword_search` approval. Without approval, searches are limited to the authenticated user's own posts.

## Gated Community Platforms

### Discord Forum Channels
- Status: usable only with bot/app access inside specific servers
- Channel resource docs: https://docs.discord.com/developers/resources/channel#channel-object-channel-types
- Notes: Discord forum channels are represented as `GUILD_FORUM` channels. The relevant official docs live in the standard Discord developer API under channels and threads, but access depends on app installation, permissions, and server-level scope.

## Immediate Follow-Up Candidates

- Reddit: make a dedicated source note next, because the official docs are broad and we should isolate the exact listing, comment-tree, and search endpoints we care about.
- Hacker News: make a dedicated note next, since its public API is straightforward and low-risk.
- Threads: make a dedicated note next, because keyword search is promising but permission gating needs to be documented carefully.
- Hashnode: verify exactly which reads we can still make without a Pro-backed publication before we treat it as a first-wave source.