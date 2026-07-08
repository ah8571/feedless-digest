# DEV.to API

Initial pass collected on 2026-07-08.

Purpose: document the practical DEV.to / Forem API path for Feedfree research, with emphasis on what can be discovered directly via API versus what still requires downstream filtering.

Note: use the official Forem docs as the canonical reference. This file summarizes the practical implications for Feedfree rather than duplicating the full API reference.

## Practical Summary

DEV.to has a real public API through Forem/DEV.

The most useful surface is article listing plus direct article fetches:

- `GET /articles`
- `GET /articles/{id}`
- `GET /articles/{username}/{slug}`

The listing endpoint supports filters and controls such as:

- `tag`
- `tags`
- `tags_exclude`
- `username`
- `state`
- `top`
- `page`
- `per_page`

That means the API is good for:

- tag-driven discovery
- author-driven pulls
- latest / fresh / rising lists
- fetching full content once you already have the article

## Main Limitation

This does not appear to be a strong full-text article search API for discovery.

So the likely constraint is:

- good for taxonomy-based discovery
- less good for freeform keyword-based article search

In practice, that means DEV.to looks much more API-friendly than LinkedIn, but less flexible than a true search-first discovery surface.

## Why This Still Matters

Compared with LinkedIn, DEV.to is easier to integrate because:

- article listing is already exposed directly
- single-article fetches can return full content
- no scraping layer is required for basic retrieval

But the tradeoff is that discovery likely depends more on:

- known tags
- known authors
- popularity and freshness buckets

rather than arbitrary keyword search across article bodies.

## Docs Entry Points

- API overview: https://developers.forem.com/api
- Version 1 docs: https://developers.forem.com/api/v1

## Good Next Move

Add a small DEV fetch script for the first useful tags:

- `ai`
- `machinelearning`
- `opensource`
- `webdev`
- `career`
- `productivity`

That would give Feedfree a lightweight benchmark for:

- article volume
- engagement signals
- article quality by tag
- whether DEV.to is worth treating as a real recurring source