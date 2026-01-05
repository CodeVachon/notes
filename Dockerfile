# syntax=docker/dockerfile:1

# Build stage with Bun
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Migration image - includes drizzle-kit for database migrations
FROM oven/bun:1-alpine AS migrator
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY drizzle.config.ts ./
COPY src/db ./src/db

CMD ["bun", "run", "db:migrate"]

# Production image using Node.js Alpine (Next.js standalone requires Node)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
