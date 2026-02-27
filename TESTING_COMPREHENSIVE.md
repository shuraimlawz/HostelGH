# HostelGH Comprehensive Testing Guide

This guide covers testing strategies, setup, and execution for all components (Backend API, Web, Android).

## Table of Contents
1. [Backend API Testing](#backend-api-testing)
2. [Web Frontend Testing](#web-frontend-testing)
3. [Android App Testing](#android-app-testing)
4. [Integration & E2E Testing](#integration--e2e-testing)
5. [Performance Testing](#performance-testing)

---

## Backend API Testing

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for database & Redis services)
- npm/yarn installed

### Setup

```bash
# Start required services
npm run docker:up

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed test data (optional - requires FORCE_SEED=true)
FORCE_SEED=true npx ts-node prisma/seed.ts
```

### Running Tests

#### Unit Tests (future implementation)
```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:cov
```

#### E2E Tests
```bash
# Run e2e tests
npm run test:e2e
```

### Test Endpoints

#### Authentication
```bash
# Register new account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TENANT"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

#### Hostels (Public)
```bash
# Get all public hostels (relevance sorted)
curl "http://localhost:3000/api/hostels/public?sort=relevance&limit=10"

# Get hostels by city
curl "http://localhost:3000/api/hostels/public?city=Accra&sort=relevance"

# Get hostel detail
curl "http://localhost:3000/api/hostels/public/:id"

# Get trending locations
curl "http://localhost:3000/api/hostels/trending-locations"
```

#### Bookings (Requires Auth Token)
```bash
# Get my bookings (TENANT)
curl -X GET http://localhost:3000/api/bookings/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Owner bookings
curl -X GET http://localhost:3000/api/bookings/owner \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hostelId": "hostel-id",
    "roomId": "room-id",
    "startDate": "2026-03-01",
    "endDate": "2026-06-30",
    "numberOfGuests": 2
  }'

# Approve booking (OWNER/ADMIN)
curl -X PATCH http://localhost:3000/api/bookings/:bookingId/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Payments (Requires Approved Booking)
```bash
# Initialize Paystack payment
curl -X POST http://localhost:3000/api/payments/paystack/init/:bookingId \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "amount": 50000
  }'

# Verify payment
curl -X POST http://localhost:3000/api/payments/paystack/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reference": "paystack-reference-code"}'
```

#### Admin Operations (ADMIN role required)
```bash
# Get system stats
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get activity logs
curl -X GET http://localhost:3000/api/admin/activity?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl -X GET http://localhost:3000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Deploy broadcast
curl -X POST http://localhost:3000/api/admin/broadcast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "message": "Scheduled maintenance on Sunday 2am-4am GMT",
    "type": "warning",
    "target": "all"
  }'
```

### API Documentation

Swagger/OpenAPI documentation is available at:
```
http://localhost:3000/api/docs
```

---

## Web Frontend Testing

### Setup

```bash
cd web

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
EOF
```

### Running Tests

#### Development
```bash
# Start dev server
npm run dev

# Access at http://localhost:3000
```

#### Build & Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

#### Linting
```bash
npm run lint
```

### Manual Testing Checklist

- [ ] **Public Landing**
  - [ ] Hero carousel rotates images correctly (6s interval)
  - [ ] Search bar filters by city
  - [ ] Trending locations load and are clickable
  - [ ] Featured hostels display with relevance sort
  - [ ] Explore All button navigates to full hostels page

- [ ] **Hostels Listing**
  - [ ] Hostels load with relevance sort
  - [ ] City filter works
  - [ ] Price range filter works
  - [ ] Rating sort works
  - [ ] Click hostel opens detail page

- [ ] **Authentication**
  - [ ] Register form validates input
  - [ ] Login with valid credentials works
  - [ ] JWT token stored in cookies
  - [ ] Redirect to tenant dashboard after login
  - [ ] Logout clears token and redirects

- [ ] **Tenant Dashboard**
  - [ ] Active bookings display
  - [ ] Next stay card shows correctly
  - [ ] Profile completion progress bar updates
  - [ ] Recent activity feeds shows bookings
  - [ ] Links to payments, settings, help desk work

- [ ] **Owner Dashboard**
  - [ ] My Properties card shows hostel count
  - [ ] Revenue chart loads with data
  - [ ] Booking management table shows pending/active/completed
  - [ ] Approve/Reject buttons work
  - [ ] Add Property button opens form

- [ ] **Admin Dashboard**
  - [ ] System stats display (users, hostels, bookings, revenue)
  - [ ] Revenue flow chart renders
  - [ ] Activity log shows recent actions
  - [ ] Strategic hub links work
  - [ ] Broadcast modal opens and submits

---

## Android App Testing

### Prerequisites
- Android Studio 2024+
- Android SDK 24+ (API level 24+)
- JDK 11+
- Android Emulator or physical device

### Setup

```bash
cd apps/android

# Build debug APK
./gradlew assembleDebug

# Install to emulator/device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Unit Tests

```bash
# Run unit tests
./gradlew test

# With coverage
./gradlew testDebugUnitTestCoverage
```

### Instrumented Tests (on emulator/device)

```bash
# Run instrumented tests
./gradlew connectedAndroidTest

# For specific test class
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.hostelgh.LoginActivityTest
```

### Manual Testing Checklist

- [ ] **Launch & Splash**
  - [ ] App launches and shows splash screen
  - [ ] Splash lasts 2 seconds then navigates
  - [ ] Logo and branding display correctly

- [ ] **Authentication**
  - [ ] Login form validates email format
  - [ ] Login form validates password length
  - [ ] Register form validates all fields
  - [ ] Login with valid credentials succeeds
  - [ ] Invalid credentials show error message
  - [ ] Token stored in SharedPreferences

- [ ] **Explore (Hostels Browse)**
  - [ ] Hostels load from API
  - [ ] Hostels display with images
  - [ ] Click hostel opens detail activity
  - [ ] Search/filter functionality works
  - [ ] Loading spinner shows while fetching
  - [ ] Error message displays on network failure

- [ ] **Hostel Detail**
  - [ ] Hostel name, address, description display
  - [ ] Amenities list shows
  - [ ] Images swipe/carousel works
  - [ ] Rating and reviews display
  - [ ] Room types and prices show
  - [ ] Book Now button is functional

- [ ] **Booking Creation**
  - [ ] Check-in/Check-out date pickers work
  - [ ] Guest count can be selected
  - [ ] Room selection dropdown works
  - [ ] Pricing calculation is correct
  - [ ] Submit booking shows loading
  - [ ] Success message on completion

- [ ] **Bookings List (Tenant)**
  - [ ] My bookings load from API
  - [ ] Status badges display correctly
  - [ ] Click booking opens detail
  - [ ] Cancel button works (with confirmation)
  - [ ] Pagination works if many bookings

- [ ] **Account/Profile**
  - [ ] User info displays (name, email, phone)
  - [ ] Edit button enables fields
  - [ ] Save updates to backend
  - [ ] Logout clears token and navigates to login
  - [ ] Profile image displays

- [ ] **Push Notifications**
  - [ ] Firebase token registers
  - [ ] Notification received displays in tray
  - [ ] Tap notification opens app to relevant screen
  - [ ] Notifications persist in notification center

- [ ] **Error Handling**
  - [ ] Network error shows friendly message
  - [ ] 401 Unauthorized logs out user
  - [ ] 4xx errors display error details
  - [ ] 5xx errors show retry option
  - [ ] Retry button works

---

## Integration & E2E Testing

### Full Flow Testing

1. **User Registration & Login**
   - Register new account
   - Login with credentials
   - Verify token in storage

2. **Browse & Search**
   - Visit public listing
   - Search by city
   - Sort by relevance
   - View hostel detail

3. **Create Booking**
   - Select dates
   - Choose room
   - Submit booking
   - Verify in user bookings

4. **Approve & Payment** (Owner flow)
   - View pending booking
   - Approve booking
   - Send to tenant
   - Tenant initiates payment

5. **Admin Operations**
   - View system stats
   - Review activity logs
   - Send broadcast
   - Verify received by users

---

## Performance Testing

### Backend
```bash
# Install artillery for load testing
npm install -g artillery

# Create loadtest config (artillery.yml)
cat > artillery.yml << EOF
config:
  target: "http://localhost:3000/api"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Hostel Search"
    flow:
      - get:
          url: "/hostels/public?sort=relevance"
EOF

# Run load test
artillery run artillery.yml
```

### Web Performance
- Use Chrome DevTools Lighthouse
- Check Core Web Vitals (LCP, FID, CLS)
- Monitor bundle size: `npm run build`

### Android Performance
- Use Android Profiler in Android Studio
- Monitor memory leaks
- Check battery usage
- Test on low-spec devices

---

## Continuous Integration

### GitHub Actions (Recommended Setup)

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master, develop]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:e2e

  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd web && npm install
      - run: cd web && npm run build
      - run: cd web && npm run lint

  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: 11
      - run: cd apps/android && ./gradlew build
```

---

## Test Coverage Goals

| Component | Unit | Integration | E2E | Target |
|-----------|------|-------------|-----|--------|
| Backend   | 30%  | 20%         | 30% | 80%    |
| Web       | 20%  | 10%         | 30% | 60%    |
| Android   | 25%  | 15%         | 20% | 60%    |

---

## Troubleshooting

### Backend Tests
- **Redis Connection Failed**: Ensure `npm run docker:up` is running
- **Database Migration Error**: Run `npx prisma migrate deploy`
- **Port Already in Use**: Kill process on port 3000 or change `.env`

### Web Tests
- **Module Not Found**: Clear `.next` folder and reinstall
- **API Connection Error**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
- **CORS Error**: Ensure backend allows web origin

### Android Tests
- **Gradle Build Failed**: Invalidate caches in Android Studio
- **Emulator Issues**: Cold boot with `emulator -avd your_device -wipe-data`
- **API Connection Failed**: Ensure `BaseUrl` points to `http://10.0.2.2:3000/api`

---

## Quick Reference

| Test Type | Command | Duration | Scope |
|-----------|---------|----------|-------|
| Unit      | `npm test` | ~30s | Single function |
| E2E       | `npm run test:e2e` | ~2m | Full flow |
| Lint      | `npm run lint` | ~10s | Code style |
| Build     | `npm run build` | ~1m30s | Production bundle |
