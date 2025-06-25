#!/bin/bash

# 🚀 Staging deployment script
# Deploy to Vercel staging environment

set -e

echo "🎭 === STAGING DEPLOYMENT ==="

# Run pre-deployment checks
./scripts/pre-deploy-check.sh

# Deploy to Vercel staging
echo "📤 Deploying to staging..."
vercel --prod=false --confirm

echo "🎉 Staging deployment complete!"
echo "🔗 Check your deployment at: https://stats-insee-git-main-username.vercel.app"