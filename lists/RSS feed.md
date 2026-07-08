# RSS Feeds

- updatedAt: 2026-07-08

## Publications

- status: tracking list initialized
- note: add publication RSS feeds here as they are approved for ongoing monitoring

## Reddit Test Feeds

- note: these are poll targets for evaluating native Reddit RSS versus OpenRSS-wrapped feeds

### Verified subreddit examples

- source: Reddit native RSS
- label: redditdev hot
- pollUrl: https://old.reddit.com/r/redditdev/hot/.rss
- topic: Reddit platform / API updates
- status: verified format via OpenRSS docs

- source: OpenRSS feed
- label: redditdev hot
- pollUrl: https://openrss.org/feed/www.reddit.com/r/redditdev/hot/
- pageUrl: https://openrss.org/www.reddit.com/r/redditdev/
- topic: Reddit platform / API updates
- status: verified live

### Candidate search feeds to test

- source: Reddit native RSS
- label: sitewide AI search
- pollUrl: https://www.reddit.com/search.rss?q=AI
- topic: broad AI search across Reddit
- status: verified live

- source: OpenRSS wrapper
- label: sitewide AI search
- pageUrl: https://openrss.org/www.reddit.com/search/?q=AI
- topic: broad AI search across Reddit
- status: candidate, test manually in browser or reader before polling

- source: OpenRSS wrapper
- label: sitewide LLM search
- pageUrl: https://openrss.org/www.reddit.com/search/?q=LLM
- topic: broad LLM search across Reddit
- status: candidate, test manually in browser or reader before polling