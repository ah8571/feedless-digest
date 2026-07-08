# X Query Workbench

Updated: 2026-07-06

## AI Engineering

Baseline article-gated query that worked before the larger family split:

one version like this with no english parameter, articles from 2 days before:

```json
[
"((article OR \"read this\" OR \"wrote about\" OR thread OR 1/) (Gemini OR GPT OR Sonnet OR Opus OR OpenAI OR Claude OR AI OR Cursor OR Codex OR vibe OR LLM OR openclaw OR hermes) (code OR agent OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

one version like this with an english parameter and 2 days before:

```json
[
"((article) (Gemini OR GPT OR Sonnet OR Opus OR OpenAI OR Claude OR AI OR Cursor OR Codex OR vibe OR LLM OR openclaw OR hermes) (code OR agent OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals)) -is:reply -is:retweet -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```


smaller apify version:
```json
[
  "((article OR \"this article\" OR \"read this\" OR \"wrote about\") (AI OR LLM OR Claude OR \"Claude Code\" OR OpenAI OR GPT OR Gemini) (code OR engineer OR developer OR agent OR development OR workflow OR PR OR deploy)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```



Expanded non-article families:

```json
[
  "((\"AI\" OR \"artificial intelligence\" OR LLM OR Claude OR \"Claude Code\" OR vibe OR \"vibe coding\" OR \"vibe coder\") (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals OR workflow)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price",
  "((Cursor OR Fable OR OpenCode OR Copilot OR Codex OR Cline) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals OR workflow)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price",
  "((Gemini OR GPT OR Sonnet OR Opus OR NotebookLM) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals OR workflow)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

Expanded article-gated families:

```json
[
  "((article OR \"this article\" OR \"read this\" OR \"wrote about\") (\"AI\" OR \"artificial intelligence\" OR LLM OR Claude OR \"Claude Code\" OR vibe OR \"vibe coding\" OR \"vibe coder\") (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals OR workflow OR loop OR loops OR \"SKILL.md\" OR \"/goal\" OR \"/loop\" OR \"/schedule\" OR CI OR Lighthouse)) -filter:replies -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price",
  "((article OR \"this article\" OR \"read this\" OR \"wrote about\") (Cursor OR Fable OR OpenCode OR Copilot OR Codex OR Cline) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals OR workflow OR loop OR loops OR CI)) -filter:replies -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price",
  "((article OR \"this article\" OR \"read this\" OR \"wrote about\") (Gemini OR GPT OR Sonnet OR Opus OR NotebookLM) (code OR coding OR engineer OR engineering OR developer OR development OR software OR repo OR codebase OR PR OR PRs OR deploy OR deployment OR schema OR migration OR benchmark OR evals OR workflow OR loop OR loops OR CI)) -filter:replies -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

Small buckets avoid `noResults`; article-gated families keep recall while limiting parser complexity.

Save raw lists to `lists/x/original/<timestamp>-<name>.md` and filtered lists to `lists/x/distilled/<timestamp>-<name>.md`.

## Social Media Marketing

Compact article-gated query for influencer, UGC, and short-form growth topics:

```json
[
  "((article OR \"this article\" OR \"read this\" OR \"wrote about\") (TikTok OR Instagram OR creator OR creators) (influencer OR influencers OR UGC OR ads OR advertising OR \"creator ads\" OR \"paid social\" OR conversion OR revenue OR campaign)) -filter:replies -filter:retweets -crypto -bitcoin -solana -stock -stocks -trading -investing -market -price"
]
```

This version uses a separate strategy bucket so generic TikTok/Instagram article chatter is less likely to leak in.

## Formations Considered

Broad generic AI queries found long posts but too much noise. Oversized first buckets broke into `noResults`, so the safer pattern is multiple smaller families. Direct article-body phrase searches failed, so native article text is still not a reliable retrieval surface. The best salvage pattern so far is article/share-intent language plus product terms plus workflow terms, especially around Claude Code and loops. Adding `article` materially improved article-adjacent discovery, while removing `-filter:retweets` changed almost nothing in the Claude loops slice. Current bias: optimize for tweets that quote or point to worthwhile articles, not for direct article-body search.