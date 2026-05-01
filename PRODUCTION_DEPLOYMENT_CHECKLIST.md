# Production Deployment Guide

## Deployment Checklist

### Pre-Deployment (Code & Database)

#### Code Preparation
- ✅ All code committed to git
- ✅ Both builds passing (API + Web)
- ✅ E2E tests created and compiled
- ✅ Documentation complete
- ✅ Security reviews passed
- [ ] Code reviewed by team
- [ ] All TODO comments addressed

#### Database Preparation
- [ ] Backup production database
- [ ] Test migration on staging database first
- [ ] Verify .env.production has correct DATABASE_URL
- [ ] Verify Paystack keys for production
- [ ] Test Paystack API with production keys
- [ ] Enable Paystack webhooks for production

#### Infrastructure
- [ ] Production PostgreSQL running and accessible
- [ ] SSL/TLS certificates valid
- [ ] API server provisioned (RAM, CPU, storage)
- [ ] Web CDN configured
- [ ] Monitoring/alerting configured
- [ ] Backup strategy in place

---

## Step-by-Step Deployment

### 1. Git Commit & Tag

```bash
# Commit all changes
git add -A
git commit -m "feat: Add bank payment integration with E2E tests

- Implement BankTransferService for Paystack integration
- Add 6 new payment endpoints for bank transfers
- Create PaymentMethod enum (CARD, BANK_TRANSFER, USSD, MOBILE_MONEY)
- Extend Payment model with bank transfer fields
- Add comprehensive E2E test suite (14+ test cases)
- Create production deployment guide
- Both API and Web builds passing"

# Create version tag
git tag -a v1.1.0 -m "Release 1.1.0: Bank Payment Support"

# Push to remote
git push origin main
git push origin --tags
```

### 2. Database Migration

**Option A: Production Deployment (with downtime)**
```bash
# 1. Stop API server
systemctl stop hostelgh-api

# 2. Backup database
pg_dump hostelgh_prod > backups/hostelgh_$(date +%Y%m%d_%H%M%S).sql

# 3. Run migrations
export DATABASE_URL=postgresql://user:pass@prod-db:5432/hostelgh_prod
npx prisma migrate deploy

# 4. Verify schema
npx prisma studio  # Check if Payment model has new fields

# 5. Start API server
systemctl start hostelgh-api
```

**Option B: Zero-Downtime Migration (with shadow database)**
```bash
# 1. Create shadow database for verification
export SHADOW_DATABASE_URL=postgresql://user:pass@prod-db:5432/hostelgh_shadow

# 2. Test migration on shadow
npx prisma migrate deploy --shadow

# 3. If successful, deploy on production
npx prisma migrate deploy

# 4. Clean up shadow database
```

### 3. Environment Variables

**Update `.env.production`:**
```bash
# Database
DATABASE_URL=postgresql://user:password@prod-db.supabase.com:5432/hostelgh_prod
DIRECT_URL=postgresql://user:password@prod-db.supabase.com:5432/hostelgh_prod

# Paystack (Production Keys - Not Test Keys!)
PAYSTACK_SECRET_KEY=sk_live_xxxxx...  # PRODUCTION KEY
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx...  # PRODUCTION KEY

# Application
APP_URL=https://api.hostelgh.com
FRONTEND_URL=https://hostelgh.com
NODE_ENV=production
PORT=3001

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://xxxxx@sentry.io/project-id
```

### 4. Paystack Configuration

**Production Paystack Setup:**
```
1. Log in to Paystack Dashboard (https://dashboard.paystack.com)
2. Go to Settings → API Keys → Production
3. Copy Live Secret Key → Update PAYSTACK_SECRET_KEY
4. Copy Live Public Key → Update PAYSTACK_PUBLIC_KEY

5. Enable Bank Transfer:
   - Settings → API Keys → Banks
   - Make sure bank transfer is enabled
   - Note: May require Paystack support to enable for your account

6. Configure Webhooks:
   - Settings → Webhooks
   - Add URL: https://api.hostelgh.com/webhooks/paystack
   - Select events: charge.success, transfer.success, transfer.failed
   - Add authorized IPs (Paystack server IPs)

7. Test with small transaction
```

### 5. Deploy API

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Run migrations (if not done above)
npx prisma migrate deploy

# 5. Verify Prisma Client
npx prisma generate

# 6. Start API
npm start
# or with PM2
pm2 start dist/apps/api/src/main.js --name hostelgh-api

# 7. Check logs
pm2 logs hostelgh-api
# or
journalctl -u hostelgh-api -f
```

### 6. Deploy Web

```bash
# 1. Update NEXT_PUBLIC_API_URL to production API
export NEXT_PUBLIC_API_URL=https://api.hostelgh.com

# 2. Build web app
cd web
npm run build

# 3. Deploy to hosting platform
# For Vercel
vercel deploy --prod

# For other platforms
npm start
# or with PM2
pm2 start "npm start" --name hostelgh-web
```

### 7. Verification

```bash
# Check API is running
curl https://api.hostelgh.com/health
# Expected: 200 OK

# Check Web is running
curl https://hostelgh.com
# Expected: 200 OK with HTML

