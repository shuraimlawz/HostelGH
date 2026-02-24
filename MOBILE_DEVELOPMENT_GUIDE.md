# 📱 HostelGH Mobile Development Guide

**Document Version:** 1.0  
**Created:** February 24, 2026  
**Status:** Setup & Foundation Ready

---

## 🎯 Executive Summary

HostelGH is expanding to **mobile platforms** (iOS + Android) using **React Native + Expo**. This document outlines:
- Why we chose React Native
- Architecture and code sharing strategy
- Development roadmap
- Deployment timeline
- Team setup and responsibilities

**Current Phase:** Foundation Setup ✅  
**Next Phase:** Core Features Development (Q2 2026)  
**Target Launch:** Q3 2026 (5-6 months)

---

## 🚀 Why React Native + Expo?

### Comparison Matrix

| Aspect | React Native | Flutter | Expo | Native |
|--------|-------------|---------|------|--------|
| **Code Sharing** | ✅ Share JS/TS with web | ❌ Dart only | ✅✅ Maximum | ❌ None |
| **Dev Speed** | Fast | Very fast | ✅✅ Fastest | Slow |
| **Team Ramp-up** | ✅ JS devs ready | ❌ Need Dart | ✅✅ Existing team | ❌ New languages |
| **iOS + Android** | ✅ Same codebase | ✅ Same codebase | ✅ Same codebase | ❌ Separate |
| **Payments** | ✅ Paystack libs exist | ✅ Available | ✅✅ Easy | ✅ Native |
| **App Store Deploy** | Medium effort | Medium effort | ✅ Simple | Simple |
| **Community** | ✅✅ Huge | ✅✅ Huge | Large | Obvious |
| **Learning Curve** | Medium | Steep | ✅ Low |  |

### Decision: **React Native + Expo** ✅

**Rationale:**
1. **Team Efficiency:** Your web team (React devs) can jump to mobile with minimal learning
2. **Code Reuse:** Share validation, types, API client logic with web app
3. **Fast MVP:** Expo managed workflow = faster initial releases
4. **Cost Effective:** One team builds iOS + Android simultaneously
5. **Paystack Ready:** React Native Paystack integration readily available

---

## 📂 Monorepo Structure

### Pre-Mobile Structure
```
HostelGH/
├── apps/
│   ├── web/          (Next.js frontend)
│   └── api/          (NestJS backend)
├── prisma/           (Database schema)
└── docker/           (DevOps)
```

### Post-Mobile Structure (NEW)
```
HostelGH/
├── apps/
│   ├── web/          (Next.js frontend) ✅
│   ├── api/          (NestJS backend)   ✅
│   └── mobile/       (React Native)     ✅ NEW
│
├── packages/         (Shared code) ✅ NEW
│   ├── shared-types/       (TypeScript interfaces)
│   ├── shared-utils/       (API client, validators)
│   └── shared-config/      (Constants, env)
│
├── prisma/           (Database schema)
├── docker/           (DevOps)
└── .github/
    └── workflows/    (CI/CD including mobile builds)
```

---

## 🔄 Code Sharing Strategy

### What We're Sharing (DRY Principle)

```typescript
// ✅ SHARED: TypeScript interfaces
packages/shared-types/index.ts
→ Used by: web/, api/, mobile/

// ✅ SHARED: API client
packages/shared-utils/api-client.ts
→ Used by: web/ + mobile/ (same interface)

// ✅ SHARED: Validation schemas
packages/shared-utils/validators.ts
→ Zod schemas for form validation (both platforms)

// ✅ SHARED: Constants
packages/shared-config/constants.ts
→ API endpoints, business logic constants
```

### What's Platform-Specific (NOT Shared)

```typescript
// ❌ NOT shared: UI components
web/components/Button.tsx      (HTML/CSS)
mobile/components/Button.tsx   (React Native)

// ❌ NOT shared: Screens/Pages
web/app/explore/page.tsx       (Next.js)
mobile/app/explore/index.tsx   (Expo Router)

// ❌ NOT shared: Styling
web/globals.css                (Tailwind)
mobile/tailwind.config.js      (NativeWind)
```

### Benefits of This Approach
- 🎯 Single source of truth for business logic
- 🚀 Faster development (less code duplication)
- 🐛 Bug fixes in one place benefit both platforms
- 📦 Smaller app bundle sizes
- 🔒 Security centralized (validation, auth)

