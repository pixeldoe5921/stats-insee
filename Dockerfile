# -------- Étape 1 : Base avec turbo + pnpm + git --------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache git
RUN npm i -g turbo pnpm

# -------- Étape 2 : Prune du monorepo --------
FROM base AS pruner
COPY . .
RUN turbo prune --docker --scope @stats-insee/web

# -------- Étape 3 : Installation JS + Python + dépendances natives --------
FROM base AS installer

# Dépendances nécessaires à canvas & autres libs Python natives
RUN apk add --no-cache 
  g++ 
  make 
  python3 py3-pip gcc musl-dev linux-headers 
  python3-dev pkgconfig pixman-dev cairo-dev 
  pango-dev libjpeg-turbo-dev giflib-dev

# Copier uniquement les fichiers issus du prune
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
COPY --from=pruner /app/scripts/ ./scripts/

# Installer les dépendances JS
RUN pnpm install --frozen-lockfile

# Installer les dépendances Python
RUN pip3 install --no-cache-dir --break-system-packages -r scripts/requirements.txt

# -------- Étape 4 : Build ciblé avec turbo --------
FROM base AS builder
WORKDIR /app

# Copier tout depuis l’étape précédente
COPY --from=installer /app /app
COPY --from=installer /usr/lib/python3.12/site-packages /usr/lib/python3.12/site-packages

# Ajouter les fichiers "full" pour la build complète
COPY --from=pruner /app/out/full/ .

# Build l'app web uniquement
ENV NODE_ENV=production
RUN turbo run build --scope=@stats-insee/web

# -------- Étape 5 : Runner final (léger) --------
FROM node:20-alpine AS runner
WORKDIR /app

# Créer utilisateur non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copier les fichiers de build
COPY --from=builder /app .

# Port exposé (adapter si nécessaire)
EXPOSE 3000

# Commande de démarrage (Next.js ou custom)
CMD ["pnpm", "start"]