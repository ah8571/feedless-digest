# Feedfree Digest Development Roadmap

- [ ] Finish the website and domain setup.
- [ ] Start with Resend and authenticate the sending domain.
- [ ] Build the editorial queue in Airtable or Google Sheets.
- [ ] Research X and Reddit, Hacker News first.
- [ ] Wire the first ingestion workflow into the queue.
- [ ] Produce a sample issue and archive it on the site.

## Phase 1: Public Presence
- [ ] Finalize the landing page messaging around the core promise: long-form signal without feed addiction.
- [ ] Decide on the primary call to action: waitlist, live subscription, or sample issue.
- [ ] Replace temporary email links with a real signup flow.
- [ ] Finalize the archive page structure so old issues can be published by date.
- [ ] Replace placeholder privacy and terms text before public launch.
- [ ] Connect the site to a production domain and deploy it on Vercel.
## Phase 2: Email Delivery Setup
- [ ] Start with Resend for transactional simplicity and fast setup.
- [ ] Verify domain ownership and configure SPF, DKIM, and DMARC.
- [ ] Create the sending identities needed for editorial and sponsorship workflows.
- [ ] Choose the newsletter operating model:
  - [ ] open-source publishing tool on a server later
  - [ ] lightweight hosted sending first
- [ ] Decide when to graduate to Amazon SES based on subscriber count, sending volume, and cost sensitivity.
- [ ] Document the migration trigger from Resend to SES.
## Phase 3: Editorial Operating System
- [ ] Choose Airtable or Google Sheets as the first editorial queue.
- [ ] Define the minimum fields for each candidate item:
  - [ ] source platform
  - [ ] source URL
  - [ ] author
  - [ ] title or hook
  - [ ] full-text availability
  - [ ] word count estimate
  - [ ] engagement metrics
  - [ ] date discovered
  - [ ] editorial status
  - [ ] issue assignment
- [ ] Create simple editorial states such as `new`, `reviewing`, `approved`, `rejected`, and `scheduled`.
- [ ] Define the daily review workflow so sourcing stays useful instead of becoming noise.
- [ ] Write the first issue template so curated items are easy to publish consistently.
## Phase 4: Source Ingestion MVP
- [ ] Start with Reddit and Hacker News
- [ ] Define source-specific heuristics before adding any AI filtering.
- [ ] Build the first automation in n8n, Make, or Python.
- [ ] Send raw candidates into the editorial queue instead of newsletter.
- [ ] Add deduplication before adding summarization.
- [ ] add AI scoring after the basic pipeline produces enough candidates.
## Phase 5: API Research Track
- [ ] Create one document per source inside `docs/api-research/`.
- [ ] For each source, document:
  - [ ] official access path
  - [ ] full-text availability
  - [ ] useful metadata for scoring
  - [ ] rate limits and pricing
  - [ ] terms-of-use risk
  - [ ] fallback discovery path
  - [ ] minimum viable heuristics
- [ ] Record whether each source should be treated as:
  - [ ] first-class API integration
  - [ ] indirect discovery source
  - [ ] experimental source
- [ ] Revisit the priority order after the first research pass.
## Phase 6: Publishing Workflow
- [ ] Create a standard issue assembly format.
- [ ] Decide how much summary or commentary to add versus just linking out.
- [ ] Publish a first sample issue
- [ ] Add the published issue to the site archive.
## Phase 7: Monetization Layer
- [ ] Keep the advertise page simple until you have audience data.
- [ ] Create a basic sponsor deck with positioning, issue concept, and expected reader profile.
- [ ] Define early inventory types:
  - [ ] single issue sponsorship
  - [ ] category exclusivity
  - [ ] archive placement
- [ ] Add actual pricing only after early audience metrics exist.
