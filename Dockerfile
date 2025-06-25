# Dockerfile pour Monorepo Turborepo avec pnpm

# =======================================
# 1. Base: Installe les dépendances globales
# =======================================
FROM node:20-alpine AS base

# Installer pnpm, turbo, et les outils de build Python
RUN npm i -g turbo pnpm
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers python3-dev

# =======================================
# 2. Pruner: Crée une version minimale du repo
# =======================================
FROM base AS pruner
WORKDIR /app

COPY . .
# Crée un sous-ensemble minimal du monorepo pour l'app 'web'
RUN turbo prune --scope=@stats-insee/web --docker

# =======================================
# 3. Installer: Installe les dépendances
# =======================================
FROM base AS installer
WORKDIR /app

# Copier les package.json et le lockfile depuis la version "prunée"
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Installer les dépendances Node.js
RUN pnpm install --frozen-lockfile

# Installer les dépendances Python
COPY --from=pruner /app/scripts/ ./scripts/
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# =======================================
# 4. Builder: Compile l'application
# =======================================
FROM base AS builder
WORKDIR /app

# Copier les dépendances installées
COPY --from=installer /app/ .

# Copier le code source "pruné"
COPY --from=pruner /app/out/full/ .

# Lancer le build pour l'app 'web'
RUN turbo run build --scope=web

# =======================================
# 5. Runner: Image finale de production
# =======================================
FROM node:20-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Installer uniquement les dépendances Python de production
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers python3-dev
COPY --from=installer /app/scripts/requirements.txt ./scripts/
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# Copier le code de l'application compilée (standalone output)
COPY --from=builder /app/apps/web/.next/standalone ./
# Copier les assets statiques
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# Copier les scripts Python
COPY --from=installer /app/scripts ./scripts

# Définir l'utilisateur non-root
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

# Lancer l'application
CMD ["node", "server.js"]