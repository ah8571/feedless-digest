# Listmonk on DigitalOcean

Use a Droplet, not App Platform.

Why:
- cheaper for this workload
- easier Docker Compose setup
- simpler persistent Postgres volume handling
- easier reverse proxy and SMTP troubleshooting

## Recommended starter setup

- Droplet name: `feedless-digest`
- 1 Ubuntu Droplet
- 1 GB RAM is the minimum practical starting point
- Docker + Docker Compose
- Cloudflare DNS record like `mail.feedless.tech`
- SES or Resend later for outbound mail

## Files in this repo

- `infra/listmonk/docker-compose.yml`
- `infra/listmonk/.env.example`

## Setup steps

1. Create an Ubuntu Droplet in DigitalOcean.
2. Point a subdomain like `mail.feedless.tech` to the Droplet IP in Cloudflare.
3. SSH into the server.
4. Install Docker and Docker Compose.
5. Copy `infra/listmonk/` to the server.
6. Rename `.env.example` to `.env` and change the passwords.
7. Run `docker compose up -d`.
8. Put nginx or Caddy in front of port `9000`.
9. Add SSL on the proxy.
10. Visit the subdomain and confirm login works.
11. Configure SMTP in Listmonk admin.
12. Send a test campaign.

## Notes

- The compose file binds Listmonk to `127.0.0.1:9000`, so it expects a reverse proxy.
- Keep Postgres on the same box initially for simplicity.
- Do not expose Postgres publicly.
- Back up the Postgres volume before upgrades.

## First milestone

The first success condition is simple: log into Listmonk, create one list, add one test subscriber, and send one test email.