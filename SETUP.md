# Setup and Deployment Guide
**Student Thrift Hub - Peer-to-Peer Student Marketplace**

**Document Version:** 1.0  
**Date:** May 11, 2026  
**Last Updated:** May 11, 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Variables](#environment-variables)
4. [Running in Development](#running-in-development)
5. [Building for Production](#building-for-production)
6. [Deployment Methods](#deployment-methods)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Database Setup](#database-setup)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Updates](#maintenance--updates)

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime | [nodejs.org](https://nodejs.org) |
| **Bun** | Latest | Package manager | `npm install -g bun` |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com) |
| **PostgreSQL** | 14+ | (Optional, for local DB) | [postgresql.org](https://www.postgresql.org/download/) |

### System Requirements

```
Operating System: Windows, macOS, or Linux
RAM: Minimum 4 GB (8 GB recommended)
Disk Space: 5 GB for node_modules + source code
Internet: Required for Supabase, GitHub, npm registry
```

### Accounts & Services

```
1. GitHub Account
   └─ For repository access and CI/CD

2. Supabase Account
   └─ Database, authentication, and storage
   └─ Create at: https://supabase.com

3. Vercel Account (for deployment)
   └─ https://vercel.com

4. Optional: SePay Account
   └─ Payment gateway integration
   └─ https://sepay.vn

5. Optional: Google Cloud / OpenRouter Account
   └─ For AI Gemini API access
```

### Check Your Environment

```bash
# Check Node.js
node --version
# Expected: v18.x.x or v20.x.x

# Check npm
npm --version
# Expected: 9.x.x or 10.x.x

# Check Bun
bun --version
# Expected: latest version

# Check Git
git --version
# Expected: git version 2.x.x
```

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/student-thrift-hub.git
cd student-thrift-hub

# OR clone via SSH (if SSH key configured)
git clone git@github.com:yourusername/student-thrift-hub.git
cd student-thrift-hub
```

### Step 2: Install Dependencies

```bash
# Using Bun (recommended)
bun install

# OR using npm
npm install

# OR using yarn
yarn install
```

**Output**:
```
✓ Installed 500+ dependencies
✓ Found 0 vulnerabilities
✓ Resolved in 45s
```

### Step 3: Create Environment Files

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

### Step 4: Configure Supabase

#### Option A: Use Public Supabase Project (Quick Setup)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project:
   - Name: `student-thrift-hub-dev`
   - Password: (generate strong password)
   - Region: (choose closest to you)

3. Get credentials from project settings:
   - API Settings → URL
   - API Settings → Publishable Key (anon key)

4. Add to `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

#### Option B: Use Local Supabase (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Output will show:
# API URL: http://localhost:54321
# Anon Key: eyJ...
# Service Key: eyJ...
```

Add to `.env.local`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Step 5: Initialize Database

```bash
# Using Supabase CLI
supabase db push

# OR manually run migrations in Supabase dashboard
# Navigate to SQL Editor and run migrations from supabase/migrations/
```

### Step 6: Verify Setup

```bash
# Check if environment variables are loaded
cat .env.local

# Test Supabase connection
npm run test

# Should pass without errors
```

---

## Environment Variables

### `.env.example` Template

Create `.env.example` in project root with all possible environment variables:

```bash
# Frontend Environment Variables
# These are prefixed with VITE_ and exposed to the browser

# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Application Name
VITE_APP_NAME=Student Thrift Hub
VITE_APP_URL=http://localhost:5173

# Backend Environment Variables
# These are server-only (not exposed to browser)

# Supabase Service Role (for Edge Functions)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Chat Integration
AI_API_KEY=your-openrouter-or-gemini-api-key
AI_API_URL=https://openrouter.ai/api/v1/chat/completions
AI_MODEL=google/gemini-2.5-flash

# SePay Payment Gateway Webhook
SEPAY_API_KEY=your-sepay-api-key-for-webhook-verification

# Lovable Cloud Auth
LOVABLE_API_KEY=your-lovable-api-key

# Development/Production Mode
NODE_ENV=development
DEBUG=false

# Database Connection (if using local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/stumarket

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Analytics (optional)
ANALYTICS_KEY=your-analytics-key
SENTRY_DSN=your-sentry-dsn

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_ADMIN_PANEL=true
ENABLE_DEPOSITS=true
```

### `.env.local` (Development)

```env
# Copy from .env.example and fill with your dev credentials

VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

AI_API_KEY=sk-...
SEPAY_API_KEY=...

NODE_ENV=development
```

### `.env.production` (Production)

```env
# Use production Supabase project

VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

AI_API_KEY=sk-prod-...
SEPAY_API_KEY=prod-...

NODE_ENV=production
SENTRY_DSN=https://...
```

### Environment Variable Security

```
⚠️  NEVER commit .env files to Git

Best Practices:
1. Add to .gitignore:
   ├── .env
   ├── .env.local
   ├── .env.*.local
   └── .env.production

2. Use .env.example for template

3. Store secrets in:
   ├── Vercel Environment Variables (for deployment)
   ├── GitHub Secrets (for CI/CD)
   ├── .env.local (development only)
   └── Vault service (for production)

4. Rotate keys regularly:
   ├── Monthly for API keys
   ├── Immediately if compromised
   └── After team member departure
```

---

## Running in Development

### Start Development Server

```bash
# Using Bun
bun run dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

**Output**:
```
  VITE v4.4.9  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access Application

Open browser and navigate to:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:54321 (if using local Supabase)

### Hot Module Replacement (HMR)

Changes are automatically reflected without page reload:
```
editing src/components/SearchBar.tsx...
✓ updated in 234ms
```

### Run Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Lint Code

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint --fix
```

### Monitor Performance

**Browser DevTools**:
1. Press `F12` or `Cmd+Option+I`
2. Go to Performance/Lighthouse tab
3. Click "Analyze page load"

**Console Errors**:
- Watch for TypeScript errors
- Check Network tab for failed requests
- Monitor React Profiler for performance bottlenecks

### Debug Tips

```typescript
// Add breakpoints in VS Code
// Set breakpoint in src/pages/Index.tsx and debug

// Enable source maps
// Already enabled in vite.config.ts

// Debug Supabase queries
import { supabase } from '@/integrations/supabase/client';
supabase.from('items').select('*').then(result => {
  console.log('Query result:', result);
});

// React Developer Tools
// Install React DevTools browser extension
```

---

## Building for Production

### Create Production Build

```bash
# Build with Vite
npm run build

# Build for development mode (with source maps)
npm run build:dev
```

**Output**:
```
vite v4.4.9 building for production...
✓ 1,234 modules transformed.
dist/index.html                    2.45 kB │ gzip: 0.95 kB
dist/assets/index-abc123.js     245.67 kB │ gzip: 78.90 kB
dist/assets/vendor-def456.js    156.23 kB │ gzip: 52.34 kB

✓ built in 34.56s
```

### Build Optimization

```bash
# Check bundle size
npm run build
du -sh dist/

# Analyze bundle composition
npm install -D rollup-plugin-visualizer
```

### Test Production Build Locally

```bash
# Build and preview production build
npm run build
npm run preview

# Visit http://localhost:4173
# Should work identically to development
```

### Build Output Structure

```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-xxx.js        # Main bundle
│   ├── vendor-yyy.js       # Vendor dependencies
│   ├── style-zzz.css       # Global styles
│   └── fonts/              # Web fonts
└── robots.txt              # SEO
```

---

## Deployment Methods

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Git integration
- Edge functions support
- Automatic HTTPS
- Preview deployments
- Free tier available

#### Step 1: Connect to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy project
vercel
```

#### Step 2: Configure via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import repository
3. Select `Next.js` or `Vite` framework preset
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY`
   - `SEPAY_API_KEY`

#### Step 3: Configure vercel.json

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "vite",
  "redirects": [
    {
      "source": "/admin(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

#### Step 4: Deploy

```bash
# Deploy to production
vercel --prod

# View deployment
vercel inspect

# Check logs
vercel logs
```

**Preview URL**: `https://student-thrift-hub.vercel.app`
**Production URL**: `https://stumarket.vn` (with custom domain)

---

### Option 2: Docker Containerization

#### Dockerfile

```dockerfile
# Multi-stage build

# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN npm install

# Copy source
COPY . .

# Build application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app

# Install serve to run static files
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### .dockerignore

```
node_modules/
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
dist/
coverage/
.vscode/
.idea/
```

#### Build and Run

```bash
# Build Docker image
docker build -t student-thrift-hub:latest .

# Run container
docker run -d \
  --name stumarket \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL=https://... \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=... \
  student-thrift-hub:latest

# View logs
docker logs -f stumarket

# Stop container
docker stop stumarket
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
      VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY}
      NODE_ENV: production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: always
```

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 3: VPS/Self-Hosted (DigitalOcean, Linode, AWS EC2)

#### Prerequisites

```bash
# SSH into VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install SSL (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
```

#### Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/student-thrift-hub.git
cd student-thrift-hub

# Install dependencies
npm install --production

# Build application
npm run build

# Create .env.production
nano .env.production
# (Add environment variables)
```

#### Configure Nginx

Create `/etc/nginx/sites-available/stumarket`:

```nginx
server {
    listen 80;
    server_name stumarket.vn www.stumarket.vn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stumarket.vn www.stumarket.vn;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/stumarket.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stumarket.vn/privkey.pem;

    # Root directory
    root /var/www/student-thrift-hub/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript;

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass https://your-api.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA routing (all requests to index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/stumarket /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

Get SSL Certificate:
```bash
certbot certonly --nginx -d stumarket.vn -d www.stumarket.vn
```

#### Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'stumarket',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/error.log',
      out_file: '/var/log/pm2/out.log'
    }
  ]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs stumarket
```

---

### Option 4: Netlify

#### Connect Netlify

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select Git provider and repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables
6. Deploy

#### netlify.toml Configuration

```toml
[build]
command = "npm run build"
publish = "dist"
functions = "supabase/functions"

[context.production]
environment = { NODE_ENV = "production" }

[context.preview]
environment = { NODE_ENV = "staging" }

[context.deploy-preview]
command = "npm run build"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[[headers]]
for = "/*"
[headers.values]
Cache-Control = "public, max-age=3600"

[[headers]]
for = "/assets/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  deploy-preview:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Preview)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          vercel --token $VERCEL_TOKEN --confirm

  deploy-production:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel (Production)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          vercel --token $VERCEL_TOKEN --prod --confirm

      - name: Send notification
        if: success()
        run: |
          echo "✅ Deployment to production successful!"
          echo "URL: https://stumarket.vn"

      - name: Notify on failure
        if: failure()
        run: |
          echo "❌ Deployment failed!"
```

### Setup GitHub Secrets

1. Go to Repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `VERCEL_TOKEN` - Vercel authentication token
   - `VITE_SUPABASE_URL` - Supabase URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key
   - `AI_API_KEY` - AI service key
   - `SEPAY_API_KEY` - SePay key

### Monitor Workflows

```bash
# View workflow runs
# GitHub → Actions tab

# Re-run failed workflow
# Click on workflow → Re-run all jobs

# Check logs
# Click on job → View logs
```

---

## Database Setup

### Supabase Project Setup

#### 1. Create Project

```bash
# Via Supabase Dashboard
# New Project → Choose Region (Asia Southeast recommended for Vietnam)
```

#### 2. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# OR manually in SQL Editor:
# Copy all SQL from supabase/migrations/*.sql
# Paste into Supabase SQL Editor
# Execute
```

#### 3. Seed Sample Data

```bash
# Trigger seed function via Edge Functions
# Or manually insert sample data

INSERT INTO profiles (id, name, email, university)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Nguyễn Văn Minh', 'minh@hust.edu.vn', 'ĐH Bách Khoa Hà Nội');
```

#### 4. Configure Storage Buckets

Create public bucket for images:

```bash
# Via Supabase Dashboard
# Storage → New bucket
# Name: items
# Privacy: Public
```

#### 5. Setup Row-Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policies (see DATABASE_DESIGN.md for full policies)
```

### Test Database Connection

```typescript
import { supabase } from '@/integrations/supabase/client';

// Test query
const { data, error } = await supabase.from('profiles').select('*').limit(1);

if (error) {
  console.error('Database error:', error);
} else {
  console.log('✓ Database connection successful!');
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Port 5173 Already in Use

```bash
# Solution 1: Kill process on port 5173
lsof -i :5173
kill -9 <PID>

# Solution 2: Use different port
npm run dev -- --port 3000

# Solution 3: Check what's using the port
netstat -ano | findstr :5173  # Windows
lsof -i :5173                  # macOS/Linux
```

#### Issue: Supabase Connection Failed

```
Error: Failed to connect to Supabase

Checklist:
1. Verify VITE_SUPABASE_URL is correct
2. Check VITE_SUPABASE_PUBLISHABLE_KEY is valid
3. Ensure .env.local is in root directory
4. Test with: npm run test
5. Check Supabase project is running
6. Verify network connectivity
```

#### Issue: Module Not Found

```
Error: Cannot find module '@/components/...'

Solution:
1. Check import path (should use @ alias)
2. Verify file exists
3. Clear node_modules: rm -rf node_modules && npm install
4. Restart dev server: npm run dev
```

#### Issue: Build Fails with TypeScript Errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix common issues
npm run lint --fix

# Clear cache and rebuild
rm -rf dist && npm run build
```

#### Issue: Environment Variables Not Loading

```bash
# Check .env.local exists
ls -la .env.local

# Verify format (no spaces around =)
VITE_SUPABASE_URL=https://...  ✓ Correct
VITE_SUPABASE_URL = https://... ✗ Wrong

# Restart dev server after changes
npm run dev
```

#### Issue: Vite HMR Not Working

```
Edit a file but changes don't appear

Solution:
1. Check browser console for errors
2. Verify vite.config.ts has hmr: { overlay: false }
3. Check firewall isn't blocking localhost connection
4. Try hard refresh (Ctrl+Shift+R)
5. Clear browser cache
```

### Debug Commands

```bash
# Check Node version
node --version

# Check npm/Bun packages
npm list
bun pm list

# Check for outdated packages
npm outdated

# Verify TypeScript
npx tsc --version

# Check environment
npm run env | grep VITE_

# Test Supabase connection
npm run test -- supabase.test.ts
```

---

## Maintenance & Updates

### Regular Maintenance

```bash
# Weekly
├─ npm audit
├─ Check for security updates
└─ Review error logs

# Monthly
├─ npm outdated
├─ Plan dependency updates
├─ Run npm audit fix
└─ Update documentation

# Quarterly
├─ Major version updates
├─ Performance audit
├─ Security scan
└─ Backup database
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update to latest minor/patch
npm update

# Update specific package
npm install react@latest

# Update all major versions
npm install -g npm-check-updates
ncu -u
npm install

# Update Supabase types after schema changes
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Performance Monitoring

```bash
# Check bundle size
npm run build
du -sh dist/

# Analyze bundle
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts and rebuild

# Check Core Web Vitals
# Use Vercel Analytics or Google PageSpeed Insights
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Review changes
git diff package-lock.json

# Deploy security updates immediately
git push origin main
```

### Backup & Recovery

```bash
# Backup source code
git push --all origin

# Backup database
supabase db dump -f backup.sql

# Verify backup
file backup.sql
wc -l backup.sql
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server on port 5173
npm run test             # Run tests
npm run test:watch      # Run tests in watch mode
npm run lint             # Check for linting errors
npm run lint --fix       # Fix linting errors

# Production
npm run build            # Build for production
npm run build:dev        # Build with dev mode
npm run preview          # Preview production build

# Deployment
npm install -g vercel
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production

# Database
supabase start           # Start local Supabase
supabase db push         # Push migrations
supabase gen types       # Generate TypeScript types

# Git
git clone <url>
git checkout -b feature/name
git commit -m "message"
git push origin feature/name
# Create Pull Request on GitHub
```

### Project Structure

```
student-thrift-hub/
├── src/
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   └── integrations/     # Third-party integrations
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
├── dist/                 # Production build (generated)
├── .env.example          # Environment template
├── .env.local            # Local environment (git-ignored)
├── package.json          # Dependencies & scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

---

## Getting Help

### Support Resources

| Resource | Purpose | Link |
|----------|---------|------|
| **Documentation** | API, architecture, database design | See docs/ folder |
| **GitHub Issues** | Report bugs, request features | GitHub → Issues |
| **Discord Community** | Chat with developers | Coming soon |
| **Email Support** | Contact team | support@stumarket.vn |

### Common Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [API.md](API.md) - API endpoints & examples
- [DATABASE_DESIGN.md](DATABASE_DESIGN.md) - Database schema
- [README.md](README.md) - Project overview

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 11, 2026 | DevOps Team | Initial comprehensive setup guide |

---

**Document Status**: Active | **Last Updated**: May 11, 2026 | **Next Review**: June 11, 2026
