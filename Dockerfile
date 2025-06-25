# 🐳 Docker Multi-stage pour Dashboard INSEE
# Optimisé pour production avec cache layers

# ================================
# 🏗️ STAGE 1: Dependencies
# ================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY scripts/requirements.txt ./scripts/

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Install Python for scraping scripts
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --no-cache-dir -r scripts/requirements.txt

# ================================
# 🏗️ STAGE 2: Builder
# ================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# ================================
# 🚀 STAGE 3: Runner (Production)
# ================================
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install Python for runtime scripts
RUN apk add --no-cache python3 py3-pip

# Copy Python requirements and install
COPY scripts/requirements.txt ./scripts/
RUN pip3 install --no-cache-dir -r scripts/requirements.txt

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

# Copy environment files
COPY --from=builder /app/.env.example ./
COPY --from=builder /app/supabase-setup.sql ./

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]