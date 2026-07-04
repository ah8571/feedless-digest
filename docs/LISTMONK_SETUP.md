# Listmonk Setup Notes
## Why it fits
Listmonk is a strong fit if the goal is a cheap, self-hosted newsletter engine with API access and no per-email software fee. It is best treated as the sending and list-management layer, not the public website.
## Core architecture
- Cloudflare-hosted frontend for marketing pages and archives.
- Listmonk on a VPS for subscribers, campaigns, templates, and sends.
- PostgreSQL as the required database.
- SES or Resend as the outbound email provider.
- Your sourcing pipeline pushes approved issue content into Listmonk through the API.
## Minimum requirements
- One VPS
- Docker and Docker Compose, or the standalone binary
- PostgreSQL 12+
- A sending provider
- A subdomain such as `news.yourdomain.com` or `mail.yourdomain.com`
## Recommended install path
Use Docker Compose. It is the simplest operational path.

High-level flow:
1. Download the official `docker-compose.yml`.
2. Configure environment variables or mount a `config.toml`.
3. Start Listmonk and Postgres with `docker compose up -d`.
4. Visit port `9000` and create the super admin.
5. Configure SMTP in the admin UI.
6. Create lists, templates, and API users.
## Important config points
- Listmonk can be configured by `config.toml` or `LISTMONK_*` environment variables.
- Admin APIs live under `/api/*`.
- Public subscription and tracking routes must be exposed.
- Media uploads can be stored with Docker volumes or bind mounts.
- Some VPS hosts block SMTP ports, so verify that early.
## API relevance for Feedfree Digest
Listmonk has REST-like APIs for:
- subscribers
- lists
- import
- campaigns
- media
- templates
- transactional messages

That is the key reason it is viable for your workflow. You can generate an issue externally, then push campaign content into Listmonk instead of composing everything manually in the UI.
## Likely workflow
1. Your crawler or editorial queue selects issue items.
2. A small script assembles the issue body in Markdown or HTML.
3. Your script uses Listmonk's API to create or update a campaign.
4. You review the draft in Listmonk.
5. You send when ready.
## What you personally have to manage
- VPS uptime
- Docker updates
- Postgres backups
- SMTP credentials
- reverse proxy and SSL
- bounce webhook setup

This is manageable, but it is still real ops work.
## Best first implementation
- Start with one VPS.
- Use Docker Compose.
- Use SES later for lowest cost, or Resend first for easier setup.
- Keep the public site completely separate.
- Use the API only after manual sending works once end to end.
## Practical recommendation
If your priority is saving money through self-hosting and keeping strong API control, Listmonk is the best candidate so far. The main tradeoff is that you are accepting more infrastructure responsibility than you would with Keila Cloud.