---

## 🛠️ Technology Stack

### Mobile App Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | React Native 0.76+ | Mobile JavaScript engine |
| **Framework** | Expo 52+ | Managed build & deployment |
| **Routing** | Expo Router 3.5+ | File-based navigation (like Next.js) |
| **Language** | TypeScript 5.3+ | Type safety |
| **UI** | React Native + NativeWind | Native components with Tailwind syntax |
| **Icons** | lucide-react-native | 1000+ consistent icons |
| **State** | Zustand + React Query | Local + server state |
| **Storage** | SecureStore + AsyncStorage | Encrypted + persistent |
| **HTTP** | Axios | API calls with interceptors |
| **Forms** | React Hook Form (TODO) | Complex form validation |
| **Payments** | Paystack WebView | Payment processing |
| **Images** | Expo Image | Native image optimization |
| **Files** | ImagePicker + Cloudinary | KYC document uploads |

### Comparison with Web Stack

| Component | Web | Mobile |
|-----------|-----|--------|
| **Framework** | Next.js 16 | React Native + Expo |
| **Routing** | App Router | Expo Router |
| **UI** | Tailwind CSS | NativeWind |
| **State** | React Query | React Query + Zustand |
| **API** | Fetch/Axios | Axios (shared) |
| **Forms** | Zod + RHF (TODO) | Zod + RHF (shared) |
| **Build** | TypeScript + Vercel | EAS + App Store |

---

## 📋 Project Structure Breakdown

### apps/mobile/ Directory

```
apps/mobile/
├── app/                          # Routes (Expo Router)
│   ├── _layout.tsx              # Root navigator
│   ├── (auth)/                  # Auth stack
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (app)/                   # Main app (tabs)
│       ├── _layout.tsx          # Tab navigator
│       ├── explore/
│       │   ├── _layout.tsx
│       │   ├── index.tsx        # Home - browse hostels
│       │   ├── [id].tsx         # Hostel detail
│       │   └── search.tsx       # Advanced search
│       ├── bookings/
│       │   ├── _layout.tsx
│       │   ├── index.tsx        # List bookings
│       │   ├── [id].tsx         # Booking detail
│       │   └── create.tsx       # Create booking (modal)
│       └── account/
│           ├── _layout.tsx
│           ├── index.tsx        # Profile
│           ├── edit.tsx         # Edit profile
│           └── settings.tsx     # Settings
│
├── lib/
│   ├── api/
│   │   └── client.ts            # API client (Axios)
│   ├── stores/
│   │   ├── authStore.ts         # Auth state (Zustand)
│   │   └── bookingStore.ts      # Booking state (TODO)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── hooks/
│       ├── useAuth.ts           # Auth hook
│       ├── useHostels.ts        # Hostels query hook
│       └── useBookings.ts       # Bookings query hook
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── bookings/
│   │   ├── BookingCard.tsx
│   │   └── BookingForm.tsx
│   ├── hostels/
│   │   ├── HostelCard.tsx
│   │   └── FilterBar.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
│
├── assets/
│   ├── icon.png               # App icon
│   ├── splash.png             # Splash screen
│   └── fonts/
│
├── app.json                   # Expo config
├── tsconfig.json              # TypeScript
├── tailwind.config.js         # NativeWind config
├── package.json               # Dependencies
├── .env.example               # Env template
├── .gitignore
└── README.md                  # Development guide
```

---

## 🏃 MVP Features (Phase 1 - Q2 2026)

### What's Included in MVP ✅

1. **Authentication**
   - Login/Register
   - Password reset
   - Session persistence
   - Logout

2. **Hostel Discovery**
   - Browse all hostels
   - Filter by city
   - Search by name
   - Sort by price/rating
   - View hostel details (images, rooms, facilities)

3. **Booking**
   - Create booking request
   - Multi-step form (personal info → KYC → summary)
   - View all bookings
   - Cancel booking request
   - Check booking status

4. **Payments** (Integration Ready)
   - View payment status
   - Pay via Paystack checkout
   - Booking confirmation after payment

5. **User Profile**
   - View profile info
   - Edit profile
   - Store settings

### What's NOT in MVP (Phase 2+) 🚫

- Owner dashboard (manage hostels)
- Reviews & ratings
- Chat/messaging
- Wishlist
- Email/SMS notifications (backend ready, mobile UI TODO)
- Advanced analytics
- Offline mode

