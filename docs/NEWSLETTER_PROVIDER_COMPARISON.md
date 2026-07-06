# Newsletter Provider Comparison

## Summary

For Feedfree Digest, the real question is not just which tool sends email. It is which tool best fits a workflow where the website is separate, sourcing is semi-manual, and sending should stay cheap early.

## Quick Recommendation

- Start with Keila if you want the cleanest balance of open source, newsletter-native UX, API support, and low operational friction.
- Start with Ghost if you want the newsletter and publishing system tightly bundled with membership features and a polished editorial experience.
- Start with Listmonk if cost control and raw self-hosted performance matter more than polish.

## Ghost

### Strengths

- Strongest publishing experience for a media product.
- Includes website, membership, newsletters, paid subscriptions, SEO, analytics, and integrations.
- Very polished editor and admin experience.
- Good fit if the newsletter itself becomes the main product surface.

### Weaknesses

- More platform than you need if the website already lives separately on Cloudflare.
- Self-hosting is heavier operationally than Listmonk and more opinionated.
- Managed pricing gets expensive quickly compared with lightweight alternatives.

### Pricing Shape

- Ghost(Pro) Starter: $15/month billed yearly for 1,000 members.
- Publisher: $29/month billed yearly for 1,000 members and more publication features.
- Business: $199/month billed yearly for 10,000 members.
- Self-hosted Ghost software is open source, but you still pay for VPS, storage, and email delivery.

### Best Fit

- Best if you want a full publication stack with content, members, and newsletter in one system.

## Keila

### Strengths

- Open source and newsletter-first.
- Supports visual editing, Markdown, MJML, plain text, segments, forms, analytics, API access, and double opt-in.
- Can use Keila Cloud or self-host.
- Supports bring-your-own email providers like SES, SMTP, Mailgun, Postmark, Sendgrid.
- Feels closer to the exact problem you are solving than Ghost.

### Weaknesses

- Smaller ecosystem than Ghost.
- Less known and less content/preset support around themes and growth workflows.
- Still another app to run if you self-host.

### Pricing Shape

- Keila Cloud XS: $9.50/month for 2,000 emails.
- S: $18.67/month for 5,000 emails.
- M: $37.34/month for 15,000 emails.
- L: $74.68/month for 50,000 emails.
- XL: $149.37/month for 100,000 emails.
- XXL: $299/month for 250,000 emails.
- Self-hosted Keila is open source; infra and delivery costs are separate.

### Best Fit

- Best if you want an open-source newsletter app with less overhead than Ghost and more newsletter-specific polish than Listmonk.

## Listmonk

### Strengths

- Free and open source.
- Very efficient and operationally lightweight.
- Strong list management, templating, analytics, API support, and multi-SMTP throughput.
- Excellent if you eventually want maximum sending control with SES.

### Weaknesses

- More utilitarian UI and less editorially polished than Ghost or Keila.
- Better as a sending/list engine than a complete publication product.
- Requires Postgres and a bit more comfort with infrastructure.

### Pricing Shape

- No software license fee.
- Costs come from your VPS, Postgres, storage, and email provider.
- Cheapest option if you are comfortable self-hosting.

### Best Fit

- Best if you want the lowest software cost and are comfortable assembling the rest of the stack yourself.

## Recommended Choice For Feedfree Digest

If the front end stays on Cloudflare and you want the newsletter engine separate, Keila is probably the best starting point.

Why:

- It matches your architecture more closely than Ghost.
- It is more publication-friendly out of the box than Listmonk.
- It gives you an easy starting point with cloud hosting, while preserving a self-hosted path later.
- It works cleanly with a future SES migration.

## Practical Path

- Fastest path: Keila Cloud plus Resend or Keila Cloud plus your own sending provider.
- Cheapest serious self-hosted path: Listmonk plus SES on a small VPS.
- Best all-in-one publication path: Ghost, but only if you want the site and newsletter tightly coupled.