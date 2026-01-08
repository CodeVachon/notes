# Production Deployment Examples

This directory contains example configuration files for deploying the Notes application with Docker and nginx.

## Files

- `docker-compose.production.yml` - Production Docker Compose configuration
- `nginx.conf` - Nginx reverse proxy configuration with SSE support

## Server-Sent Events (SSE) Configuration

The application uses Server-Sent Events for real-time cross-tab/browser synchronization. This requires specific nginx configuration to work properly:

### Key nginx settings for SSE (`/api/sync` endpoint):

```nginx
proxy_buffering off;          # Disable response buffering
proxy_cache off;              # Disable caching
proxy_set_header Connection '';  # Allow keep-alive
chunked_transfer_encoding off;   # SSE uses its own format
proxy_read_timeout 86400s;    # Long timeout for persistent connections
gzip off;                     # Disable compression (can cause buffering)
```

The application also sends the `X-Accel-Buffering: no` header to disable nginx buffering per-request.

## Quick Start

1. Copy the example environment file and configure it:

```bash
cp .env.example .env
# Edit .env with your values
```

2. Create a `.env` file with required variables:

```env
# Database
POSTGRES_USER=notes_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=notes_db

# Application
BETTER_AUTH_SECRET=generate_with_bunx_better_auth_cli_secret
BETTER_AUTH_URL=https://your-domain.com
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
ALLOWED_GITHUB_USERNAME=your_github_username

# Optional port overrides
HTTP_PORT=80
```

3. Start the services:

```bash
docker compose -f docker-compose.production.yml up -d
```

4. Run database migrations (first time only):

```bash
docker compose -f docker-compose.production.yml exec app bun run db:migrate
```

## SSL/HTTPS Setup

For production, you should enable HTTPS:

1. Obtain SSL certificates (e.g., via Let's Encrypt)

2. Place certificates in an `ssl/` directory:
   - `ssl/fullchain.pem`
   - `ssl/privkey.pem`

3. Uncomment the HTTPS sections in both `nginx.conf` and `docker-compose.production.yml`

4. Update `BETTER_AUTH_URL` in your `.env` to use `https://`

## Health Checks

- **Nginx**: `GET /health` returns `200 OK`
- **App**: Internal health check on port 3000
- **PostgreSQL**: `pg_isready` command

## Troubleshooting

### SSE connections dropping

If real-time sync stops working:

1. Check nginx error logs: `docker compose logs nginx`
2. Verify the `/api/sync` location block is being matched
3. Ensure `proxy_read_timeout` is longer than the app's 30-second ping interval
4. Check if any upstream proxy/load balancer is also buffering

### Database connection issues

1. Ensure PostgreSQL is healthy: `docker compose ps`
2. Check app logs: `docker compose logs app`
3. Verify `DATABASE_URL` is correctly formed

### Migrations not applied

Run migrations manually:

```bash
docker compose -f docker-compose.production.yml exec app bun run db:migrate
```
