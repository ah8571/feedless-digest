# Supabase Workspace

This folder keeps the project's Supabase-specific assets in one place.

## Structure

- `snippets/` holds SQL you can paste into the Supabase SQL editor.
- `functions/` holds per-function folders for Edge Function code or implementation notes.

## Current files

- `snippets/newsletter_signups.sql` creates the confirmation-aware signup table, including a dedicated `topics` array for multi-select sub-newsletter preferences, and the public insert policy.
- `snippets/confirmed_signups.sql` is the later export query for confirmed subscribers.
- `functions/create-signup/README.md` describes the idempotent public signup function.
- `functions/send-confirmation/README.md` describes the email-sending function.
- `functions/confirm-signup/README.md` describes the token confirmation function.
- `functions/unsubscribe/README.md` describes the unsubscribe function.

## Suggested workflow

1. Run `snippets/newsletter_signups.sql` in Supabase.
2. Build the `create-signup` Edge Function.
3. Build the `confirm-signup` Edge Function.
4. Test with your own email.
5. Later sync confirmed users into Listmonk.