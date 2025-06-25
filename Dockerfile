# Dockerfile pour Monorepo Turborepo avec pnpm - Version Finale

# =======================================
# 1. Base: Image de base avec Node.js
# =======================================
FROM node:20-alpine AS base
WORKDIR /app

# =======================================
# 2. Pruner: Crée une version minimale du repo
# =======================================
FROM base AS pruner
# Installer turbo pour la commande prune
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=@stats-insee/web --docker

# =======================================
# 3. Installer: Installe toutes les dépendances
# =======================================
FROM base AS installer
# Installer pnpm et les outils de build Python
RUN npm i -g pnpm
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers python3-dev

# Copier les fichiers de dépendances depuis la version "prunée"
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .

# Installer les dépendances Node.js
RUN pnpm install --frozen-lockfile

# Installer les dépendances Python
COPY --from=pruner /app/out/full/scripts/requirements.txt ./scripts/
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# =======================================
# 4. Builder: Compile l'application Next.js
# =======================================
FROM base AS builder
# Installer pnpm et turbo
RUN npm i -g pnpm turbo

# Copier les dépendances Node et Python installées
COPY --from=installer /app/ .
# Copier le code source "pruné"
COPY --from=pruner /app/out/full/ .

# Lancer le build pour l'application 'web'
RUN turbo run build --scope=@stats-insee/web

# =======================================
# 5. Runner: Image finale de production
# =======================================
FROM node:20-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Installer uniquement le runtime Python, pas les outils de build
RUN apk add --no-cache python3

# Copier les dépendances Python pré-installées depuis l'étage 'installer'
COPY --from=installer /usr/lib/python3.12/site-packages /usr/lib/python3.12/site-packages
# Copier les scripts Python
COPY --from=builder /app/scripts ./scripts

# Copier l'application compilée en mode standalone
COPY --from=builder /app/apps/web/.next/standalone ./
# Copier les assets statiques
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# Lancer l'application
CMD ["node", "server.js"]
