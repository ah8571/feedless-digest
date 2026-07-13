# Scripts

Quick reference for the article discovery and newsletter publishing pipeline.

## Pipeline Overview

```
x-recent-search → x-consolidate-articles → human review → listmonk:live-send
```

---

## X Discovery

### `x-recent-search.mjs`
**Step 1 — Raw search.** Queries X API v2 recent search with a time window and query, saves JSON output.

```
$env:X_BEARER_TOKEN='...'; $env:X_MAX_RESULTS='300'
$env:X_START_TIME='2026-07-12T00:00:00Z'; $env:X_END_TIME='2026-07-13T00:00:00Z'
npm run x:recent-search -- --out lists/x/<file>.json '<query>'
```
Queries in `docs/api-research/x-query-workbench.md`.

### `x-consolidate-articles.mjs`
**Step 2 — Isolate & rank.** Reads raw search JSON, refetches tweets with rich fields (author, metrics, entities), filters to X Article cards only, ranks by likes, outputs JSON + human-review MD.

```
$env:X_BEARER_TOKEN='...'
node scripts/x-consolidate-articles.mjs \
  --out-json lists/x/<date>-article-candidates.json \
  --out-md lists/x/<date>-article-candidates.md \
  lists/x/<date>-<topic>-yesterday-300.json ...
```

### `x-article-resolve.mjs`
**Debug utility.** Resolves one or more X Article IDs/URLs to full content via X API. Not part of the daily pipeline.

```
npm run x:article-resolve -- --raw <id-or-url> [more ids...]
```

### `x-apify-run.mjs`
**Alternative search.** Runs the Apify X scraper actor. Used when X API credits are depleted.

### `x-apify-dataset.mjs`
**Alternative fetch.** Retrieves results from a completed Apify actor run.

---

## Listmonk (Newsletter Sending)

### `listmonk-lanes.mjs`
**Config.** Maps lane slugs to Listmonk list names, sender names, and tags. Source of truth for all newsletter targets.

### `listmonk-live-send.mjs`
**Publish.** Creates and sends a Listmonk campaign from a linked edition markdown file. Requires `--confirm-live-send`.

```
npm run listmonk:live-send -- --lane <slug> --name "<name>" \
  --subject "<subject>" \
  --body-file lists/editions/<date>-<topic>-NNN-feedfree-linked.md \
  --confirm-live-send
```

### `listmonk-test-send.mjs`
**Preview.** Same as live-send but sends only to test emails, not real subscribers. Does not require `--confirm-live-send`.

```
npm run listmonk:test-send -- --lane <slug> --name "<name>" \
  --subject "<subject>" \
  --body-file lists/editions/<date>-<topic>-NNN-feedfree-linked.md
```

### `listmonk-sync-subscribers.mjs`
**Sync.** Pushes Supabase `newsletter_signups` to Listmonk, reconciling topic preferences and subscription status across lists.

```
npm run listmonk:sync-subscribers
```

---

## Edition Files

Editions go in `lists/editions/`. Two variants per edition:

| Suffix | Used for |
|---|---|
| `-feedfree-linked.md` | Newsletter email + website archive (uses `##`/`###` headings with inline links) |
| `-feedfree-posts.md` | X/Twitter posts (no `#` except subcategory headers; source-line + no-links versions) |
