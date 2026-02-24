# HostelGH Mobile App - Development Guide

## Setup & Development

### Prerequisites
- Node.js >= 18
- npm or yarn
- Expo Go app (on iOS/Android device or emulator)
- Backend API running (see Backend Setup section)

### Installation

```bash
cd apps/mobile
npm install --legacy-peer-deps
```

### Start Development Server

```bash
npm run dev
```

This starts the Expo Metro bundler at `exp://127.0.0.1:8081`. Scan the QR code with:
- **iOS**: Built-in Camera app → tap notification
- **Android**: Expo Go app → scan QR code

### Build for Production

```bash
# iOS
npm run build:ios

# Android  
npm run build:android

# Both platforms
npm run preview
```

## Project Structure

```
apps/mobile/
├── app/
│   ├── _layout.tsx              # Root layout with auth routing
│   ├── (auth)/                  # Auth group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (app)/                   # Authenticated app group
│       ├── _layout.tsx          # Tab navigation
│       ├── explore/
│       ├── bookings/
│       └── account/
├── lib/
│   ├── api/
│   │   └── client.ts            # Axios API client with interceptors
│   ├── stores/
│   │   └── authStore.ts         # Zustand auth state (with persist)
│   ├── auth.ts                  # Auth utilities
│   ├── constants.ts
│   ├── types/
│   └── validators.ts            # Zod schemas
├── components/                  # Reusable components
├── metro.config.js              # Metro bundler config
├── tsconfig.json                # TypeScript config (strict: false)
└── package.json
```

## API Integration

### API Client

The API client (`lib/api/client.ts`) handles all backend communication:

```typescript
import { apiClient } from '@/lib/stores/authStore';

// Authentication
await apiClient.login(email, password);
await apiClient.register(email, password, name);
await apiClient.logout();

// Hostels
const hostels = await apiClient.getHostels({ city: 'Accra' });
const hostel = await apiClient.getHostelById(id);
const rooms = await apiClient.getHostelRooms(hostelId);

// Bookings
const booking = await apiClient.createBooking(data);
const bookings = await apiClient.getBookings();
await apiClient.cancelBooking(bookingId, reason);

// User Profile
const profile = await apiClient.getProfile();
await apiClient.updateProfile(data);

// Payments
await apiClient.initializePayment(bookingId);
await apiClient.initPaystackPayment(bookingId);
```

### Environment Variables

Create `.env` file (or copy from `.env.example`):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true
```

For production:
```env
EXPO_PUBLIC_API_URL=https://api.hostelgh.com/api
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_DEBUG=false
```

## Testing

### Manual Testing Workflow

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Open in Expo Go**
   - Scan QR code with device

3. **Test Auth Flow**
   - ✅ Login with valid credentials
   - ✅ Register new user
   - ✅ Forgot password email
   - ✅ Token persists after restart

4. **Test Main Features**
   - ✅ Browse hostels by city
   - ✅ Search hostels
   - ✅ View hostel details
   - ✅ Create booking
   - ✅ View bookings list
   - ✅ Update profile

5. **Test API Integration**
   - ✅ Network requests complete successfully
   - ✅ Errors display alerts
   - ✅ Token refresh on 401 response
   - ✅ Logout on token expiry

### Debugging

```bash
# Enable React Native debugger
Press 'j' in Expo CLI

# Toggle developer menu on device
Shake device or press 'm' in Expo CLI

# View logs
npm run dev
# Logs appear in terminal
```

## Backend Setup (Required for Testing)

### Prerequisites
```bash
cd apps/api
npm install --legacy-peer-deps
```

### Configure Database

Create `.env` in root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hostelgh"
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PAYSTACK_SECRET_KEY=your_paystack_key
APP_URL=http://localhost:3000
```

### Run Migrations

```bash
npx prisma migrate deploy
```

### Start API Server

```bash
cd apps/api
npm run start:dev
# API runs at http://localhost:3000
```

## Troubleshooting

### Metro Bundler Errors

```bash
# Clear cache and restart
npm run dev

# If still failing:
rm -rf node_modules .expo
npm install --legacy-peer-deps
npm run dev
```

### API Connection Issues

1. Check backend is running: `http://localhost:3000/api/health`
2. Verify `EXPO_PUBLIC_API_URL` in `.env`
3. On Android emulator: Use `10.0.2.2` instead of `localhost`

```env
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

### TypeScript Errors

All screens use React Native `StyleSheet` for styling. No Tailwind or CSS/className support.

Common fix:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm install --legacy-peer-deps
```

## Features Implemented

### Authentication ✅
- Login / Register
- Forgot Password
- Token persistence (SecureStore)
- Auto-logout on 401

### Hostel Discovery ✅
- Browse by city filter
- Search hostels
- Star ratings & pricing display

### Bookings ✅
- Create bookings
- View booking list with status
- Cancel pending bookings
- Payment integration ready

### User Account ✅
- View profile
- Edit personal info
- Secure logout

## Next Steps

- [ ] Hostel detail screen with full info & gallery
- [ ] Booking confirmation & invoice
- [ ] Payment processing (Paystack integration)
- [ ] Push notifications
- [ ] Chat/messaging system
- [ ] Reviews & ratings
- [ ] Wishlist/favorites

## Performance Tips

- Use React Query for API data caching
- Lazy load images in lists
- Memoize expensive components with `useMemo`
- Profile with Flipper debugger

## Deployment

### iOS (via EAS)
```bash
npm run build:ios
eas submit --platform ios
```

### Android (via EAS)
```bash
npm run build:android
eas submit --platform android
```

Requires:
- EAS account setup
- Apple Developer account (iOS)
- Google Play account (Android)

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native API](https://reactnative.dev/docs/api-index)
- [Expo Router Navigation](https://docs.expo.dev/routing/introduction/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Last Updated**: February 24, 2026  
**Maintained by**: HostelGH Development Team