# Test bank payment endpoints
curl -X GET https://api.hostelgh.com/payments/bank/list \
  -H "Authorization: Bearer YOUR_TEST_TOKEN"
# Expected: Array of Ghana banks

# Verify database schema
npx prisma db pull
# Check for Payment model with new fields
```

---

## Rollback Plan

If deployment fails:

```bash
# 1. Stop API
systemctl stop hostelgh-api

# 2. Revert to previous version
git checkout v1.0.0  # Previous stable version

# 3. Rebuild and restart
npm install
npm run build
npx prisma migrate deploy  # Might revert migrations if needed
systemctl start hostelgh-api

# 4. Investigate issue
# Check logs
journalctl -u hostelgh-api -n 100

# 5. If database issue, restore from backup
psql -U postgres hostelgh_prod < backups/hostelgh_backup.sql
```

---

## Post-Deployment

### Monitoring

```bash
# Monitor API logs
pm2 logs hostelgh-api

# Monitor database
psql -U postgres -d hostelgh_prod
\dt  # List tables
SELECT COUNT(*) FROM "Payment";  # Check payment records

# Monitor Paystack webhook processing
# Check logs for webhook events
grep "webhook" /var/log/hostelgh-api.log

# Alert thresholds
- Response time > 1s
- Error rate > 1%
- Database connection pool > 90% full
- Disk usage > 80%
```

### Testing

```bash
# 1. Run full E2E test suite
npm run test:e2e

# 2. Smoke tests
- User registration
- Hostel creation
- Booking creation
- Bank payment initiation
- Bank payment verification

# 3. Payment processing
- Test bank transfer with Paystack test account
- Verify webhook processing
- Check payment status updates
- Verify email notifications sent
```

### Security Audit

```bash
# 1. Verify no secrets in code
git log --all --source -p | grep -i "secret\|password\|key" | head -20

# 2. Check environment variables loaded correctly
npm run start:prod | grep "Loaded"

# 3. Verify HTTPS/TLS
openssl s_client -connect api.hostelgh.com:443
# Check certificate validity

# 4. Verify authentication
curl -X GET https://api.hostelgh.com/payments/methods/test
# Expected: 401 Unauthorized (without token)

# 5. Test authorization
# Ensure users can only access their own data
```

---

## Deployment Timeline

| Phase | Duration | Task |
|-------|----------|------|
| **Preparation** | 30 min | Backup, setup environment, verify credentials |
| **Database** | 5-10 min | Run Prisma migrations |
| **API Deploy** | 10 min | Build, install dependencies, start |
| **Web Deploy** | 5-10 min | Build and deploy to CDN |
| **Testing** | 15-20 min | Run smoke tests and E2E tests |
| **Monitoring** | Ongoing | Watch logs and metrics |
| **Total** | ~1 hour | Full deployment window |

---

## Deployment Schedule

**Recommended:**
- **Timing:** Tuesday-Thursday morning (avoid Friday/weekend)
- **Window:** 2-3 hours for safety
- **Teams:** 2-3 people (developer, DevOps, QA)
- **Rollback ready:** Yes, within 30 minutes if needed

---

## Post-Deployment Checklist

- [ ] API responding to requests
- [ ] Web app loading
- [ ] Database migrations applied successfully
- [ ] Paystack connectivity verified
- [ ] Bank transfer endpoints working
- [ ] Webhooks receiving events
- [ ] Logs clear of errors
- [ ] Monitoring alerts active
- [ ] Email notifications working
- [ ] Team notified of deployment
- [ ] Client notified if applicable

---

## Troubleshooting

### API Won't Start
```bash
# Check if port is in use
lsof -i :3001

# Check database connection
psql -U postgres -d hostelgh_prod -c "SELECT 1"

# Check Prisma Client
npx prisma validate

# Check environment variables
env | grep DATABASE_URL
```

### Migration Fails
```bash
# Check migration status
npx prisma migrate status

# Resolve migrations
npx prisma migrate resolve --rolled-back 20260501000000_add_bank_payment_support

# Manually check database
psql -U postgres -d hostelgh_prod
\d "Payment"  # Check if fields exist
```

### Paystack Integration Issues
```bash
# Verify API keys
curl -H "Authorization: Bearer $PAYSTACK_SECRET_KEY" \
  https://api.paystack.co/bank?country=GH

# Check webhook delivery
# Go to Paystack Dashboard → Activity → Webhooks → View Events

# Enable debugging
export DEBUG=paystack:*
npm start
```

---

## Success Criteria

✅ Both builds passing  
✅ Database migrations applied  
✅ All 65 API endpoints functional  
✅ All 6 new bank payment endpoints working  
✅ Paystack integration verified  
✅ E2E tests passing  
✅ No critical errors in logs  
✅ User can complete full booking + payment flow  

---

## Contact & Support

**Deployment Issues:** Contact DevOps team  
**Paystack Issues:** Contact Paystack support  
**Code Issues:** Create GitHub issue  
**Emergency Rollback:** Contact tech lead

---

**Created:** May 1, 2026  
**Version:** 1.0  
**Status:** Ready for Production Deployment
