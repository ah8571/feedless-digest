select
  email,
  source,
  confirmed_at,
  created_at
from public.newsletter_signups
where status = 'confirmed'
  and unsubscribed_at is null
order by confirmed_at desc nulls last, created_at desc;