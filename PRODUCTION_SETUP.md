# HostelGH Production Deployment Guide

This guide explains how to deploy HostelGH to production without any fake/seeded data.

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 13+
- Redis (for caching)
- Android SDK (for mobile builds)
- Valid Google Cloud credentials (for OAuth and Firebase)

## Database Setup (Production)

```bash
# 1. Set DATABASE_URL and DIRECT_URL environment variables
export DATABASE_URL="postgresql://user:password@host:5432/hostelgh"
export DIRECT_URL="postgresql://user:password@host:5432/hostelgh"  # Direct connection bypassing pgBouncer

# 2. Run migrations (NO SEEDING)
npm run prisma:migrate:deploy

# 3. DO NOT run seed - production starts empty
# npm run prisma:db:seed   # ⚠️ DO NOT RUN IN PRODUCTION
```

## First-Time Setup (Creating Initial Admin)

Since the database starts empty, you must create the first admin user manually:

### Option A: Via Web UI (Recommended for production)
1. Start the application
2. Create a regular user account via registration
3. Contact system engineer to manually elevate to ADMIN role via database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Option B: Via Direct SQL (Requires database access)

```sql
INSERT INTO "User" (
  id,
  email,
  "passwordHash",  
  role,
  "firstName",
  "lastName",
  "isActive",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@hostelgh.com',
  'bcrypt_hashed_password_here',  -- Use bcrypt.hash() to generate
  'ADMIN',
  'Admin',
  'User',
  true,
  true,
  NOW(),
  NOW()
);
```

## Environment Variables

Create a `.env.production` file with:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=long-random-string-here
JWT_REFRESH_SECRET=another-long-random-string

# Frontend
NEXT_PUBLIC_API_URL=https://api.hostelgh.com
NEXT_PUBLIC_APP_URL=https://hostelgh.com

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Email Service
SENDGRID_API_KEY=...  # Or use Nodemailer + SMTP

# Payment Provider
PAYSTACK_SECRET_KEY=...
PAYSTACK_PUBLIC_KEY=...

# Cloudinary (Image uploads)
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Starting Services

### Backend API
```bash
npm run start:prod
# Server runs on http://localhost:3000
```

### Web Frontend
```bash
cd web
npm run build
npm run start
# Frontend runs on http://localhost:3001
```

### Android App
```bash
cd apps/android
./gradlew assembleRelease
# APK location: app/build/outputs/apk/release/app-release.apk
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed (no seed)
- [ ] Redis connection verified
- [ ] Firebase project configured
- [ ] Google OAuth credentials set
- [ ] Email service (Sendgrid/SMTP) configured
- [ ] Image upload service (Cloudinary) configured
- [ ] First admin user created manually
- [ ] API health check passing (`GET /health`)
- [ ] Web frontend home page loads
- [ ] HTTPS/TLS enabled on all endpoints
- [ ] Database backups configured
- [ ] Monitoring and logging enabled

## Monitoring

### Health Checks
```bash
# Backend API health
curl https://api.hostelgh.com/health

# Database connectivity
curl https://api.hostelgh.com/health/db
```

### Logs
Monitor application logs for errors:
- Backend: `npm run start:prod` (configure log aggregation)
- Web: Next.js logs in `/var/log/hostelgh-web/`
- Database: PostgreSQL logs in `/var/lib/postgresql/data/`

## No Fake Data

✅ **This deployment contains:**
- Real hostel listings (created via owner dashboard)
- Real user accounts (created via registration)
- Real booking system with actual payment processing
- Real notifications via Firebase

❌ **This deployment DOES NOT contain:**
- Seeded test accounts
- Fake hostels or bookings
- Placeholder logic
- Demo data

## Support

For configuration issues or deployment questions, refer to:
- [Backend Setup](./SETUP_AND_DEPLOYMENT.md)
- [Mobile Development](./MOBILE_DEVELOPMENT_GUIDE.md)
- [API Documentation](http://api.hostelgh.com/swagger)
