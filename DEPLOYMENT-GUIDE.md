# 🚀 Deployment Guide - INSEE Economic Dashboard

> Step-by-step production deployment guide for Vercel + Supabase + CI/CD

## 📋 Prerequisites

### Required Accounts & Tools
- [x] **GitHub Account** with repository access
- [x] **Vercel Account** connected to GitHub
- [x] **Supabase Account** with project created
- [x] **Node.js 18+** and **pnpm 9+** installed locally
- [x] **Git** configured with SSH keys

### Local Environment Setup
```bash
# Verify versions
node --version  # v18.0.0+
pnpm --version  # v9.0.0+
git --version   # v2.0.0+

# Install dependencies
pnpm install --frozen-lockfile
```

## 🗄️ Phase 1: Supabase Database Setup

### 1.1 Create Supabase Project
```bash
# 1. Go to https://supabase.com/dashboard
# 2. Click "New Project"
# 3. Choose organization and region
# 4. Set database password (save it!)
# 5. Wait for project initialization (~2 minutes)
```

### 1.2 Configure Database Schema
```bash
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy content from: supabase/migrations/001_initial_schema.sql
# 3. Execute the SQL script
# 4. Verify tables created in Table Editor
```

### 1.3 Seed Database (Optional)
```bash
# 1. Go to SQL Editor again
# 2. Copy content from: supabase/seed/seed.sql
# 3. Execute to populate with sample data
# 4. Verify data in Table Editor
```

### 1.4 Get Supabase Credentials
```bash
# 1. Go to Settings > API
# 2. Copy these values:
#    - Project URL: https://your-project.supabase.co
#    - Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
#    - Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Phase 2: Local Development Setup

### 2.1 Environment Configuration
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 3. Add OpenAI key for AI features (optional)
OPENAI_API_KEY=sk-your-openai-key-here
```

### 2.2 Local Development Test
```bash
# 1. Install dependencies
pnpm install

# 2. Run development server
pnpm dev

# 3. Test in browser
open http://localhost:3000

# 4. Verify database connection
# Should see sample data in dashboard
```

### 2.3 Pre-deployment Validation
```bash
# Run all checks
pnpm run predeploy

# Individual checks
pnpm run type-check     # TypeScript validation
pnpm run lint           # ESLint (max-warnings: 0)
pnpm run build          # Production build test
pnpm run test           # Unit tests
```

## 🚀 Phase 3: Vercel Deployment

### 3.1 Connect GitHub Repository
```bash
# 1. Go to https://vercel.com/dashboard
# 2. Click "Import Project"
# 3. Select your GitHub repository
# 4. Choose "Other" framework preset
# 5. Configure build settings:
#    - Build Command: pnpm run build
#    - Output Directory: apps/web/.next
#    - Install Command: pnpm install
```

### 3.2 Configure Environment Variables
```bash
# In Vercel Project Settings > Environment Variables
# Add these for all environments (Production, Preview, Development):

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key

# Optional: Analytics and monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 3.3 Deploy to Production
```bash
# Option A: Deploy via Dashboard
# 1. Click "Deploy" in Vercel dashboard
# 2. Wait for build completion
# 3. Test deployment URL

# Option B: Deploy via CLI
vercel login
vercel --prod
```

### 3.4 Configure Custom Domain (Optional)
```bash
# 1. Go to Project Settings > Domains
# 2. Add your domain: stats-insee.yourdomain.com
# 3. Update DNS records as instructed
# 4. Wait for SSL certificate provisioning
```

## ⚙️ Phase 4: CI/CD Pipeline Setup

### 4.1 GitHub Secrets Configuration
```bash
# Go to GitHub Repository > Settings > Secrets and Variables > Actions
# Add these Repository Secrets:

VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SLACK_WEBHOOK=your-slack-webhook-url (optional)
```

### 4.2 Get Vercel Credentials
```bash
# Install Vercel CLI
npm i -g vercel

# Login and get credentials
vercel login
vercel link

