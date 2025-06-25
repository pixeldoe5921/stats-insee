# 🐳 Docker Multi-stage pour Dashboard INSEE
# Optimisé pour production avec cache layers

# ===============================_
# 🏗️ STAGE 1: Dependencies (pour l'étage final)
# ===============================_
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json* ./
RUN npm ci --only=production && npm cache clean --force

# ===============================_
# 🏗️ STAGE 2: Builder (pour la compilation)
# ===============================_
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json* ./

# Installer TOUTES les dépendances, y compris devDependencies
RUN npm ci && npm cache clean --force

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# ===============================_
# 🚀 STAGE 3: Runner (Production)
# ===============================_
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier uniquement les dépendances de production depuis l'étage deps
COPY --from=deps /app/node_modules ./node_modules

# Installer Python et ses dépendances de production
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers python3-dev
COPY scripts/requirements.txt ./scripts/
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# Copier l'application compilée depuis l'étage builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.env.example ./
COPY --from=builder /app/supabase-setup.sql ./

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node healthcheck.js || exit 1

CMD ["node", "server.js"]
