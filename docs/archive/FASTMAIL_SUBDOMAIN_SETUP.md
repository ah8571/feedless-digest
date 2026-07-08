# Fastmail Subdomain Setup

Goal: set up a real inbox on a Fastmail-hosted subdomain while Cloudflare remains the DNS authority for `feedfree.tech`.

Recommended use:

- `confirm.feedfree.tech` can stay the Resend sending domain for confirmation mail.
- `feedfree.tech` or `reply.feedfree.tech` can be the real human inbox on Fastmail.
- `news.feedfree.tech` can later be the newsletter sending domain for Listmonk.

If you want the simplest setup tonight, use Fastmail for one real inbox and keep Resend for sending.

## Architecture

- Cloudflare: authoritative DNS for `feedfree.tech`
- Fastmail: mailbox hosting
- Resend: outbound confirmation email
- Listmonk later: outbound campaign email

Important rule:

If Cloudflare has the nameservers for `feedfree.tech`, all MX, TXT, CNAME, SPF, DKIM, and DMARC records must be entered in Cloudflare even if Fastmail is the mailbox provider.

## Simplest recommendation

Start with one real inbox only:

- mailbox: `hello@feedfree.tech` or `hello@reply.feedfree.tech`
- confirmation sender: `hello@confirm.feedfree.tech` through Resend
- newsletter sender later: `digest@news.feedfree.tech`
- reply-to for confirmation and newsletter: the Fastmail-hosted inbox

This avoids needing a separate real mailbox on every sending subdomain.

## If you specifically want a Fastmail subdomain inbox

Example target:

- `hello@reply.feedfree.tech`

That is usually cleaner than trying to host the inbox on `confirm.feedfree.tech`, since `confirm` is already acting as a sending reputation subdomain.

## Setup steps

1. Log into Fastmail Admin.
2. Go to domain settings and add a custom domain or subdomain.
3. Add either:
   - `feedfree.tech` if you want root-domain inboxes like `hello@feedfree.tech`, or
   - `reply.feedfree.tech` if you want a dedicated reply inbox subdomain.
4. Let Fastmail generate the required DNS records.
5. In Cloudflare, open the `feedfree.tech` DNS zone.
6. Add the exact Fastmail records there.
7. Wait for Fastmail verification to pass.
8. Create the mailbox or alias you want inside Fastmail.
9. Update sender configuration so Resend or Listmonk uses that inbox as `Reply-To` when needed.

## Records to expect from Fastmail

Fastmail typically asks for some combination of:

- MX records for inbound mail delivery
- TXT record for SPF
- CNAME records for DKIM
- optional TXT or CNAME records for verification
- optional autodiscover or service records

Use the exact values Fastmail provides. Do not guess them and do not copy old IONOS values.

## Cloudflare entry rules

- MX records: `DNS only`
- TXT records: `DNS only`
- CNAME records used for DKIM or mail verification: `DNS only`
- A record for website or server routing: only if the subdomain should point to a real host

Do not proxy mail-related records through Cloudflare.

## Good starting options

### Option 1: easiest

- Fastmail inbox: `hello@feedfree.tech`
- Resend sender: `hello@confirm.feedfree.tech`
- Reply-To: `hello@feedfree.tech`

Why:

- only one real mailbox to manage
- keeps sending reputation separate from your human inbox
- easier to explain and debug

### Option 2: cleaner separation

- Fastmail inbox: `hello@reply.feedfree.tech`
- Resend sender: `hello@confirm.feedfree.tech`
- Listmonk sender later: `digest@news.feedfree.tech`
- Reply-To: `hello@reply.feedfree.tech`

Why:

- keeps human replies and sending domains more isolated
- gives room to expand later

## What not to do

- Do not create working mail records only in IONOS if Cloudflare controls DNS.
- Do not reuse the old IONOS MX, SPF, or DKIM values.
- Do not point `confirm.feedfree.tech` at a server IP unless you want that subdomain to host a site.
- Do not create multiple mailboxes tonight unless you truly need them.

## Suggested tonight plan

1. Keep `confirm.feedfree.tech` in Resend as already verified.
2. Choose one real inbox strategy:
   - `hello@feedfree.tech`, or
   - `hello@reply.feedfree.tech`
3. Add the Fastmail domain or subdomain.
4. Copy Fastmail's DNS records into Cloudflare.
5. Wait for verification.
6. Send one confirmation email from Resend.
7. Make the reply-to address the Fastmail inbox once it exists.

## After Fastmail is live

- update the confirmation sender flow to include a `reply_to` address if desired
- decide whether Listmonk campaigns should use `digest@news.feedfree.tech`
- later add unsubscribe and support language that references the real reply inbox

## Decision shortcut

If you want the lowest-friction path tonight, do this:

- keep Resend on `confirm.feedfree.tech`
- set up Fastmail for `feedfree.tech`
- create `hello@feedfree.tech`
- use that as the reply inbox

That is the simplest version that still keeps your sending architecture clean.