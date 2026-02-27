# HostelGH Production Deployment Guide

Complete guide for deploying the HostelGH platform to production across all components (Backend API, Web Frontend, Mobile).

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Backend API Deployment](#backend-api-deployment)
4. [Web Frontend Deployment](#web-frontend-deployment)
5. [Android App Deployment](#android-app-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`, `npm run test:e2e`)
- [ ] No console errors or warnings in builds
- [ ] Linting passes (`npm run lint`)
- [ ] Code review completed
- [ ] Security audit passed
- [ ] No sensitive data in source code
- [ ] Environment variables documented

### Data & Database
- [ ] Database migrations applied
- [ ] No seeded test data in production
- [ ] Backup strategy in place
- [ ] Database connection tested
- [ ] Indexes optimized for query performance

### Security
- [ ] JWT secrets are strong (>32 characters)
- [ ] CORS configured for prod domain only
- [ ] Rate limiting enabled
- [ ] SSL/TLS certificate ready
- [ ] API keys rotated
- [ ] Firewall rules configured
- [ ] No default credentials remain

### Infrastructure
- [ ] Server capacity meets demand
- [ ] CDN configured for static assets
- [ ] Email service (Nodemailer) configured
- [ ] Payment gateway (Paystack) ready
- [ ] Firebase project configured
- [ ] Redis configured for caching
- [ ] Logging & monitoring setup
- [ ] Backup & disaster recovery plan

### Documentation
- [ ] Deployment runbook created
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide prepared
- [ ] Team trained on deployment

---

## Environment Configuration

### Backend API (.env)

```bash
# Server
NODE_ENV=production
ENVIRONMENT=production
API_PORT=3000
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/hostelgh_prod
PRISMA_BINARY_CACHE_DIR=/tmp/prisma-cache

# Redis
REDIS_URL=redis://:password@prod-redis-host:6379

# JWT
JWT_SECRET=generate-strong-secret-min-32-chars-here
JWT_REFRESH_SECRET=generate-another-strong-secret-min-32-chars
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=noreply@yourdomain.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME=HostelGH

# Payment (Paystack)
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-service-account@...

# Storage (Cloudinary)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend
FRONTEND_URL=https://yourdomain.com
WEB_APP_URL=https://yourdomain.com

# Pagination
DEFAULT_PAGE_LIMIT=20
MAX_PAGE_LIMIT=100
```

### Web Frontend (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Android App (BuildConfig)

Update `apps/android/app/build.gradle`:

```gradle
buildTypes {
    release {
        buildConfigField "String", "BASE_URL", '"https://yourdomain.com/api/"'
        buildConfigField "String", "FIREBASE_PROJECT_ID", '"your-firebase-project"'
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## Backend API Deployment

### Option 1: Docker (Recommended)

#### Build Docker Image

```bash
# Build image
docker build -f apps/api/Dockerfile -t hostelgh-api:latest .

# Tag for registry
docker tag hostelgh-api:latest your-registry/hostelgh-api:latest

# Push to registry
docker push your-registry/hostelgh-api:latest
```

#### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    image: your-registry/hostelgh-api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
    depends_on:
      - postgres
      - redis
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=hostelgh_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

#### Deploy with Docker

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Check logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Option 2: Traditional Server (VPS/Cloud)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux
- Node.js 18+ installed
- PostgreSQL 13+ installed
- Redis 6+ installed
- Nginx installed
- SSL certificate (Let's Encrypt)

#### Setup

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Clone repository
git clone https://github.com/yourusername/HostelGH.git
cd HostelGH

# Install dependencies
npm install

# Create .env file
nano .env  # Add production environment variables

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start "npm run start:prod" --name "hostelgh-api"
pm2 save
pm2 startup
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/hostelgh`:

```nginx
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # Proxy Configuration
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/hostelgh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Web Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or push to GitHub and auto-deploy
git push origin master
```

**Environment Variables in Vercel Dashboard:**
- `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com`
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase key
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID

### Option 2: Docker

```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

Build and deploy:
```bash
docker build -f apps/web/Dockerfile -t hostelgh-web:latest .
docker push your-registry/hostelgh-web:latest
```

### Option 3: Netlify

```bash
# Create netlify.toml in web folder
cat > web/netlify.toml << EOF
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/:splat"
  status = 200
EOF

# Deploy
netlify deploy --prod
```

---

## Android App Deployment

### Build Release APK

```bash
cd apps/android

# Build signed release APK
./gradlew bundleRelease

# Sign APK (if not auto-signed)
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.jks \
  app/build/outputs/bundle/release/app-release.aab my-key-alias
```

### Upload to Google Play Store

1. **Prepare**
   - Create Google Play Developer account ($25 one-time)
   - Create new app
   - Fill store listing
   - Add privacy policy
   - Add app screenshots

2. **Upload Bundle**
   - Go to Release → Production
   - Click "Create new release"
   - Upload `app/build/outputs/bundle/release/app-release.aab`
   - Add release notes
   - Review and confirm

3. **Internal Testing**
   - Release to internal testing first
   - Test on multiple devices
   - Collect feedback before public release

### Versioning

Update in `apps/android/app/build.gradle`:

```gradle
android {
    compileSdk 35
    
    defaultConfig {
        applicationId "com.hostelgh"
        minSdk 24
        targetSdk 35
        versionCode 1  // Increment on each release
        versionName "1.0.0"  // Follow semantic versioning
    }
}
```

---

## Monitoring & Maintenance

### Uptime Monitoring

Use UptimeRobot or Pingdom:

```
- Monitor: https://api.yourdomain.com/health
- Interval: 5 minutes
- Alert on down
```

### Logging

#### Backend - Winston Logger

Already configured in `apps/api/src/common/logger/`

View logs:
```bash
# Docker
docker-compose logs -f api

# PM2
pm2 logs hostelgh-api

# File-based
tail -f logs/application.log
```

#### Frontend - Sentry Integration

Add to `web/lib/api.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_ENV,
  tracesSampleRate: 0.1,
});
```

### Performance Monitoring

#### Backend - Response Times

```bash
# Check average response time
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourdomain.com/health

# Database query performance
EXPLAIN ANALYZE SELECT * FROM bookings WHERE status = 'PENDING_APPROVAL';
```

#### Web - Core Web Vitals

Use PageSpeed Insights: https://pagespeed.web.dev/

Target metrics:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Database Maintenance

```bash
# Weekly backup
pg_dump -U postgres hostelgh_prod > backup-$(date +%Y%m%d).sql

# Vacuum & analyze
vacuumdb -U postgres hostelgh_prod
analyzedb -U postgres hostelgh_prod

# Check for slow queries
SELECT query, calls, total_time FROM pg_stat_statements
ORDER BY total_time DESC LIMIT 10;
```

### Security Updates

```bash
# Update dependencies
npm audit
npm audit fix
npm update

# Update system packages
sudo apt update && sudo apt upgrade -y

# Rotate secrets
# Update JWT_SECRET, PAYSTACK keys, Firebase keys quarterly
```

---

## Troubleshooting

### Backend Issues

**High Memory Usage**
```bash
# Check memory by process
docker stats hostelgh-api

# Solution: Restart or increase heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run start:prod
```

**Database Connection Timeout**
```bash
# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Increase in .env
DATABASE_POOL_MAX=20
```

**Redis Connection Failed**
```bash
# Test Redis connection
redis-cli PING

# Restart Redis
docker-compose restart redis

# Check Redis memory
redis-cli INFO memory
```

### Web Issues

**Slow Page Load**
- Check bundle size: `npm run build` → analyze
- Enable code splitting in next.config.ts
- Enable image optimization

**Build Fails on Deployment**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Android Issues

**APK Installation Fails**
- Ensure minSdkVersion matches device Android version
- Check signature matches signed release

**API Connection Issues**
- Verify `BASE_URL` in BuildConfig
- Check firewall rules allow port 443
- Test with curl: `curl https://api.yourdomain.com/health`

---

## Rollback Procedure

### If Deployment Fails

```bash
# Backend - Docker
docker-compose -f docker-compose.prod.yml pull previous-image-tag
docker-compose -f docker-compose.prod.yml up -d api

# Backend - PM2
pm2 list
pm2 restart hostelgh-api

# Web - Vercel
vercel rollback  # Automatically reverts to previous deployment

# Android
- Google Play Store → Release → Manage releases
- Click previous version → "Release to production"
```

---

## Post-Deployment

1. **Smoke Testing**
   - Test login flow
   - Test booking creation
   - Test payment (test mode)
   - Check admin dashboard

2. **Performance Baseline**
   - Record page load times
   - Record API response times
   - Establish monitoring alerts

3. **Communication**
   - Notify users of new release
   - Update status page
   - Document changes in release notes

4. **Schedule**
   - Post-deployment support on-call
   - Monitor for 24 hours
   - Review logs and metrics

---

## Support & Resources

- **Documentation**: See `TESTING_COMPREHENSIVE.md`
- **GitHub Issues**: Report bugs and request features
- **Email**: Support contact for users
- **Monitoring Dashboard**: Internal team access
