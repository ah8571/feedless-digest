# X Query Workbench

Updated: 2026-07-06

## AI Engineering

Baseline article-gated query that worked before the larger family split:

one version like this with no english parameter, articles from 1 day before (300 results cap); 

```json
[
"((article) (Gemini OR GPT OR Sonnet OR Opus OR OpenAI OR Claude OR AI OR Cursor OR Codex OR Copilot OR vibe OR LLM OR openclaw OR hermes) (code OR agent OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

alternative w/ threads / broader query

```json
[
"((article OR \"read this\" OR \"wrote about\" OR thread OR 1/) (Gemini OR GPT OR Sonnet OR Opus OR OpenAI OR Claude OR AI OR Cursor OR Codex OR Copilot OR vibe OR LLM OR openclaw OR hermes) (code OR agent OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```



smaller apify version:
```json
[
  "((article OR \"this article\" OR \"read this\" OR \"wrote about\") (AI OR LLM OR Claude OR \"Claude Code\" OR OpenAI OR GPT OR Gemini) (code OR engineer OR developer OR agent OR development OR workflow OR PR OR deploy)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

## Open source intrigue

search with no english parameter, articles from 1 day before (200 results cap); one version like this with an english parameter and 1 day before (100)

```json
[
  "((article) (\"open source\" OR \"source code\" OR \"closed source\" OR \"self-hosted\" OR OSS OR local)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

## SEO

search with no english parameter, articles from 1 day before (200 results cap); 

```json
[
  "((article) (SEO OR AEO OR GEO OR \"AI Overview\" OR organic OR ASO) (citation OR backlink OR backlinks OR entities OR PR OR \"press release\" OR anchor OR SERP OR programmatic OR mention OR metatitle OR metadescription OR technical OR authority OR search OR link) ) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

## Social Media Marketing

Compact article-gated query for influencer, UGC, and short-form growth topics; search with no english parameter, articles from 1 day before (300 results cap);

```json
[
  "((article) (TikTok OR Instagram OR creator OR creators OR X OR youtube) (influencer OR influencers OR UGC OR ads OR advertising OR \"creator ads\" OR \"paid social\" OR conversion OR revenue OR campaign OR followers OR following OR monetize OR monetization OR growth OR content OR audience OR viral OR distribution)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```


## Formations Considered

***Broad generic AI queries found long posts but too much noise.*** 

***Adding `article` materially improved article-adjacent discovery***

