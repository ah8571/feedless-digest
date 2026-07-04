# Listmonk Internal Reference

## What Listmonk is

Listmonk is a self-hosted newsletter and mailing list manager built around PostgreSQL.

For Feedfree Digest, it should be treated as:

- the subscriber system
- the campaign engine
- the sending control panel
- the archive and tracking layer

It is not the public website and it is not the content discovery engine.

## Core Concepts

### Subscriber

A subscriber is a person identified by email and name.

Subscribers can also have `attribs`, which is a JSON object. This is one of the most important features for Feedfree.

Example uses for subscriber attributes:

- followed authors
- preferred topics
- minimum word count
- language preference
- digest frequency
- custom flags like `wants_ai` or `wants_security`

### List

A list is a group of subscribers.

Lists can be:

- `public` or `private`
- `single` opt-in or `double` opt-in
- `active` or `archived`

For Feedfree, lists are likely better for broad newsletter lanes such as:

- AI engineering
- security
- SEO
- developer tooling

Fine-grained personalization is better handled with subscriber attributes than by creating too many lists.

### Campaign

A campaign is a newsletter issue sent to one or more lists.

Campaigns can be:

- created as drafts
- previewed
- test-sent
- scheduled
- started
- paused
- cancelled
- archived publicly

### Template

A template is a reusable email layout. Templates can contain header/footer structure and dynamic template expressions.

### Transactional Message

Listmonk also supports transactional messages via API, but for Feedfree the main value is campaign sending rather than app notifications.

## Main Capabilities

### Subscriber Management

Listmonk can:

- create subscribers
- update subscribers
- partially patch subscribers
- delete subscribers
- blocklist subscribers
- export subscriber data
- inspect bounce records per subscriber
- modify subscriber memberships across lists

Important detail:

- `PATCH` updates only provided fields
- `PUT` can replace the full subscriber record and can remove existing list memberships if fields are omitted

That means `PATCH` is safer for future preference updates.

### Public Signup Support

Listmonk supports public subscription endpoints.

Key endpoint:

- `POST /api/public/subscription`

This can accept JSON or form data and subscribe a person to public lists by list UUID.

This matters because later you may decide not to store signups in Supabase first. You could let Listmonk handle subscription directly.

### Lists

List APIs support:

- retrieving all lists
- retrieving public lists
- creating lists
- updating lists
- deleting lists

Useful list fields:

- `type`: `public` or `private`
- `optin`: `single` or `double`
- `status`: `active` or `archived`
- `tags`
- `description`

Recommended Feedfree pattern:

- use public lists for user-visible newsletter categories
- use private lists for internal workflows or editorial/testing groups

### Segmentation and Querying

This is one of Listmonk's strongest features.

Listmonk supports partial Postgres SQL expressions for querying subscribers.

Queryable fields include:

- `subscribers.email`
- `subscribers.name`
- `subscribers.status`
- `subscribers.attribs`
- `subscribers.created_at`
- `subscribers.updated_at`

This means you can build segments like:

- all readers who follow a specific author
- all readers with `minimum_word_count >= 1200`
- all readers interested in `security`
- all readers who clicked on previous AI campaigns

This is the feature that makes future custom newsletters realistic.

### Campaign APIs

Campaign API capabilities include:

- create campaign
- retrieve campaigns
- preview campaign
- test campaign
- update campaign
- change campaign status
- publish campaign to archive
- delete campaign
- read analytics

Important campaign fields:

- `name`
- `subject`
- `lists`
- `content_type`
- `body`
- `altbody`
- `template_id`
- `tags`
- `attribs`
- `send_at`

Supported content types include:

- `richtext`
- `html`
- `markdown`
- `plain`
- `visual`

This is important because Feedfree can generate issue drafts outside Listmonk and push them in programmatically.

### Templates and Dynamic Content

Listmonk templates support:

- reusable campaign templates
- transactional templates
- Go template expressions
- Sprig utility functions
- tracked links
- tracking pixels
- unsubscribe URLs
- hosted message URLs

Important template expressions include:

- subscriber fields like `{{ .Subscriber.Email }}`
- campaign fields like `{{ .Campaign.Subject }}`
- functions like `{{ TrackLink "https://example.com" }}`
- `{{ UnsubscribeURL }}`
- `{{ MessageURL }}`

This means templates can be simple and branded while the issue body stays programmatic.

### Archives

Listmonk supports a public campaign archive.

You can:

- enable a global public archive
- mark specific campaigns to publish publicly
- set archive slugs
- attach archive metadata

This may be useful, but note the overlap with your public website archive. Feedfree should decide whether:

- the canonical archive lives on the marketing site, or
- Listmonk hosts the canonical archive and the site links to it

My bias is to keep the canonical archive on the main site for better branding and long-term control.

### Bounce Handling and Deliverability Support

Listmonk supports:

- POP3 bounce mailbox processing
- webhook-based bounce recording
- provider-specific webhooks
- blocklisting actions
- complaint handling
- bounce export

For SES specifically, Listmonk supports webhook handling via:

- `/webhooks/service/ses`

Recommended SES bounce settings from the docs:

- soft bounce count `2`, action `None`
- hard bounce count `1`, action `Blocklist`
- complaint count `1`, action `Blocklist`

This is a major reason to use Listmonk instead of just storing emails yourself.

### Analytics and Tracking

Listmonk can track:

- views
- clicks
- links
- bounces

Campaign analytics endpoints exist for:

- views over time
- link click counts
- bounce records

This is useful for understanding which newsletter categories or links actually perform.

### Integrating With External Systems

Listmonk supports two integration patterns:

- use the APIs
- interact directly with the database

For Feedfree, the correct default is the API, not direct DB writes.

Use cases:

- import readers from your landing-page signup flow
- create campaigns from your editorial queue
- update reader preferences
- move readers into lists or segments

### Messengers

Listmonk is not limited to email. It supports custom messengers that accept JSON payloads and send to other channels like:

- SMS
- FCM
- third-party messaging services

This is not important for MVP, but it does show the product is flexible.

### What Listmonk Does Not Do

Listmonk does not:

- find great articles for you
- judge content quality for you
- crawl social platforms for you
- replace your public website
- automatically solve inbox placement without proper DNS and sender reputation

You still need:

- a sourcing pipeline
- editorial decisions
- an SMTP provider like SES or Resend
- SPF, DKIM, and DMARC

### How Feedfree Should Likely Use It

Near term:

- manage subscribers
- handle double opt-in
- send test campaigns
- run newsletter sends
- process bounces and unsubscribes

Later:

- store preference attributes
- create audience segments from those attributes
- support custom newsletter variants
- automate campaign creation through the API

### Suggested MVP Data Model

Use lists for broad categories and attributes for personalization.

Example attributes:

```json
{
  "topics": ["ai-engineering", "security"],
  "authors": ["author-a", "author-b"],
  "minimum_word_count": 1200,
  "frequency": "weekly",
  "language": "en"
}
```

### Best Features For Feedfree

If we narrow Listmonk to the features that matter most for this project, the most important are:

- public signup endpoints
- list and subscriber APIs
- JSON subscriber attributes
- SQL-like segmentation
- markdown and HTML campaign support
- campaign creation via API
- public archive support
- bounce and complaint handling
- SES webhook support

### Practical Conclusion

Listmonk makes sense for Feedfree because it provides the real newsletter operating layer: subscriber state, opt-in flow, campaign control, archives, analytics, and bounce handling.

That is the difference between having a list of emails and having a functioning newsletter system.