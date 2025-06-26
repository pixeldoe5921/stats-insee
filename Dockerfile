# -------- Étape 1 : base commune avec turbo & pnpm --------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache git
RUN npm i -g turbo pnpm

# -------- Étape 2 : prune le monorepo pour ne garder que les apps utiles --------
FROM base AS pruner
COPY . .
RUN turbo prune -- --scope=@stats-insee/web --scope=@stats-insee/scripts --docker

# -------- Étape 3 : installer les dépendances Python et JS --------
FROM base AS installer

# Dépendances système pour Python + canvas
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers     python3-dev pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

WORKDIR /app

# Copier uniquement ce que le prune a gardé
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
COPY --from=pruner /app/scripts/ ./scripts/

# Installer les dépendances JS (avec cache lockfile)
RUN pnpm install --frozen-lockfile

# Installer les dépendances Python
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# -------- Étape 4 : construire l'app avec turbo --------
FROM base AS builder
WORKDIR /app

# Copier tout ce qui a été installé
COPY --from=installer /app /app
COPY --from=installer /usr/lib/python3.12/site-packages /usr/lib/python3.12/site-packages

# Prune full pour le build final (si nécessaire)
COPY --from=pruner /app/out/full/ .

# Build ciblé pour l'app web
ENV NODE_ENV=production
RUN turbo run build -- --scope=@stats-insee/web

# -------- Étape 5 : runner final pour exécution --------
FROM node:20-alpine AS runner
WORKDIR /app

# Ajout user non-root (bonne pratique)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copier le build final
COPY --from=builder /app .

# Exposer si nécessaire
EXPOSE 3000

# Démarrage (à adapter selon framework)
CMD ["node", "apps/web/server.js"]
# ou pour Next.js : CMD ["pnpm", "start"] si tu utilises un custom server