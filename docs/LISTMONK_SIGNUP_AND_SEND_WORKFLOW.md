# Listmonk Signup And Send Workflow

## Landing page signup

The landing page now supports two modes:

1. `Supabase` fallback
2. `Listmonk` target when public Listmonk env vars are present

## To point the landing page at Listmonk later

Add these Cloudflare Pages environment variables:

- `NEXT_PUBLIC_LISTMONK_URL`
- `NEXT_PUBLIC_LISTMONK_PUBLIC_LIST_UUID`

Example:

- `NEXT_PUBLIC_LISTMONK_URL=https://mail.feedfree.tech`
- `NEXT_PUBLIC_LISTMONK_PUBLIC_LIST_UUID=your-public-list-uuid`

When these exist, the signup form posts to:

- `POST /api/public/subscription`

## First Listmonk-based send workflow

1. Visitor enters email on the landing page.
2. The form submits to Listmonk's public subscription endpoint.
3. The subscriber lands in a public list.
4. If the list is double opt-in, Listmonk sends the confirmation email.
5. Once confirmed, the subscriber is eligible for campaigns.
6. You create a campaign draft in Listmonk.
7. You send a test campaign to your own email.
8. You review formatting, links, and headers.
9. You send the real issue to the list.
10. Listmonk tracks opens, clicks, unsubscribes, and bounces.

## Recommended first setup

1. Create one public list in Listmonk.
2. Use double opt-in.
3. Keep one internal test address subscribed.
4. Run one manual campaign before automating API campaign creation.

## Important note

If browser-to-Listmonk cross-origin requests are blocked in production, the fallback solution is a tiny proxy endpoint on your own domain. Do not build that unless direct posting actually fails.

## What to set up next

The immediate goal should be a manual editorial workflow that supports:

1. collecting signups now
2. sending test issues to yourself
3. sending real issues manually when you post on X
4. supporting multiple future subletters without rebuilding the system

Do not start with automated campaign generation. First make one signup path, one template, one test list, and one real send work end to end.

## Recommended Listmonk model for Feedfree

Use Listmonk in three layers:

1. public lists for broad subscriber-facing lanes
2. subscriber attributes for topic and subletter preferences
3. campaigns for each actual issue you send

This avoids list sprawl while keeping room for later segmentation.

### Lists

Create only a small number of lists at first.

Recommended starting lists:

1. `feedfree-main`
2. `feedfree-test`
3. `feedfree-internal`

Meaning:

- `feedfree-main`: the default public newsletter signup list
- `feedfree-test`: a private list containing only your own addresses for safe test sends
- `feedfree-internal`: optional private list for friends or early reviewers

Do not create one Listmonk list per subletter yet. Your topic inventory is too long, and a list-per-subletter model will become hard to manage quickly.

### Subscriber attributes

Use subscriber `attribs` to track the subletters a reader wants.

Suggested shape:

```json
{
	"subletters": ["ai-engineering", "social-media-marketing"],
	"frequency": "weekly",
	"source": "landing-page"
}
```

This is the right place to represent the topics in [docs/SUBLETTERS.md](c:/Code/feedless/docs/SUBLETTERS.md).

Suggested slug format:

- `ai-engineering`
- `open-source-intrigues`
- `social-media-marketing`
- `early-founder-bootstrapping`

Keep these slugs stable. They become the contract between the website, Listmonk, and any later ingestion scripts.

## Best first launch shape

For the first live phase, do not expose every subletter as a separate public signup choice.

Use this rollout:

1. collect everyone into one public main list
2. optionally record selected interests as subscriber attributes
3. manually send one curated issue at a time
4. test demand before splitting sending by topic

That keeps the promise simple while you are still validating whether the X-driven article workflow produces enough quality material.

## Test send workflow

This should be your first real milestone.

### In Listmonk

1. Create the `feedfree-test` private list.
2. Add one or two of your own email addresses.
3. Create one base campaign template with header, footer, archive link, and unsubscribe link.
4. Create one draft campaign.
5. Send a test to yourself before every real send.

### What to inspect in a test send

Check:

1. subject line clarity
2. preheader text
3. mobile layout
4. link tracking behavior
5. sender name and reply-to behavior
6. unsubscribe footer
7. whether the issue still looks good in plain text mode

The test send is where you refine formatting. Do not use your first live subscribers as formatting QA.

## Recommended campaign structure

For your current stage, each issue should be assembled outside Listmonk and pasted or pushed in as Markdown or HTML.

Recommended issue structure:

1. short intro
2. three to ten curated links
3. one or two sentence summary per link
4. optional why-it-matters note
5. short footer describing the lane or subletter

That format matches the current plan of posting interesting articles on X and then turning those into a sendable digest.

## Template strategy

Use one base template first, not one template per subletter.

Put the shared brand elements in the template:

