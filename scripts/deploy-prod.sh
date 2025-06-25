#!/bin/bash

# 🚀 Production deployment script
# Deploy to Vercel production environment

set -e

echo "🏭 === PRODUCTION DEPLOYMENT ==="

# Confirmation prompt
read -p "⚠️  Are you sure you want to deploy to PRODUCTION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Run pre-deployment checks
./scripts/pre-deploy-check.sh

# Check git status
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Uncommitted changes detected. Commit your changes first."
    exit 1
fi

# Deploy to Vercel production
echo "📤 Deploying to production..."
vercel --prod --confirm

echo "🎉 Production deployment complete!"
echo "🔗 Check your deployment at: https://stats-insee.vercel.app"