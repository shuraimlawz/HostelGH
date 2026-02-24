# Environment Configuration Guide

This file documents all environment variables needed across the HostelGH platform.

## 🌐 Web Application (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# For production
# NEXT_PUBLIC_API_URL=https://api.hostelgh.com/api

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G_XXXXXXXXXXXXX

# Other services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## 📱 Mobile Application (apps/mobile/.env)

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Paystack
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxx

# EAS Project
EXPO_PUBLIC_EAS_PROJECT_ID=xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Environment
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true
```

## 🔧 Backend API (apps/api/.env)

```env
# Node Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hostelgh

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRY=24h

# Email (Production SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@hostelgh.com
SMTP_PASSWORD=your_app_password

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxx

# Webhooks
PAYSTACK_WEBHOOK_SECRET=wh_live_xxxxxxxxxxxxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://hostelgh.com

# Redis (for caching - Phase 2)
REDIS_URL=redis://localhost:6379
```

## 🗄️ Database (Supabase/PostgreSQL)

**Uses DATABASE_URL from backend .env**

```sql
-- Run migrations with:
npx prisma migrate deploy

-- If database doesn't exist:
npx prisma db push

-- For seeding:
npx prisma db seed
```

## 🚀 Deployment Environment Variables

### **Vercel (Web Frontend)**

```env
NEXT_PUBLIC_API_URL=https://api.hostelgh.com/api
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G_XXXXXXXXXXXXX
EDGE_CONFIG=your_edge_config_token
```

### **Render/Railway (Backend API)**

```env
NODE_ENV=production
DATABASE_URL=postgresql://secure_url_from_supabase
JWT_SECRET=very_secure_random_string_min_32_chars
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=wh_live_xxxxxxxxxxxxx
```

### **EAS (Mobile Build)**

```env
EXPO_PUBLIC_API_URL=https://api.hostelgh.com/api
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
EXPO_PUBLIC_EAS_PROJECT_ID=xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
EXPO_PUBLIC_ENV=production
```

## 🔒 Secrets Management Checklist

- [ ] Never commit .env files to git (already in .gitignore)
- [ ] Use .env.example for documentation
- [ ] Rotate secrets every 6 months
- [ ] Use different secrets for dev/staging/prod
- [ ] Store secrets in platform (Vercel/Render/EAS dashboard)
- [ ] Enable environment variable auto-complete in IDE
- [ ] Document what each secret does
- [ ] Set up secret rotation alerts

## 📋 Setup Process

### **Local Development**

1. Copy template files:
   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   ```

2. Fill in values:
   ```bash
   nano .env                      # Backend
   nano apps/web/.env.local       # Web
   nano apps/mobile/.env          # Mobile
   ```

3. For local development, use:
   - **API_URL:** `http://localhost:3000/api`
   - **Database:** Supabase or local PostgreSQL
   - **Paystack:** Test/sandbox keys
   - **Cloudinary:** Sandbox account

### **Production Deployment**

1. Never commit production secrets to git
2. Set environment variables in platform dashboards:
   - Vercel → Settings → Environment Variables
   - Render → Environment
   - EAS → secrets (via CLI)

3. Example Vercel setup:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter: https://api.hostelgh.com/api
   ```

## ✅ Verification Checklist

### **Web App**
- [ ] `NEXT_PUBLIC_API_URL` points to correct backend
- [ ] Analytics ID (if using)
- [ ] Cloudinary cloud name matches backend

### **Mobile App**
- [ ] `EXPO_PUBLIC_API_URL` points to correct backend
- [ ] Paystack public key is LIVE key (not test)
- [ ] EAS Project ID matches your EAS account

### **Backend API**
- [ ] `DATABASE_URL` connects to correct PostgreSQL
- [ ] JWT_SECRET is minimum 32 chars, cryptographically random
- [ ] Paystack keys are LIVE (not test) in production
- [ ] SMTP credentials allow app password auth
- [ ] CORS includes all frontend URLs

### **Database**
- [ ] All migrations have run
- [ ] Seed data loaded (if applicable)
- [ ] Backups enabled (Supabase auto-backup)

## 🆘 Troubleshooting

**Issue:** API returning 401 Unauthorized  
**Check:** Is JWT_SECRET same between API and where tokens are validated?

**Issue:** Email not sending  
**Check:** Are SMTP credentials correct? Has "Less secure app access" been enabled?

**Issue:** Paystack sandbox mode in production  
**Check:** Are environment keys the LIVE keys, not test keys?

**Issue:** CORS errors from frontend  
**Check:** Is frontend URL in ALLOWED_ORIGINS? Does URL include protocol (http/https)?

**Issue:** Mobile app can't reach API  
**Check:** Is EXPO_PUBLIC_API_URL correct? Can phone access that URL?

---

**Document Version:** 1.0  
**Last Updated:** February 24, 2026  
**Status:** ✅ Current & Accurate
