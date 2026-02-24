# HostelGH Mobile App 📱

> Cross-platform mobile application for HostelGH using React Native + Expo

## 🎯 Project Overview

This is the mobile version of HostelGH - a hostel booking platform inspired by Airbnb. The app allows users to:
- **Browse** hostels by city and filters
- **Search** for available rooms
- **Book** rooms with multi-step verification
- **Manage** bookings and payments
- **Track** all reservations
- **Communicate** with hostel owners

**Target Release:** Q2 2026 (After web platform stabilization)  
**Current Phase:** Development Setup & Core Architecture  
**Tech Stack:** React Native + Expo, TypeScript, Tailwind CSS (NativeWind)

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 18+ and npm
# Then install Expo CLI globally
npm install -g expo-cli
npm install -g eas-cli
```

### Setup Development Environment

```bash
# 1. Install dependencies
cd apps/mobile
npm install

# 2. Create .env file from template
cp .env.example .env

# 3. Update .env with your API URL
nano .env
# Set: EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Run on Simulator/Emulator

**iOS (macOS only):**
```bash
npm run dev
# Press 'i' in terminal to open iOS Simulator
```

**Android:**
```bash
npm run dev
# Press 'a' in terminal to open Android Emulator
```

**Web (for testing):**
```bash
npx expo start --web
```

---

## 📱 Project Structure

```
apps/mobile/
├── app/                          # Expo Router navigation
│   ├── _layout.tsx              # Root navigator (auth redirect)
│   ├── (auth)/                  # Auth screens (login, register)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (app)/                   # Main app (tabs)
│       ├── _layout.tsx          # Tab navigator
│       ├── explore/
│       │   └── index.tsx        # Browse hostels
│       ├── bookings/
│       │   └── index.tsx        # View/manage bookings
│       └── account/
│           └── index.tsx        # User profile
│
├── lib/
│   ├── api/
│   │   └── client.ts            # API client with axios
│   ├── stores/
│   │   └── authStore.ts         # Zustand auth state
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── hooks/                   # Custom React hooks (TODO)
│
├── components/                  # Reusable UI components (TODO)
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── InputField.tsx
│   └── ...
│
├── assets/                      # Images, icons
│   ├── icon.png
│   ├── splash.png
│   └── ...
│
├── app.json                     # Expo configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── .env                         # Environment variables (git ignored)
```

---

## 🔐 Authentication Flow

```
User Opens App
    ↓
Root Navigator checks token
    ↓
Token exists? → Load App (tabs)
Token missing? → Show Auth screens
    ↓
User Login/Register
    ↓
API returns token
    ↓
Token stored in SecureStore (encrypted)
    ↓
Redirect to App
```

**Key Files:**
- `app/_layout.tsx` - Token restoration on app launch
- `lib/stores/authStore.ts` - Zustand state persistence
- `lib/api/client.ts` - Automatic token injection in all requests

---

## 🎨 UI Components Roadmap

### Phase 1 (MVP - Current)
- ✅ Basic screens with Tailwind (NativeWind)
- ✅ Text inputs, buttons, scroll views
- ✅ Tab navigation
- ✅ Loading states

### Phase 2 (Enhancement - TODO)
- [ ] Reusable Card component
- [ ] Custom Input fields with validation
- [ ] Modal dialogs
- [ ] Image picker for KYC docs
- [ ] Payment modal (Paystack integration)
- [ ] Animations with React Native Reanimated

### Phase 3 (Polish - TODO)
- [ ] Skeleton loaders during data fetch
- [ ] Empty states with illustrations
- [ ] Pull-to-refresh functionality
- [ ] Infinite scroll pagination
- [ ] Dark mode support

---

## 🌐 API Integration

### Connected Endpoints

**Auth:**
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/logout` - Logout

**Hostels:**
- `GET /hostels` - List hostels (with filters)
- `GET /hostels/:id` - Get hostel details
- `GET /hostels/:id/rooms` - Get room types

**Bookings:**
- `POST /bookings` - Create booking
- `GET /bookings` - List user bookings
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id/cancel` - Cancel booking

**Payments:**
- `POST /payments/paystack/initialize` - Initialize Paystack payment

**User:**
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile
- `POST /upload/single` - Upload file (KYC docs)

**Note:** API base URL is read from `EXPO_PUBLIC_API_URL` env variable.

---

## 📦 Key Dependencies

```json
{
  "expo": "^52.0.0",              // Managed React Native
  "expo-router": "^3.5.0",        // File-based navigation
  "react-native": "^0.76.0",      // Mobile framework
  "zustand": "^4.4.0",            // State management
  "react-query": "^3.39.3",       // Server state cache
  "axios": "^1.6.0",              // HTTP client
  "nativewind": "^2.0.11",        // Tailwind for React Native
  "react-native-image-picker": "^7.1.0", // Camera/gallery
  "react-native-paystack-webview": "^1.0.15" // Payment
}
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for iOS (requires Mac)
npm run build:ios

# Build for Android
npm run build:android

# Preview on physical device or simulator after build
npm run preview

# Run tests
npm run test

# Lint TypeScript and JavaScript
npm run lint
```

---

## 🚢 Deployment

