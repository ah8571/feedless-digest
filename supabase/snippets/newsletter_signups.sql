create table if not exists public.newsletter_signups (
  id bigint generated always as identity primary key,
  email text not null unique,
  status text not null default 'pending',
  confirm_token text unique,
  source text not null default 'landing-page',
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_signups_status_check
    check (status in ('pending', 'confirmed', 'unsubscribed'))
);

alter table public.newsletter_signups enable row level security;

drop policy if exists "public can insert pending signups" on public.newsletter_signups;

create policy "public can insert pending signups"
on public.newsletter_signups
for insert
to anon
with check (status = 'pending');

create index if not exists newsletter_signups_status_idx
on public.newsletter_signups (status);

create index if not exists newsletter_signups_confirm_token_idx
on public.newsletter_signups (confirm_token);