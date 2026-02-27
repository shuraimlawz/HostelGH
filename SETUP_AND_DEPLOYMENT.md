# HostelGH Complete Project Setup & Deployment Guide

**Latest Update:** February 24, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Project Status](#project-status)
2. [Directory Structure](#directory-structure)
3. [Local Development Setup](#local-development-setup)
4. [Building & Testing](#building--testing)
5. [Deployment Guides](#deployment-guides)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)
8. [Team Handoff](#team-handoff)

---

## 🎯 Project Status

### **Completed (100%)**

✅ **Backend (NestJS)**
- REST API with 25+ endpoints
- Database schema with Prisma
- Authentication with JWT
- Payment processing (Paystack)
- File uploads (Cloudinary)
- Email notifications
- Admin audit logging

✅ **Frontend (Next.js Web)**
- Public hostel browsing
- Multi-step booking stepper
- Owner dashboard
- Admin panel
- Payment integration
- SEO optimization
- Responsive design

✅ **Mobile (React Native)**
- Project scaffolding
- Navigation structure
- Authentication flows
- API client setup
- State management
- 3 core screens (explore, bookings, account)

✅ **Database**
- PostgreSQL schema (Prisma)
- 9 migrations completed
- All Ghana-specific fields
- Seed data ready

✅ **Documentation**
- Architecture guides
- API reference
- Deployment instructions
- Team setup guides
- Environment configuration

### **In Progress (Phase 2 - Q3 2026)**

⏳ Mobile app store submission  
⏳ Advanced filtering & search  
⏳ Chat/messaging system  
⏳ Mobile Money integration  
⏳ Analytics dashboards  

---

## 📁 Directory Structure

```
HostelGH/
│
├── apps/
│   ├── api/                           # NestJS Backend
│   │   ├── src/
│   │   │   ├── app.module.ts          # Root module
│   │   │   ├── main.ts                # Entry point
│   │   │   ├── common/                # Shared utilities
│   │   │   ├── modules/               # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── hostels/
│   │   │   │   ├── rooms/
│   │   │   │   ├── bookings/
│   │   │   │   ├── payments/
│   │   │   │   ├── email/
│   │   │   │   ├── upload/
│   │   │   │   ├── admin/
│   │   │   │   └── webhooks/
│   │   │   ├── config/                # Configuration
│   │   │   └── prisma/                # Database
│   │   ├── test/                      # End-to-end tests
│   │   ├── Dockerfile                 # Containerization
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                           # Next.js Frontend
│   │   ├── app/                       # Page routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (public)/              # Public routes
│   │   │   ├── (admin)/               # Admin routes
│   │   │   ├── (owner)/               # Owner routes
│   │   │   └── (tenant)/              # Tenant routes
│   │   ├── components/                # Reusable components
│   │   ├── lib/                       # Utilities & hooks
│   │   ├── public/                    # Static assets
│   │   ├── Dockerfile
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                        # React Native + Expo
│       ├── app/                       # Screen files
│       │   ├── (auth)/                # Auth stack
│       │   └── (app)/                 # Main app tabs
│       ├── lib/                       # Utilities
│       │   ├── api/                   # API client
│       │   ├── stores/                # State management
│       │   ├── types/                 # TypeScript types
│       │   └── hooks/                 # Custom hooks
│       ├── components/                # Reusable components
│       ├── assets/                    # Images & icons
│       ├── app.json                   # Expo config
│       ├── package.json
│       └── tsconfig.json
│
├── prisma/                            # Database
│   ├── schema.prisma                  # Data models
│   ├── seed.ts                        # Seed script
│   └── migrations/                    # Migration files
│
├── docker/                            # DevOps
│   ├── postgres/                      # PostgreSQL setup
│   └── nginx/                         # Nginx config
│
├── docs/                              # Documentation
│   ├── MOBILE_DEVELOPMENT_GUIDE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── E2E_TESTING_GUIDE.md
│   ├── FILE_CHANGES_REFERENCE.md
│   ├── DELIVERABLES.md
│   ├── ENV_GUIDE.md
│   └── START_HERE.md
│
├── docker-compose.yml                 # Local dev environment
├── package.json                       # Root monorepo config
├── tsconfig.json                      # Root TypeScript config
└── README.md                          # Project overview
```

---

## 💻 Local Development Setup

### **Prerequisites**

```bash
# Required tools
Node.js 18+           # npm install -g n
npm 9+                # npm install -g npm
PostgreSQL 14+        # or use Docker
Git                   # Version control
Docker (optional)     # For PostgreSQL container
```

### **Step 1: Clone & Install**

```bash
# Clone repository
git clone https://github.com/shuraimlawz/HostelGH.git
cd HostelGH

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspace=api --workspace=web --workspace=mobile
```

### **Step 2: Setup Database**

**Option A: Using Supabase (Recommended)**

```bash
# Create Supabase project (https://supabase.com)
# Copy connection string from project settings

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@host:5432/hostelgh
JWT_SECRET=your_secure_secret_here_min_32_chars
EOF

# Run migrations
cd apps/api
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

**Option B: Using Local Docker PostgreSQL**

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Wait 5 seconds for container to start
sleep 5

# Create .env
cat > .env << EOF
DATABASE_URL=postgresql://hostelgh:password@localhost:5432/hostelgh
EOF

# Run migrations
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

### **Step 3: Configure Environment**

```bash
# Backend
cd apps/api
cp .env.example .env
# Edit .env with your settings

# Web
cd ../web
cp .env.example .env.local
# Edit .env.local with your settings

# Mobile
cd ../mobile
cp .env.example .env
# Edit .env with your settings
```

### **Step 4: Start Development Servers**

**Terminal 1 - Backend API:**
```bash
cd apps/api
npm run dev
# API runs on http://localhost:3000
```

**Terminal 2 - Web Frontend:**
```bash
cd apps/web
npm run dev
# Web runs on http://localhost:3001
```

**Terminal 3 - Mobile (Optional):**
```bash
cd apps/mobile
npm run dev
# Scan QR code with Expo Go or press 'i'/''
```

### **Step 5: Verify Setup**

```bash
# Check API is running
curl http://localhost:3000/api/health

# Check web loads
open http://localhost:3001

# Check database migrations
cd apps/api
npx prisma studio    # Opens database viewer on http://localhost:5555
```

---

## 🧪 Build & Testing

### **Backend**

```bash
cd apps/api

# Lint code
npm run lint

# Type check
npm run type-check

# Run tests
npm run test

# Run e2e tests involving real database
npm run test:e2e

# Build for production
npm run build
```

### **Frontend**

```bash
cd apps/web

# Lint
npm run lint

# Type check  
npm run type-check

# Build
npm run build

# Start built version
npm start
```

### **Mobile (Android)**

The Expo-based mobile app has been replaced by a native Android project under `apps/android`. Use Android Studio or Gradle commands to build and run.

```bash
# open in Android Studio
studio apps/android

# or from command line (Android native project):
cd apps/android
./gradlew assembleDebug    # build debug APK
./gradlew installDebug     # compile & install on connected device/emulator

# For production / Play Store use a signed release build
# generate a keystore if you don't have one:
keytool -genkey -v -keystore release.keystore -alias hostelgh_key \
  -keyalg RSA -keysize 2048 -validity 10000
# put the keystore in apps/android and add to gradle.properties:
# RELEASE_KEYSTORE_PASSWORD=yourPassword
# RELEASE_KEY_PASSWORD=yourPassword
# RELEASE_KEY_ALIAS=hostelgh_key
# RELEASE_STORE_FILE=release.keystore

# now build a signed artifact:
./gradlew assembleRelease   # APK in app/build/outputs/apk/release
./gradlew bundleRelease     # AAB in app/build/outputs/bundle/release
```
Development flow is standard Android engineering; the previous `apps/mobile` directory has been removed.

### **Running E2E Tests**

```bash
cd apps/web

# Ensure backend is running: npm run dev (in apps/api)

# Run end-to-end tests
npm run test:e2e

# Watch mode
npm run test:e2e -- --watch
```

---

## 🚀 Deployment Guides

### **Backend API - Render.com**

**Pre-requisites:**
- GitHub account with repo access
- Render account (render.com)

**Steps:**

1. **Create PostgreSQL Database**
   ```
   Render Dashboard → New → Database → PostgreSQL
   - Name: hostelgh-db
   - Region: Frankfurt (for Ghana users)
   ```

2. **Create Web Service**
   ```
   Render Dashboard → New → Web Service
   - Connect GitHub repo
   - Select: apps/api
   - Build command: npm install && npm run build
   - Start command: npm run start:prod
   - Environment variables: (see ENV_GUIDE.md)
   ```

3. **Configure Environment**
   ```
   Environment Variables section:
   - NODE_ENV: production
   - DATABASE_URL: (from PostgreSQL database)
   - JWT_SECRET: (generate random)
   - PAYSTACK_SECRET_KEY: (get from Paystack)
   - ... (see ENV_GUIDE.md for full list)
   ```

4. **Run Migrations**
   ```
   In Render dashboard → Run migrations via shell
   
   npx prisma migrate deploy
   npx prisma db seed  # Optional
   ```

5. **Deploy**
   - Push to master branch
   - Render auto-deploys
   - Check live logs

**API URL:** `https://hostelgh-api.onrender.com/api`

### **Frontend - Vercel**

**Pre-requisites:**
- Vercel account (vercel.com)

**Steps:**

1. **Connect GitHub**
   ```
   Vercel Dashboard → New Project → Import Git Repo
   ```

2. **Configure Build**
   ```
   Root Directory: web
   Build Command: npm run build
   Output Directory: .next
   ```

3. **Environment Variables**
   ```
   Settings → Environment Variables
   - NEXT_PUBLIC_API_URL: https://hostelgh-api.onrender.com/api
   - NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: (if using)
   ```

4. **Deploy**
   - Auto-deploys on push to master
   - Preview URL for PRs

**Website URL:** `https://hostelgh.vercel.app`

### **Mobile - EAS Build & Submit**

**Pre-requisites:**
- EAS account (eas.build)
- Apple Developer account ($99/year)
- Google Play Developer account ($25 one-time)

**Build Steps:**

```bash
cd apps/mobile

# Login to EAS
eas login

# Build for iOS (TestFlight)
eas build --platform ios
# Share TestFlight link with testers

# Build for Android (Play Console)
eas build --platform android

# After testing, submit to stores
eas submit --platform ios
eas submit --platform android
```

**From here:**
- iOS: Apple reviews (usually 24-48 hours)
- Android: Google reviews (usually same day)
- Approved: Available on app stores

**App Store URLs:**
- iOS: https://apps.apple.com/app/hostelgh (after launch)
- Android: https://play.google.com/store/apps/details?id=com.hostelgh.mobile

---

## 🔐 Environment Variables

### **Quick Reference**

| Variable | Where | Purpose | Example |
|----------|-------|---------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | Backend | Token signing key | (random 32+ chars) |
| `PAYSTACK_SECRET_KEY` | Backend | Payment processing | `sk_live_...` |
| `NEXT_PUBLIC_API_URL` | Web | API endpoint (public) | `https://api.hostelgh.com/api` |
| `EXPO_PUBLIC_API_URL` | Mobile | API endpoint (public) | `https://api.hostelgh.com/api` |
| `CLOUDINARY_API_SECRET` | Backend | File storage key | (from Cloudinary) |

### **Full Configuration**

See [ENV_GUIDE.md](ENV_GUIDE.md) for complete environment variable documentation.

---

## 🐛 Troubleshooting

### **Build Issues**

**Error:** `Cannot find module '@prisma/client'`  
**Solution:**
```bash
cd apps/api
npx prisma generate
npm install
```

**Error:** `Port 3000 already in use`  
**Solution:**
```bash
# Find process on port 3000
lsof -i :3000     # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

**Error:** `Database connection failed`  
**Solution:**
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If Supabase: verify IP whitelist
# If Docker: ensure container is running: docker ps
```

### **Deployment Issues**

**Error:** `Build fails on Render`  
**Solution:**
- Check build command in render.yaml
- View build logs in Render dashboard
- Verify environment variables are set

**Error:** `API returns 502 Bad Gateway`  
**Solution:**
- Check Render service health
- View application logs
- Restart service

**Error:** `Mobile app can't reach API`  
**Solution:**
- Verify `EXPO_PUBLIC_API_URL` in .env
- Test URL from phone: open URL in browser
- Check API is accessible (not behind VPN)
- Verify CORS on backend

### **Performance Issues**

**Symptom:** Website loads slowly  
**Check:**
- Vercel analytics (slow pages)
- database queries (N+1 problem)
- Image optimization (use next/image)
- Bundle size (use `npm run analyze`)

**Symptom:** API responses slow  
**Check:**
- Database indexes (Prisma query analysis)
- External API calls (Paystack, Cloudinary)
- Server CPU/memory (Render monitoring)
- Network latency (ping API endpoint)

---

## 👥 Team Handoff

### **For Developers**

**First Time Setup:**
1. Clone repo
2. Follow "Local Development Setup" above
3. npm run dev in each apps folder
4. Read code in apps/{api|web|mobile}/src/

**Making Changes:**
```bash
# Always work in feature branch
git checkout -b feat/your-feature

# Make changes, commit, push
git add .
git commit -m "feat: description"
git push origin feat/your-feature

# Create PR on GitHub
# Get code review before merging
```

**Testing:**
```bash
# Before submitting PR
npm run lint
npm run type-check
npm run build

# For backend
npm run test
```

### **For DevOps**

**Monitoring:**
- Vercel Dashboard: Frontend metrics
- Render Dashboard: Backend logs & health
- Sentry (if configured): Crash reporting

**Common Tasks:**
- Scale backend: Render → Pro/Standard plans
- Update environment vars: Platform dashboards
- Deploy hotfix:
  ```bash
  git checkout master
  git pull
  # Fix issue
  git commit -am "fix: issue"
  git push origin master
  # Auto-deploys
  ```

**Backups:**
- Supabase: Auto-backups (1x/day)
- Enable point-in-time recovery (optional)
- Export backup monthly to cold storage

### **For QA/Testing**

**Manual Testing:**
1. Use E2E_TESTING_GUIDE.md
2. Test on multiple devices/browsers
3. File bugs with steps to reproduce

**Regression Testing:**
```bash
Before each release:
- Test core flows (login → browse → book → pay)
- Test error scenarios
- Test mobile responsive
- Test payment gateway
```

**Performance Testing:**
```bash
# Chrome DevTools
- Lighthouse (performance, accessibility)
- Network tab (slow 3G simulation)

# Mobile
- Expo performance profiler
- Battery usage monitoring
```

---

## 📊 Monitoring & Alerts

### **Backend (Render)**

```
Render Dashboard → Services → hostelgh-api
├─ Logs (realtime)
├─ Metrics (CPU, RAM, Network)
├─ Health checks
└─ Alerts (if payment fails, etc)
```

### **Frontend (Vercel)**

```
Vercel Dashboard → hostelgh
├─ Performance (Core Web Vitals)
├─ Build times
├─ Deployment history
└─ Logs
```

### **Database (Supabase)**

```
Supabase Dashboard → Monitoring
├─ Query performance
├─ Connections
├─ Replication status
└─ Backups
```

### **Error Tracking (Sentry - Phase 2)**

```
Sentry Dashboard
├─ Crash reports
├─ Error rate monitoring
├─ User session replay
└─ Release tracking
```

---

## ✅ Pre-Launch Checklist

- [ ] All tests passing locally
- [ ] Code reviewed by team lead
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Security review completed
- [ ] Performance acceptable (< 3s page load)
- [ ] Mobile app tested on real devices
- [ ] Payment gateway tested (sandbox → live)
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring dashboards set up
- [ ] Runbooks for common issues created
- [ ] Team trained on deployment process
- [ ] Backup & disaster recovery tested
- [ ] Compliance & privacy requirements met
- [ ] Documentation updated

---

## 📞 Getting Help

**Technical Issues:**
- GitHub Issues with `[BUG]` label
- Slack #development channel
- Code review process

**Deployment Help:**
- Render docs: render.com/docs
- Vercel docs: vercel.com/docs
- Supabase docs: supabase.com/docs

**Architecture Questions:**
- Review this document
- Check IMPLEMENTATION_SUMMARY.md
- Ask mobile-team lead

---

**Document Version:** 1.0  
**Last Updated:** February 24, 2026  
**Status:** ✅ Current & Accurate  
**Next Review:** Monthly
