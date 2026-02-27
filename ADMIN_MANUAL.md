# HostelGH Admin Operational Manual

Complete guide for administrators to operate, manage, and maintain the HostelGH platform in production.

## Table of Contents
1. [Daily Operations](#daily-operations)
2. [User Management](#user-management)
3. [Hosting Management](#hosting-management)
4. [Booking Management](#booking-management)
5. [Payment Management](#payment-management)
6. [Incident Response](#incident-response)
7. [Performance Monitoring](#performance-monitoring)
8. [Escalation Procedures](#escalation-procedures)

---

## Daily Operations

### Morning Checklist (8 AM)

```bash
# 1. Check system health
curl https://api.yourdomain.com/health

# 2. Verify database connection
cloudflare-cli db-status

# 3. Check recent errors
tail -f logs/api.log | grep ERROR

# 4. Review overnight activity
curl -X GET https://api.yourdomain.com/api/admin/activity \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 5. Check payment reconciliation
curl -X GET https://api.yourdomain.com/api/admin/payouts \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Throughout the Day

**Every Hour:**
- Monitor uptime (check monitoring dashboard)
- Review error logs
- Check Paystack payment status

**Every 4 Hours:**
- Validate database size and growth
- Check backup completion
- Review user signup trends

**End of Day:**
- Generate daily report
- Archive logs
- Plan next day priorities

### Weekly Operations

**Monday Morning:**
- All-hands standup with support team
- Review KPIs from previous week
- Plan week priorities

**Wednesday:**
- Security audit (check for unusual activity)
- Dependency updates (npm audit, Java deps)
- Performance review

**Friday:**
- Database optimization (VACUUM, ANALYZE)
- Backup verification
- Weekly report to stakeholders

### Monthly Operations

**First Day of Month:**
- Full system audit
- Update documentation
- Review and update runbooks
- Security patches (all systems)
- Certificate renewal checks

**Mid-Month:**
- Database replication health check
- Disaster recovery drill
- Review and update capacity planning

**End of Month:**
- Performance metrics analysis
- Cost analysis and optimization
- Plan next month improvements

---

## User Management

### User Account Access

#### View User Details

```bash
# Via API
curl -X GET https://api.yourdomain.com/api/admin/users/:userId \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Via Database
SELECT id, email, firstName, lastName, role, suspended, createdAt 
FROM users 
WHERE id = 'user-id';
```

#### Approve New Users

New users automatically get access to platform. Email verification is required.

```bash
# Resend verification email
curl -X POST https://api.yourdomain.com/api/auth/resend-verification \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id"}'
```

#### Reset User Password

```bash
# Send password reset email
curl -X POST https://api.yourdomain.com/api/admin/users/:userId/reset-password \
  -H "Authorization: Bearer ADMIN_TOKEN"

# User receives email with reset link
```

#### Suspend/Unsuspend User

```bash
# Suspend user (blocks access)
curl -X PATCH https://api.yourdomain.com/api/admin/users/:userId/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"suspended": true, "reason": "Violation of terms"}'

# Unsuspend user
curl -X PATCH https://api.yourdomain.com/api/admin/users/:userId/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"suspended": false}'
```

#### Change User Role

```bash
# Promote tenant to owner
curl -X PATCH https://api.yourdomain.com/api/admin/users/:userId/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "OWNER"}'

# Demote owner to tenant
curl -X PATCH https://api.yourdomain.com/api/admin/users/:userId/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "TENANT"}'
```

### Handle Account Issues

#### User Locked Out

1. Reset user password via email
2. Or create temporary password:
   ```bash
   curl -X POST https://api.yourdomain.com/api/admin/users/:userId/temp-password \
     -H "Authorization: Bearer ADMIN_TOKEN"
   # Returns temporary password to share with user
   ```

#### Email Not Received

1. Check spam folder in help desk
2. Resend email:
   ```bash
   curl -X POST https://api.yourdomain.com/api/auth/resend-verification \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com"}'
   ```
3. Check email service status in logs

#### Account Recovery

If user lost access:
1. Verify identity via phone or secondary email
2. Reset password
3. Clear all active sessions/tokens
   ```bash
   curl -X POST https://api.yourdomain.com/api/admin/users/:userId/logout-all \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

---

## Hosting Management

### Infrastructure Status

#### Check All Services

```bash
# Docker containers
docker ps --all

# Expected output:
# - hostelgh-api (healthy)
# - postgres (healthy)
# - redis (healthy)
# - nginx (running)

# Health check
curl https://api.yourdomain.com/api/health
# Should return: { "status": "ok" }
```

#### Database Status

```bash
# Check size
psql -U postgres -d hostelgh_prod -c "SELECT pg_size_pretty(pg_database_size('hostelgh_prod'));"

# Check active connections
psql -U postgres -d hostelgh_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Check replication lag (if using replication)
psql -U postgres -d hostelgh_prod -c "SELECT slot_name, restart_lsn FROM pg_replication_slots;"
```

#### Redis Cache Status

```bash
# Connect to Redis
redis-cli

# Check memory usage
INFO memory

# Check connected clients
INFO clients

# Clear cache if needed
FLUSHDB  # Warning: clears current database
```

### Scale Operations

#### Increase API Capacity

```bash
# Edit docker-compose configuration
nano docker-compose.prod.yml

# Increase CPU/memory limits:
# services:
#   api:
#     deploy:
#       resources:
#         limits:
#           cpus: '2.0'
#           memory: 2G

# Restart service
docker-compose -f docker-compose.prod.yml restart api
```

#### Database Scaling

```bash
# If approaching storage limit (>80%)
# 1. Archive old logs
# 2. Delete old payment/audit records
# 3. Or provision larger disk

# Add more disk space (varies by provider)
# Cloud example (AWS):
aws ec2 modify-volume --volume-id vol-xxxxx --size 200

# Resize filesystem
sudo resize2fs /dev/xvda1
```

### Backup & Recovery

#### Automated Backups

Backups run daily at 2 AM UTC.

```bash
# Verify backup completed
ls -lh /backups/hostelgh_prod_*.sql.gz | tail -5

# Check backup size
du -sh /backups/

# Test restore (on staging)
pg_restore -U postgres -d hostelgh_staging /backups/hostelgh_prod_latest.sql
```

#### Manual Backup

```bash
pg_dump -U postgres hostelgh_prod -h localhost | gzip > backup-manual-$(date +%Y%m%d).sql.gz

# Verify backup
gzip -t backup-manual-*.sql.gz && echo "Backup valid"
```

#### Restore from Backup

```bash
# Stop API service
docker-compose stop api

# Restore database
psql -U postgres < backup-hostelgh_prod_20260227.sql

# Restart API
docker-compose start api

# Verify recovery
curl https://api.yourdomain.com/api/health
```

---

## Booking Management

### Pending Bookings

#### View Pending Bookings

```bash
# Get all pending bookings
curl -X GET "https://api.yourdomain.com/api/admin/bookings?status=PENDING_APPROVAL&limit=50" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### Handle Disputed Bookings

1. **Check booking details**
   ```bash
   curl -X GET https://api.yourdomain.com/api/admin/bookings/:bookingId \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

2. **Review communication**
   - Check messages between tenant and owner
   - Review any reported issues

3. **Resolution options**
   - Approve booking
   - Reject booking with reason
   - Mediate between parties
   - Issue refund if needed

#### Extreme Cases

For bookings with issues (fraud suspected, Terms of Service violation):

```bash
# Reject and refund
curl -X PATCH https://api.yourdomain.com/api/admin/bookings/:bookingId/reject \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Violation of Terms of Service",
    "refundAmount": 500000,
    "notifyTenant": true
  }'
```

### Cancellations & Refunds

#### Process Refund

```bash
# Initiate refund
curl -X POST https://api.yourdomain.com/api/admin/refunds \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-id",
    "refundAmount": 500000,
    "reason": "Tenant requested cancellation"
  }'
```

#### Refund Status

```bash
# Check refund status
curl -X GET https://api.yourdomain.com/api/admin/refunds/:refundId \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Booking Disputes

#### Report Format

Template for documenting disputes:
1. Booking ID
2. Parties involved (tenant, owner)
3. Issue description
4. Evidence (messages, photos, documents)
5. Resolution attempted
6. Admin recommendation

---

## Payment Management

### Monitor Payments

#### Daily Payment Reconciliation

```bash
# Get payment summary for today
curl -X GET "https://api.yourdomain.com/api/admin/payments/summary?date=today" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Response includes:
# - Total transactions
# - Total amount
# - Success rate
# - Failed transactions
```

#### Check Failed Payments

```bash
curl -X GET "https://api.yourdomain.com/api/admin/payments?status=FAILED&limit=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### Reconcile with Paystack

```bash
# Via Paystack Dashboard
# 1. Go to Transactions → All
# 2. Filter by date
# 3. Compare amount and count with our database

# Or via API
curl https://api.paystack.co/transaction \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

### Handle Failed Payments

#### Auto-Retry

Failed payments automatically retry after 1 hour, then 24 hours.

#### Manual Retry

```bash
curl -X POST https://api.yourdomain.com/api/payments/:paymentId/retry \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### Investigate Payment Issues

1. Check payment logs
   ```bash
   grep "payment.*error" logs/api.log | tail -20
   ```

2. Verify Paystack connection
   ```bash
   # Test API connection
   curl https://api.paystack.co/bank \
     -H "Authorization: Bearer sk_live_YOUR_KEY" \
     | head -20
   ```

3. Check user account
   - Verify card details are correct
   - Check for card blocks

### Payment Disputes

#### Chargeback

When customer disputes payment:

1. **Verify transaction**
   ```bash
   curl -X GET https://api.yourdomain.com/api/admin/payments/:paymentId \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

2. **Gather evidence**
   - Payment confirmation
   - Booking confirmation
   - Communication history
   - Check-in proof

3. **Submit to bank**
   - Use Paystack dispute system
   - Attach all evidence
   - Respond within merchant timeframe

---

## Incident Response

### Website Down

**Response Time SLA:** 15 minutes to investigate, 1 hour to resolve

#### Step 1: Confirm Outage

```bash
# Check if site is down
curl -I https://yourdomain.com

# Check API status
curl https://api.yourdomain.com/health

# Check service status page
# (or set up automated alerts)
```

#### Step 2: Identify Cause

```bash
# Check recent logs
docker logs hostelgh-api | tail -50

# Check system resources
docker stats

# Check database
psql -U postgres -c "SELECT 1;"

# Check Redis
redis-cli PING
```

#### Step 3: Common Fixes

**API Container Crashed:**
```bash
docker-compose restart api
# Wait 30 seconds for startup
curl https://api.yourdomain.com/health
```

**Database Connection Error:**
```bash
# Check connection pool
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check database status
docker logs hostelgh-db
```

**Out of Memory:**
```bash
docker stats  # Confirm high memory usage
docker-compose restart api
# Monitor memory over next hour
```

**Disk Space Full:**
```bash
df -h
# If > 90%: archive old logs and clear cache
rm -rf /var/lib/docker/volumes/*cache*/
docker system prune -a
```

#### Step 4: Notify Users

```bash
# Update status page
# Send notification to users
curl -X POST https://api.yourdomain.com/api/notifications/broadcast \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service Restored ✅",
    "message": "HostelGH is back online. Our apologies for the brief downtime.",
    "type": "info",
    "target": "all"
  }'
```

#### Step 5: Document Incident

Log incident details:
- Start time
- Duration
- Root cause
- Resolution taken
- Follow-up actions
- Timeline

### Database Corruption

**Response Time SLA:** 2 hours

1. **Identify affected data**
   ```bash
   # Check database integrity
   psql -U postgres -d hostelgh_prod -c "REINDEX DATABASE hostelgh_prod;"
   ```

2. **Restore from backup**
   ```bash
   # Use most recent backup before corruption
   pg_restore -U postgres -d hostelgh_prod_backup backup.sql
   ```

3. **Notify affected users**
   - Identify impacted accounts
   - Send apology email
   - Offer compensation (credits, extended trial)

### Security Incident

**Response Time SLA:** 30 minutes to investigate

#### Potential Breaches

1. **Unusual API Access**
   ```bash
   # Check access logs for anomalies
   grep "401\|403" logs/access.log

   # Check login patterns
   SELECT user_id, COUNT(*), MAX(login_time) 
   FROM audit_logs 
   WHERE action = 'login' 
   GROUP BY user_id
   ORDER BY COUNT(*) DESC LIMIT 10;
   ```

2. **Password Reset Spam**
   ```bash
   # May indicate brute-force attack
   # Implement rate limiting if not present
   SELECT email, COUNT(*) 
   FROM audit_logs 
   WHERE action = 'password_reset' 
   AND created_at > NOW() - INTERVAL '1 hour'
   GROUP BY email;
   ```

3. **Unauthorized Admin Access**
   ```bash
   # Check who accessed admin endpoints
   grep "/admin/" logs/access.log | grep -v "admin-user-id"
   ```

#### Response

1. **Contain**
   - Rotate all API keys and secrets
   - Force password reset for affected users
   - Revoke compromised tokens

2. **Investigate**
   - Gather logs
   - Identify entry point
   - Determine scope of damage

3. **Notify**
   - Privacy policy requires user notification
   - Transparency builds trust

---

## Performance Monitoring

### Key Metrics to Track

#### API Response Times

```bash
# Get response time percentiles
curl -X GET https://api.yourdomain.com/api/admin/metrics/response-times \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Target: p95 < 500ms, p99 < 1s
```

#### Error Rate

```bash
# Should stay below 0.1%
curl -X GET https://api.yourdomain.com/api/admin/metrics/errors \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### Database Performance

```bash
# Slow query log
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Performance Optimization

#### Identify Slow Endpoints

```bash
grep "duration=" logs/api.log | awk -F'duration=' '{print $2}' | sort -rn | head -10
```

#### Database Query Optimization

```sql
-- Find slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100  -- >100ms
ORDER BY mean_time DESC;

-- Add indexes for frequently queried columns
CREATE INDEX idx_bookings_status ON bookings(status) WHERE status != 'COMPLETED';
CREATE INDEX idx_hostels_city ON hostels(city) WHERE verified = true;
```

#### Cache Optimization

```bash
# Monitor cache hit rate
redis-cli INFO stats | grep hit_rate
# Target: >80% hit rate

# Clear stale cache
redis-cli DEL "hostels:public:*"
redis-cli DEL "trending-locations"
```

---

## Escalation Procedures

### Escalation Matrix

| Severity | Response | Owner | Escalate After |
|----------|----------|-------|-----------------|
| Critical (Down) | 15m | On-call Eng | 30m if unresolved |
| High (Degraded) | 1h | Senior Eng | 2h if unresolved |
| Medium (Issue) | 4h | Eng Team | 8h if unresolved |
| Low (Enhancement) | 24h | Product | 1 week review |

### When to Page

**Immediate Page (Any Time):**
- Website completely down (P0)
- API returning 5xx for >5% of requests
- Data loss suspected
- Security breach suspected

**Work Hours Page:**
- P1 issues during business hours
- Database corruption detected
- Payment processing failures

**No Page (Handle in Queue):**
- Single user issues
- Feature requests
- Performance degradation <30%

### Escalation Contact

```
Level 1: Support Team → Slack #support-escalations
Level 2: Engineering Lead → Slack @eng-lead (+ page if critical)
Level 3: CTO → Email + phone (if Level 2 unavailable)
Level 4: CEO → For business-critical issues
```

---

## Checklists

### Pre-Launch Checklist

- [ ] All services running (API, DB, Cache, Queue)
- [ ] Backups verified working
- [ ] Monitoring & alerts configured
- [ ] Team trained on incident response
- [ ] Runbooks reviewed and up-to-date
- [ ] Disaster recovery tested
- [ ] Security audit passed

### Weekly Maintenance

- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Log rotation
- [ ] Backup verification
- [ ] Certificate expiry check (>30 days)
- [ ] Dependency updates reviewed
- [ ] Performance metrics reviewed

### Monthly Maintenance

- [ ] Full database inspection
- [ ] Security scan
- [ ] Cost analysis
- [ ] Capacity planning review
- [ ] Incident post-mortems completed
- [ ] Documentation updated

---

## Support Resources

**Slack Channels:**
- #platform-ops (daily ops discussion)
- #incident-response (active incidents)
- #infrastructure (infra changes)

**Documentation:**
- API Docs: https://api.yourdomain.com/api/docs
- Architecture: See README.md
- Runbooks: Each service has runbook

**External Services:**
- Paystack: https://dashboard.paystack.com
- Firebase: https://console.firebase.google.com
- Uptime Monitor: https://uptimerobot.com
