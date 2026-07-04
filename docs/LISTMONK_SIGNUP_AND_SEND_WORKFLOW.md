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

- `NEXT_PUBLIC_LISTMONK_URL=https://mail.feedless.tech`
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