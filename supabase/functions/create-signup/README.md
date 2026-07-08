# Create Signup Edge Function

This function owns the public signup flow for Feedfree Digest.

## What it does

On `POST`, it:

1. normalizes the email and selected topics
2. looks up any existing `newsletter_signups` row by email
3. returns success immediately if the user is already confirmed
4. creates or refreshes a pending signup with a fresh confirmation token
5. sends the confirmation email through Resend

That makes the signup flow idempotent for launch traffic. If someone signs up twice before confirming, they get a fresh confirmation email instead of being stranded by the unique email constraint.

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONFIRM_BASE_URL`
- optional: `RESEND_FROM_EMAIL`

## Request body

```json
{
  "email": "reader@example.com",
  "topics": ["ai-engineering", "social-media-marketing"]
}
```

## Responses

- `200 { ok: true, status: "pending_confirmation" }`
- `200 { ok: true, status: "confirmed_existing" }`