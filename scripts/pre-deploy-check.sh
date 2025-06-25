#!/bin/bash

# 🚀 Pre-deployment validation script
# Vérifie que le projet est prêt pour le déploiement

set -e

echo "🔍 === PRE-DEPLOYMENT CHECKS ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📋 1. Environment variables check..."
if [ ! -f ".env.local" ]; then
    print_warning "No .env.local found - creating template"
    cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_SUPABASE_URL=your_url_here" > .env.local
fi

echo "📦 2. Dependencies check..."
pnpm install --frozen-lockfile
print_status $? "Dependencies installed"

echo "🔧 3. TypeScript type checking..."
pnpm run type-check
print_status $? "TypeScript validation passed"

echo "📐 4. ESLint validation..."
pnpm run lint
print_status $? "ESLint validation passed"

echo "🏗️  5. Build test..."
pnpm run build
print_status $? "Build successful"

echo "🧪 6. Unit tests..."
if command -v pnpm test >/dev/null 2>&1; then
    pnpm run test --run
    print_status $? "Unit tests passed"
else
    print_warning "No unit tests configured"
fi

echo "🗄️  7. Supabase validation..."
if command -v supabase >/dev/null 2>&1; then
    node scripts/supabase-validate.js
    print_status $? "Supabase validation passed"
else
    print_warning "Supabase CLI not installed"
fi

echo "🎉 All pre-deployment checks passed!"
echo "🚀 Ready for deployment!"