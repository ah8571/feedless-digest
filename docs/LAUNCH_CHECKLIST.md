# Feedfree Launch Checklist

This is the shortest path to finish deliverability basics and run a consistent early editorial workflow.

## 1. Add DMARC in Cloudflare

Current state:

- SPF passes
- DKIM passes
- DMARC fails because there is no DMARC record

Add a TXT record in Cloudflare for the sending domain family.

Recommended first record:

- Type: `TXT`
- Name: `_dmarc`
- Target: `v=DMARC1; p=none; pct=100`

If you already have a real inbox for reports, use:

- Type: `TXT`
- Name: `_dmarc`
- Target: `v=DMARC1; p=none; pct=100; rua=mailto:hello@feedfree.tech`

Notes:

- Start with `p=none` first so you get alignment without risking accidental rejection.
- Once mail is stable, move to `p=quarantine`, then later `p=reject`.
- If you want a subdomain-specific policy later, add `_dmarc.socials.feedfree.tech`, but the simplest first fix is the root `_dmarc.feedfree.tech` record.
- All mail DNS records in Cloudflare should stay `DNS only`.

After adding it:

1. wait a few minutes for propagation
2. send one fresh Listmonk test
3. open Gmail `Show original`
4. confirm DMARC changes from `FAIL` to `PASS`

## 2. Daily editorial workflow

Do not automate issue creation yet. Use a manual queue with light tooling.

### Morning workflow

1. Run one X search for the lane you want.
2. Save the raw response.
3. Pick 3 to 7 strong candidates.
4. Draft one short issue in markdown.
5. Send a test email.
6. If it looks good, send the live issue.

### Useful command pattern

Example discovery run:

```powershell
npm run x:recent-search -- "your query here"
```

Save raw JSON for review:

```powershell
npm run x:recent-search -- --raw --out lists/x/latest-ai-query.json "your query here"
```

Test send a draft:

```powershell
npm run listmonk:test-send -- --lane ai-engineering --name "AI test" --subject "Feedfree AI: Test" --body-file drafts/ai-test.md
```

### Minimum queue fields

Use Airtable or Google Sheets with these columns:

- `lane`
- `source`
- `url`
- `author`
- `hook`
- `date found`
- `status`
- `issue date`
- `notes`

Recommended statuses:

- `new`
- `reviewing`
- `approved`
- `sent`
- `rejected`

## 3. First issue assembly rule

Keep the first live issues simple.

Recommended structure:

1. one short intro line
2. three to five links
3. one or two sentences per link
4. optional closing note

Do not over-design this. The real goal is to learn whether X posts convert into subscribers.

## 4. After first live sends

Once you have a few real sends:

1. review which lanes get clicks or replies
2. tighten the X queries
3. add one more source only after the X workflow feels stable
4. revisit Gmail sender-row unsubscribe after DMARC is in place