# Dockerfile pour Monorepo Turborepo avec pnpm - Corrigé

# =======================================
# 1. Base: Image de base avec Node.js et pnpm/turbo
# =======================================
FROM node:20-alpine AS base
RUN npm i -g turbo pnpm
WORKDIR /app

# =======================================
# 2. Pruner: Crée une version minimale du repo
# =======================================
FROM base AS pruner
COPY . .
RUN turbo prune --scope=@stats-insee/web --docker

# =======================================
# 3. Installer: Installe toutes les dépendances
# =======================================
FROM base AS installer
# Installer les outils de build Python
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers python3-dev

# Copier les fichiers de dépendances depuis la version "prunée"
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .

# Installer les dépendances Node.js
RUN pnpm install --frozen-lockfile

# Copier les scripts Python depuis le contexte original (Ta Solution 3)
COPY --from=pruner /app/scripts/ ./scripts/
# Installer les dépendances Python
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# =======================================
# 4. Builder: Compile l'application Next.js
# =======================================
FROM base AS builder
# Copier les dépendances Node et Python installées
COPY --from=installer /app/ .
# Copier le code source "pruné"
COPY --from=pruner /app/out/full/ .

# Lancer le build pour l'application 'web'
ENV NODE_ENV=production
RUN turbo run build --scope=@stats-insee/web

# =======================================
# 5. Runner: Image finale de production
# =======================================
FROM node:20-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Installer uniquement le runtime Python
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

# Corriger la syntaxe ENV (Ton Bonus)
ENV PORT=3000
ENV NODE_ENV=production

# Lancer l'application
CMD ["node", "server.js"]