### Phase 1: Test Flight (Internal)
```bash
# Create EAS account first
eas build --platform ios
# This creates a TestFlight build link
# Distribute to internal testers
```

### Phase 2: App Store Review
```bash
# After successful testing
eas submit --platform ios
# Apple reviews → Approval → Launch
```

### Phase 3: Google Play
```bash
# Android build and submission
eas build --platform android
eas submit --platform android
# Google reviews → Approval → Launch
```

**Prerequisites:**
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- Provisioning profiles and certificates in Xcode
- EAS project ID configured in `app.json`

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
```bash
npm run test
```

Test files: `*.test.ts` or `*.spec.ts`

### E2E Testing (TODO)
```bash
# Use Detox or similar
npm run e2e
```

### Manual Testing Checklist

**Authentication:**
- [ ] Register new account
- [ ] Login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Logout clears auth token
- [ ] App restores session on relaunch

**Browsing:**
- [ ] Load hostel list
- [ ] Filter by city
- [ ] Search by name
- [ ] View hostel details
- [ ] Scroll room types smoothly

**Booking:**
- [ ] Create booking request
- [ ] Fill KYC form (if required)
- [ ] Submit booking
- [ ] View booking in My Bookings
- [ ] Check status updates

**Payments:**
- [ ] Initialize payment
- [ ] Open Paystack checkout
- [ ] Complete payment
- [ ] Booking status updates to CONFIRMED

**Profile:**
- [ ] View profile info
- [ ] Edit profile fields
- [ ] Update profile successfully

---

## 🐛 Debugging

### Enable Debug Mode
```env
# In .env
EXPO_PUBLIC_DEBUG=true
```

### View Logs
```bash
# Terminal logs appear directly in npm run dev

# Or use Expo Go app to see remote logs:
npm run dev
# Follow the instructions shown
```

### React Native Debugger
```bash
# Install: react-native-debugger
# Configure breakpoints and inspect state
```

---

## 📊 Performance Optimization

### Current Optimizations
- ✅ Zustand for efficient state updates (no re-render bloat)
- ✅ React Query for server state caching
- ✅ SecureStore for encrypted token storage
- ✅ Async image loading with Expo Image

### TODO Optimizations
- [ ] Image caching strategy
- [ ] Virtualized lists for large datasets
- [ ] Code splitting by route
- [ ] Network request batching
- [ ] Redux DevTools integration

---

## 🔒 Security Checklist

- ✅ Auth token stored in SecureStore (encrypted)
- ✅ HTTPS for all API calls
- ✅ JWT validation on backend
- ✅ 401 response triggers auto-logout
- ✅ No sensitive data in AsyncStorage
- ✅ Paystack webhook signature verification

**TODO:**
- [ ] Certificate pinning for API calls
- [ ] Rate limiting on client side
- [ ] Biometric authentication (Face/Touch ID)
- [ ] Session timeout after inactivity

---

## 📈 Analytics & Monitoring

### Recommended Services (Phase 2)
- **Crash Reporting:** Sentry
- **Analytics:** Mixpanel or Firebase
- **Performance:** Firebase Performance Monitoring
- **User Feedback:** Crash reporting + user surveys

```typescript
// Example Sentry integration (TODO)
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: true,
});
```

---

## 🤝 Contributing Guidelines

1. **Create feature branch:** `git checkout -b feat/booking-history`
2. **Follow naming:** `feat/`, `fix/`, `docs/`, `chore/` prefixes
3. **TypeScript strict:** Ensure no `any` types
4. **Run lint:** `npm run lint` before pushing
5. **Test manually:** Use checklist above
6. **Create PR:** Target `develop` branch initially

---

## 📋 MVP Feature Checklist

### Phase 1 (Current - Core Features)
- [x] Authentication (login/register)
- [x] Hostel browsing with city filter
- [x] Booking creation UI
- [x] Bookings management
- [x] Profile management
- [ ] In-app payments (Paystack integration)
- [ ] KYC form integration
- [ ] Push notifications

### Phase 2 (Q3 2026 - Enhancement)
- [ ] Owner dashboard (manage hostels)
- [ ] Reviews & ratings
- [ ] Wishlist/favorites
- [ ] Advanced filters (amenities, price, etc.)
- [ ] Chat with hostel owners
- [ ] Cancellation policies
- [ ] Dispute resolution

### Phase 3 (Q4 2026 - Monetization)
- [ ] Mobile Money (MTN, Vodafone, Airtel)
- [ ] Wallet system
- [ ] Referral program
- [ ] Premium features
- [ ] Analytics dashboard for owners

---

## 🎓 Learning Resources

### React Native
- [Official Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)

### TypeScript
- [Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### State Management
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://react-query.tanstack.com/)

---

## 📞 Support & Questions

- **Issues:** Create GitHub issue with `[MOBILE]` tag
- **Discord:** HostelGH dev channel
- **Email:** dev@hostelgh.com

---

## 📄 License

MIT License - See root [LICENSE](../../LICENSE) file

---

## 👥 Mobile Team

- **Lead:** [Your Name]
- **iOS Specialist:** [Name]
- **Android Specialist:** [Name]
- **QA:** [Name]

---

**Last Updated:** February 24, 2026  
**Version:** 0.1.0 (Setup Phase)  
**Status:** 🚀 Ready for Development
