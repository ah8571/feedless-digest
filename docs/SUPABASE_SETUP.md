# Supabase Signup Setup

Use Supabase only for signup capture for now. Listmonk can remain a later step.

## 1. Create the table

```sql
create table public.newsletter_signups (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text not null default 'landing-page',
  created_at timestamptz not null default now()
);
```

## 2. Enable row level security

```sql
alter table public.newsletter_signups enable row level security;
```

## 3. Allow public inserts only

```sql
create policy "public can insert newsletter signups"
on public.newsletter_signups
for insert
to anon
with check (true);
```

Do not create a public select policy.

## 4. Add Cloudflare Pages environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Test

After redeploying, submit your own email on the landing page and confirm the row appears in `newsletter_signups`.

## 6. Test email later

Supabase stores the email. It does not send the newsletter by itself. For test sending, connect Listmonk or Resend next.