1. logo or wordmark
2. top intro block
3. body wrapper styles
4. archive link
5. unsubscribe block

For Feedfree, the footer should point to the site-managed preferences page, not directly to the one-shot unsubscribe handler. After you sync subscribers, Listmonk subscriber `attribs` include the Supabase `unsubscribe_token`, so the template link can be:

```html
<a href="https://feedfree.tech/subscribed?token={{ .Subscriber.Attribs.unsubscribe_token }}">Unsubscribe</a>
```

That gives readers one landing page where they can keep some topics, drop others, or unsubscribe from everything.

Put the changing editorial content in the campaign body.

Once the sends are stable, you can branch into:

1. one common template with lane-specific headings
2. a small number of distinct templates for very different newsletter styles

Do not build twelve templates before you have sent three real issues.

## How subletters should work initially

Treat the subletters in [docs/SUBLETTERS.md](c:/Code/feedless/docs/SUBLETTERS.md) as editorial lanes, not fully separate products yet.

Practical starting model:

1. one sender brand: Feedfree Digest
2. one default public signup list
3. one campaign can be tagged with a subletter slug such as `social-media-marketing`
4. later, filter sends to people whose `attribs.subletters` include that slug

This gives you room to test multiple themes without creating fragmented list operations too early.

## How a real manual send should work

Each time you decide an issue is worth sending:

1. gather the article set from your X microquery workflow
2. choose the primary lane or subletter
3. draft the issue body in Markdown
4. create a Listmonk campaign draft
5. attach the campaign to the correct target list
6. tag the campaign with the lane slug
7. send a test to `feedfree-test`
8. review formatting in inbox
9. send to the real audience when approved

This is enough to start building trust and habit with subscribers without any heavy automation.

## Suggested sequence from here

1. Confirm the sending domain and SMTP/provider setup in Listmonk.
2. Create `feedfree-main` and `feedfree-test`.
3. Keep the public signup pointed at one main public list.
4. Decide on canonical slugs for the subletters in [docs/SUBLETTERS.md](c:/Code/feedless/docs/SUBLETTERS.md).
5. Create one base campaign template.
6. Send one internal test issue end to end.
7. Only after that, decide whether to capture subletter interests on the site and push them into subscriber attributes.

## What not to do yet

Avoid these early mistakes:

1. one Listmonk list for every topic
2. full automation before manual sends work
3. multiple sender brands before you know what subscribers actually want
4. complex segmentation before you have enough subscriber volume to justify it

The system should stay manual and legible until the editorial workflow becomes consistent.

## Terminal test sends

The repo now includes a minimal terminal-driven test-send script:

- `npm run listmonk:test-send -- --name "AI Engineering Test" --subject "Feedfree Digest: AI Engineering Test" --body-file drafts/ai-test.md --to you@example.com`

Setup:

1. Copy [/.env.example](c:/Code/feedless/.env.example) to `.env.local`.
2. Fill in `LISTMONK_URL`, `LISTMONK_USERNAME`, and `LISTMONK_PASSWORD` locally.
3. Keep `LISTMONK_TEST_LIST_NAME=Default list` unless you rename the private test list.
4. Set `LISTMONK_FROM_NAME=Feedfree Digest` so API-created campaigns send with a branded sender name.

The script:

1. resolves the target Listmonk list by name
2. creates a draft campaign through the API
3. sends a test message only to the emails you specify

This is the recommended first automation surface. Keep real audience sends manual until test sends are stable.

### Lane-based sends

The terminal sender now supports the current newsletter lanes:

- `ai-engineering`
- `open-source-intrigues`
- `crypto-investing`
- `security`
- `compliance`
- `early-founder-bootstrapping`
- `lead-generation`
- `seo`
- `cold-outreach-marketing`
- `social-media-marketing`

Example:

- `npm run listmonk:test-send -- --lane ai-engineering --name "AI test" --subject "Feedfree AI: Test" --body-file drafts/ai-test.md --to you@example.com`

When a lane is provided, the script can choose:

1. a branded sender name such as `Feedfree AI`
2. the target list name for that lane
3. default tags for that lane

The current implementation keeps those lane-to-list mappings inside the script so manual sends stay simple.

## Supabase sync

The repo now includes a dry-run subscriber sync command:

- `npm run listmonk:sync-subscribers --`

This command:

1. reads confirmed, non-unsubscribed signups from Supabase
2. maps `topics` to supported newsletter lanes
3. maps those lanes to Listmonk lists
4. prepares creates or updates for matching Listmonk subscribers
5. mirrors raw `topics` and `source` into Listmonk subscriber attributes

Use `--apply` only after reviewing the dry run output:

- `npm run listmonk:sync-subscribers -- --apply`

For now, treat Supabase as the source of truth and Listmonk as the delivery mirror.