---

## 🚀 Development Roadmap

### Timeline

```
Q1 2026 (Now)
├─ ✅ Project setup
├─ ✅ Navigation structure
├─ ✅ Auth screens
├─ ✅ API client
└─ Status: Foundation ready

Q2 2026 (Next)
├─ Core features
├─ Payment integration
├─ QA & bug fixes
├─ Internal testing (TestFlight/Android beta)
└─ Target: 90% feature complete

Q3 2026
├─ App Store submission
├─ Google Play submission
├─ Marketing & soft launch
└─ Target: Public availability

Q4 2026
├─ Phase 2 features
├─ Performance optimization
├─ Analytics setup
└─ Monetization features
```

### Milestones

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| **Setup** | Feb 24 | Project structure, navigation, screens ✅ |
| **Core Dev** | Apr 15 | All screens, API integration, payments |
| **QA Ready** | May 1 | Internal build, TestFlight link |
| **App Store** | Jun 15 | iOS + Android release |
| **Post-Launch** | Sep 30 | Bug fixes, Phase 2 planning |

---

## 👥 Team Structure

### Recommended Team Composition

```
Product Manager (1)
├─ Define features
├─ Coordinate with web/backend teams
└─ Manage releases

Mobile Lead (1)
├─ Architecture decisions
├─ Code reviews
├─ Performance optimization
└─ Platform leadership

iOS Developer (1)
├─ iOS-specific setup
├─ Xcode/provisioning
├─ TestFlight management
└─ iOS testing/debugging

Android Developer (1)
├─ Android setup
├─ Gradle/Android Studio
├─ Google Play setup
└─ Android testing/debugging

QA Engineer (1)
├─ Test plan creation
├─ Manual testing on devices
├─ Regression testing
└─ Bug reporting

React/TS Developer (1-2)
├─ Feature implementation
├─ Component development
├─ Cross-platform work
└─ Code sharing (with web team)
```

### Total Team: 4-5 people (can overlap with web team)

---

## 🔗 Integration Points

### With Web Team
- Share TypeScript types and validation
- Coordinate API changes
- Share state management patterns
- Unified error handling

### With Backend Team
- API endpoint compatibility
- Mobile-specific optimizations (pagination, filters)
- Paystack webhook verification
- Push notifications setup (TODO)

### With DevOps
- EAS build configuration
- Secrets management (API keys, Paystack)
- Release automation
- Monitoring and crash reporting

---

## 📱 Build & Deployment

### Local Development Build
```bash
npm run dev        # Starts Expo server
# Scan QR code in Expo Go app
```

### TestFlight Build (iOS)
```bash
eas build --platform ios --profile preview
# Generates iOS build
# Link distributed to testers
```

### Google Play Beta Build (Android)
```bash
eas build --platform android --profile preview
# Generates Android build
# Link for beta testing
```

### Production Release
```bash
eas build --platform all --profile production
eas submit --platform all
# Submits to both App Store and Google Play
```

### Requirements
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25/lifetime)
- Certificates & provisioning profiles
- EAS subscription (~$99/month for EAS Build)

---

## 🧪 Testing Strategy

### Local Testing (During Development)
- Expo Go app on physical devices
- iOS Simulator (Mac only)
- Android Emulator

### Beta Testing (Pre-Release)
- TestFlight (iOS) - 10,000 internal testers
- Google Play Beta - Invite-only

### QA Testing Checklist
```
Authentication (15 minutes)
├─ Register new account
├─ Login/logout
├─ Session persistence
└─ Error handling

Hostel Discovery (20 minutes)
├─ List loading & performance
├─ Filters working
├─ Search accuracy
├─ Detail page rendering
└─ Images loading

Booking (25 minutes)
├─ Form validation
├─ Multi-step flow
├─ Submission success
├─ Status updates
└─ Cancellation

Payments (15 minutes)
├─ Paystack integration
├─ Payment success
├─ Booking confirmation
└─ Error scenarios

Profile (10 minutes)
├─ Profile display
├─ Edit functionality
├─ Settings save
└─ Logout flow

Performance (10 minutes)
├─ App startup time < 3s
├─ List scroll smooth (60fps)
├─ API response time < 2s
└─ Memory usage acceptable

Offline (5 minutes)
├─ Graceful error on no network
├─ Retry mechanisms
└─ Cached data display
```

---

## 🔒 Security Considerations

