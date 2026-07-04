# confirm-signup

Purpose: confirm a pending signup when the reader clicks the email link.

## Expected input

- query param: `token`

## Expected environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Expected behavior

1. Read the `token` from the request.
2. Find a matching row where `status = 'pending'`.
3. Update the row to:
   - `status = 'confirmed'`
   - `confirmed_at = now()`
   - `updated_at = now()`
4. Optionally clear `confirm_token` after success.
5. Return a simple success or invalid-link response.