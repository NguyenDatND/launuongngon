# ─── Stage 1: Install all deps (including dev) ───────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client then compile; combine to reduce layers
RUN npx prisma generate && npm run build

# ─── Stage 3: Production deps only ───────────────────────────────────────────
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
# Regenerate Prisma Client against production node_modules
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# ─── Stage 4: Runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder   --chown=nestjs:nodejs /app/dist         ./dist
COPY --from=builder   --chown=nestjs:nodejs /app/prisma       ./prisma
COPY --from=builder                         /app/package.json  ./

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nestjs
EXPOSE 3001
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