# Get ORG and PROJECT IDs
vercel env ls
# Or check: vercel project ls
```

### 4.3 Test CI/CD Pipeline
```bash
# 1. Create feature branch
git checkout -b test/ci-cd-setup

# 2. Make a small change
echo "# CI/CD Test" >> TEST.md

# 3. Commit and push
git add .
git commit -m "test: verify ci/cd pipeline"
git push origin test/ci-cd-setup

# 4. Create Pull Request
# 5. Verify GitHub Actions run automatically
# 6. Check Vercel preview deployment
```

## 🔍 Phase 5: Monitoring & Alerts Setup

### 5.1 Sentry Error Tracking (Optional)
```bash
# 1. Create Sentry account: https://sentry.io
# 2. Create new project (Next.js)
# 3. Add to environment variables:
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### 5.2 Vercel Analytics
```bash
# 1. Go to Vercel Project > Analytics
# 2. Enable Analytics
# 3. Add environment variable (if needed):
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### 5.3 Health Check Setup
```bash
# Health endpoint available at:
# https://your-app.vercel.app/api/health

# Monitor with uptime services:
# - UptimeRobot
# - Pingdom
# - StatusCake
```

## 🧪 Phase 6: Testing Production Deployment

### 6.1 Functional Tests
```bash
# 1. Dashboard loads correctly
# 2. Economic data displays
# 3. Charts render properly
# 4. AI chat responds
# 5. Export functions work
# 6. Mobile responsive
# 7. Dark mode toggle
```

### 6.2 Performance Tests
```bash
# Run Lighthouse audit
npm i -g lighthouse
lighthouse https://your-app.vercel.app --output=html

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

### 6.3 Security Tests
```bash
# Check security headers
curl -I https://your-app.vercel.app

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: origin-when-cross-origin
```

## 🔄 Phase 7: Ongoing Maintenance

### 7.1 Automated Updates
```bash
# Dependabot configuration (already included)
# - Automatic dependency updates
# - Security patches
# - Weekly schedule

# GitHub Actions automated:
# - Tests on every PR
# - Security scans
# - Deploy to staging/production
```

### 7.2 Backup Strategy
```bash
# Supabase automatic backups:
# - Daily automatic backups
# - Point-in-time recovery
# - Download backup files

# Manual backup command:
supabase db dump --file=backup-$(date +%Y%m%d).sql
```

### 7.3 Monitoring Checklist
- [ ] **Uptime**: 99.9%+ availability
- [ ] **Performance**: <2s page load
- [ ] **Errors**: <0.1% error rate
- [ ] **Database**: <100ms query time
- [ ] **Security**: No vulnerabilities

## 📞 Troubleshooting

### Common Issues

#### Build Errors
```bash
# TypeScript errors
pnpm run type-check
# Fix errors before deployment

# ESLint errors
pnpm run lint --fix
# Address remaining warnings
```

#### Environment Variables
```bash
# Missing variables
# Check Vercel dashboard for all required env vars
# Redeploy after adding missing variables
```

#### Database Connection
```bash
# Test Supabase connection
node scripts/supabase-validate.js
# Check network policies in Supabase dashboard
```

#### Deployment Failures
```bash
# Check Vercel build logs
# Verify environment variables
# Ensure build command is correct
# Check for memory/timeout issues
```

### Support Resources
- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **GitHub Actions**: https://docs.github.com/actions

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Local development working
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Build succeeds locally

### Production Setup
- [ ] Vercel project configured
- [ ] Custom domain configured (if applicable)
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Database connection verified

### CI/CD Pipeline
- [ ] GitHub secrets configured
- [ ] Actions workflow enabled
- [ ] Pull request automation working
- [ ] Deployment automation verified

### Monitoring
- [ ] Health endpoint responding
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring setup

### Security
- [ ] Security headers configured
- [ ] SSL certificate active
- [ ] Environment variables secured
- [ ] Database RLS enabled

**🎉 Congratulations! Your INSEE Economic Dashboard is now live in production!**

---

*Last updated: December 2024*