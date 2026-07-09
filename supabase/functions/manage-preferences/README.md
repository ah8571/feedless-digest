# manage-preferences

Purpose: load and update newsletter topic preferences from a public tokenized link.

## Expected input

- JSON body with:
  - `action`: `load`, `save`, or `unsubscribe`
  - `token`: `unsubscribe_token` from `newsletter_signups`
  - `topics`: string array, only for `save`

## Expected environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Expected behavior

1. Look up a signup row by `unsubscribe_token`.
2. `load`: return the email, status, and selected topics.
3. `save`: update topics and keep the row `confirmed` when at least one topic remains.
4. `unsubscribe`: mark the row `unsubscribed` and stamp `unsubscribed_at`.