### In Place ✅
- JWT tokens in SecureStore (encrypted)
- HTTPS for all API calls
- Auto-logout on 401
- No sensitive data in logs

### TODO
- Certificate pinning
- Biometric authentication (Face/Touch ID)
- Request signing (HMAC)
- Rate limiting
- Session timeout

---

## 📊 Success Metrics

### Q2 2026 Target
- ✅ 100% feature parity with web (booking flow)
- ✅ < 3 second app startup
- ✅ 0 crashes on internal testing
- ✅ User survey score > 4/5
- ✅ 1000+ beta testers

### Q3 2026 Target (Post-Launch)
- 50,000+ downloads (first month)
- 4.0+ rating on both stores
- < 0.1% crash rate
- < 15 minute average session
- 20% booking completion rate

---

## 📚 Documentation & Resources

### Team Resources
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

### Project Docs
- [apps/mobile/README.md](./apps/mobile/README.md) - Dev setup
- [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) - Testing workflows
- [FILE_CHANGES_REFERENCE.md](./FILE_CHANGES_REFERENCE.md) - API endpoints

---

## ✅ Getting Started Checklist

### For New Team Member
- [ ] Read this document (30 min)
- [ ] Install Node.js 18+ and npm
- [ ] Read [apps/mobile/README.md](./apps/mobile/README.md) (20 min)
- [ ] Clone repository
- [ ] Run `npm install` in `apps/mobile/`
- [ ] Run `npm run dev` and test on simulator
- [ ] Read TypeScript types in `lib/types/index.ts`
- [ ] Review `lib/api/client.ts` (API integration)
- [ ] Review `app/_layout.tsx` (auth flow)
- [ ] Pick a feature and start coding!

**Total Onboarding Time:** 2-3 hours

---

## 🆘 Common Issues & Solutions

### Issue: Expo Go doesn't connect
**Solution:** 
```bash
# Ensure you're on same WiFi
npm run dev
# Use tunnel mode if on cellular
npm run dev -- --tunnel
```

### Issue: TypeScript errors in editor
**Solution:**
```bash
# Restart TypeScript service
# In VS Code: Cmd+Shift+P → TypeScript: Restart TS Server
```

### Issue: Paystack integration not working
**Solution:**
```bash
# Check .env has correct EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY
# Verify test credentials vs prod
# Check network in Expo DevTools
```

### Issue: App crashes on payment
**Solution:**
```bash
# Use `npm run dev` to see console logs
# Check Paystack library version matches RN version
# Verify Webview is properly configured
```

---

## 📞 Support & Communication

### Reporting Issues
1. Check [common issues](#-common-issues--solutions) above
2. Search GitHub issues with `[MOBILE]` tag
3. Create new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Device/OS/app version
   - Screenshots/videos

### Communication Channels
- **Discord:** #mobile-dev channel
- **Weekly:** Mobile sync meeting (Tuesdays 10 AM)
- **Urgent:** Slack #hostelgh-critical

---

## 🎓 Quick Tutorials

### Tutorial 1: Adding a New Screen (10 min)

```typescript
// 1. Create file: app/explore/search.tsx

import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">Search Screen</Text>
      </View>
    </SafeAreaView>
  );
}

// 2. Route auto-created at /explore/search ✨
// 3. Navigate via: router.push('/explore/search')
```

### Tutorial 2: Making an API Call (10 min)

```typescript
// In a component:
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api/client';

export default function HostelsScreen() {
  const { data: hostels, isLoading } = useQuery(
    ['hostels'],
    () => apiClient.getHostels()
  );

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      {hostels?.map((h) => (
        <Text key={h.id}>{h.name}</Text>
      ))}
    </View>
  );
}
```

---

## 🚀 Summary

**You now have:**
1. ✅ Complete project structure for mobile development
2. ✅ All core screens (auth, explore, bookings, profile)
3. ✅ API client with type safety
4. ✅ State management setup
5. ✅ Development guide & documentation
6. ✅ Deployment roadmap (Q3 2026 launch)

**Next Steps:**
1. Review [apps/mobile/README.md](./apps/mobile/README.md)
2. Set up your development environment
3. Run `npm run dev` and test on simulator
4. Start implementing features from the roadmap

**Questions?** Refer to troubleshooting above or contact team lead.

---

**Status:** 🟢 Ready for Development  
**Last Updated:** February 24, 2026
