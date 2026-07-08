# unsubscribe

Purpose: mark a confirmed or pending signup as unsubscribed when a reader clicks an unsubscribe link.

## Expected input

- query param: `token`

## Expected environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional: `PUBLIC_SITE_URL`

## Expected behavior

1. Read the `token` from the request.
2. Find a matching row by `unsubscribe_token`.
3. Update the row to `status = 'unsubscribed'` and stamp `unsubscribed_at`.
4. Redirect back to the site with a simple success or invalid-link status.