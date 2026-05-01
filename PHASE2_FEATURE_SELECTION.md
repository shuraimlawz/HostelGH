# Phase 2 Feature Selection & Implementation Roadmap

## Executive Summary

Four major feature options for Phase 2 development. Each builds on the Phase 1 bank payment foundation. Selection should consider: Ghana market demand, time investment, technical complexity, revenue impact, and team capacity.

---

## Option 1: Mobile Money Integration ⭐ RECOMMENDED

### Overview
Implement MTN Mobile Money, Vodafone Cash, and AirtelTigo Money as payment methods. Critical for Ghana market penetration.

### Strategic Value
- **Market Demand:** 🟢🟢🟢 CRITICAL - 60%+ of Ghanaians use mobile money
- **Revenue Impact:** High - Removes friction for 18M+ mobile money users
- **Competitive Advantage:** Differentiates from international booking platforms
- **User Satisfaction:** Highest - Preferred payment method in Ghana

### Technical Scope

#### New Database Fields
```prisma
model Payment {
  // New fields for mobile money
  mobileMoneyProvider    String?        // MTN | VODAFONE | AIRTELTIGO
  mobileMoneyNetwork     String?        // For fallback identification
  mobileMoneyReference   String?        // Provider transaction ID
  mobileMoneyStatus      String?        // pending | confirmed | failed
  mobileMoneyInitTime    DateTime?
  mobileMoneyConfirmTime DateTime?
  
  // Retry tracking
  mobileMoneyRetries     Int            @default(0)
  mobileMoneyLastError   String?
}

model Wallet {
  id                String @id @default(cuid())
  userId            String
  provider          String  // MTN | VODAFONE | AIRTELTIGO
  phoneNumber       String
  balance           BigInt  // In pesewas (GH₵ * 100)
  status            String  // active | suspended
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, provider])
}
```

#### New API Endpoints
```
POST   /payments/mobile-money/init              - Initiate payment
POST   /payments/mobile-money/confirm           - Confirm OTP
GET    /payments/mobile-money/status/:ref       - Check status
POST   /payments/mobile-money/wallet/balance    - Get wallet balance
POST   /payments/mobile-money/webhook           - Provider webhooks
GET    /wallets                                 - User's stored wallets
POST   /wallets                                 - Add new wallet
DELETE /wallets/:id                             - Remove wallet
```

#### New Services
```typescript
// mobile-money.service.ts
class MobileMoneyService {
  // MTN implementation
  initiateMTNPayment(amount, reference, phoneNumber): Promise<InitiationResult>
  confirmMTNOTP(reference, otp): Promise<ConfirmationResult>
  checkMTNStatus(reference): Promise<StatusResult>
  
  // Vodafone implementation
  initiateVodafonePayment(amount, reference, phoneNumber): Promise<InitiationResult>
  confirmVodafoneOTP(reference, otp): Promise<ConfirmationResult>
  checkVodafoneStatus(reference): Promise<StatusResult>
  
  // AirtelTigo implementation
  initiateAirtelPayment(amount, reference, phoneNumber): Promise<InitiationResult>
  confirmAirtelOTP(reference, otp): Promise<ConfirmationResult>
  checkAirtelStatus(reference): Promise<StatusResult>
  
  // Wallet management
  getWalletBalance(userId, provider): Promise<Balance>
  saveWallet(userId, provider, phoneNumber): Promise<Wallet>
}

// mobile-money-webhook.service.ts
class MobileMoneyWebhookService {
  handleMTNCallback(payload): Promise<void>
  handleVodafoneCallback(payload): Promise<void>
  handleAirtelCallback(payload): Promise<void>
  verifyWebhookSignature(provider, payload, signature): boolean
}
```

#### Frontend Components
```
MobileMoneySelector.tsx        - Provider selection (MTN/Vodafone/AirtelTigo)
MobileMoneyPhoneInput.tsx      - Phone number input with validation
MobileMoneyOTPForm.tsx         - OTP confirmation (6-digit input)
MobileMoneyWalletDisplay.tsx   - Show saved wallets
WalletManagement.tsx           - Add/remove/default wallet
```

#### Key Integrations
- **MTN API:** Production endpoint `https://api.mtn.momo.com/`
- **Vodafone API:** Production endpoint `https://api.vodafone.com.gh/`
- **AirtelTigo API:** Production endpoint (TBD by provider)
- **OTP Delivery:** SMS backend for OTP codes
- **Webhook Security:** HMAC-SHA256 signature verification

### Implementation Timeline
- **APIs & Services:** 15-20 hours
- **Frontend Components:** 12-15 hours
- **E2E Testing:** 8-10 hours
- **Provider Integration:** 5-8 hours (parallel with development)
- **Documentation:** 5 hours
- **Total:** 40-60 hours

### Technical Complexity: 🟠 MEDIUM-HIGH
- Multiple provider APIs with different auth patterns
- Webhook integration and signature verification
- State management for OTP confirmations
- Network error resilience and retry logic

### Phase 1 Dependencies
- ✅ Payment model extended (bankName, bankCode, etc.)
- ✅ PaymentMethod enum (includes MOBILE_MONEY)
- ✅ Payments module with DI configured
- ✅ Fee calculation system
- ✅ Webhook pattern established

### Risks & Mitigation
| Risk | Mitigation |
|------|-----------|
| Provider API delays | Start testing with sandbox APIs immediately |
| Network latency | Implement aggressive retry with exponential backoff |
| OTP expiration | Set 5-min window, allow 3 attempts per OTP |
| Fraud concerns | Rate limit to 1 attempt per phone/hour |

### Success Metrics
- 50%+ payment conversions via mobile money
- <5 second OTP delivery
- 99%+ webhook delivery success
- <2% failed payment rate

---

## Option 2: Reviews System V2

### Overview
Complete review and rating system with photo uploads, verified badges, owner responses, and moderation dashboard.

### Strategic Value
- **Market Demand:** 🟢🟢 HIGH - Critical for trust and social proof
- **Revenue Impact:** Medium - Drives booking conversions through transparency
- **Competitive Advantage:** Content differentiation (reviews with photos)
- **User Satisfaction:** High - Helps both guests and owners

### Technical Scope

#### New Database Models
```prisma
model Review {
  id            String @id @default(cuid())
  bookingId     String @unique
  booking       Booking @relation(fields: [bookingId], references: [id])
  
  // Author
  tenantId      String
  tenant        User @relation("ReviewAuthor", fields: [tenantId], references: [id])
  
  // Rating
  overallRating Float  // 1-5 stars
  cleanlinessRating Float
  comfortRating Float
  valueRating   Float
  staffRating   Float
  
  // Content
  title         String
  content       String
  isVerified    Boolean @default(false) // Verified stay
  photos        ReviewPhoto[]
  
  // Moderation
  isModerated   Boolean @default(false)
  moderatedBy   String?
  moderationReason String?
  
  // Engagement
  helpfulCount  Int @default(0)
  unhelpfulCount Int @default(0)
  
  // Response
  ownerResponse OwnerResponse?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ReviewPhoto {
  id       String @id @default(cuid())
  reviewId String
  review   Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  url      String  // S3 URL
  caption  String?
  order    Int     // Display order
  
  createdAt DateTime @default(now())
}

model OwnerResponse {
  id       String @id @default(cuid())
  reviewId String @unique
  review   Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  content  String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ReviewModeration {
  id       String @id @default(cuid())
  reviewId String
  
  flagReason String  // spam | inappropriate | fake | competitive
  flaggedBy  String  // user ID or "system"
  count      Int @default(1)
  
  isResolved Boolean @default(false)
  resolution String?
  
  createdAt DateTime @default(now())
}
```

#### New API Endpoints
```
POST   /reviews/:bookingId              - Create review (with photos)
GET    /hostels/:hostelId/reviews       - Get hostel reviews (paginated)
GET    /reviews/:reviewId               - Get single review
PATCH  /reviews/:reviewId               - Edit review (own only)
DELETE /reviews/:reviewId               - Delete review (own or admin)

POST   /reviews/:reviewId/response      - Owner response
PATCH  /reviews/:reviewId/response      - Edit response (owner only)
DELETE /reviews/:reviewId/response      - Delete response (owner or admin)

POST   /reviews/:reviewId/flag          - Flag for moderation
GET    /admin/reviews/moderation        - Moderation queue
PATCH  /admin/reviews/:reviewId/approve - Approve review
PATCH  /admin/reviews/:reviewId/reject  - Reject review

POST   /reviews/:reviewId/helpful       - Mark helpful
DELETE /reviews/:reviewId/helpful       - Remove helpful mark

POST   /reviews/upload                  - Upload photos (multipart)
GET    /reviews/analytics               - Review statistics
```

#### Frontend Components
```
ReviewForm.tsx                    - Create/edit review with star ratings
PhotoUploadZone.tsx              - Drag-drop photo upload
ReviewCard.tsx                   - Display single review with photos
ReviewsList.tsx                  - Paginated list of reviews
OwnerResponseBox.tsx             - Owner response section
ReviewModeration.tsx             - Admin moderation interface
ReviewAnalytics.tsx              - Ratings breakdown charts
```

#### Key Features
- Photo upload to S3/Cloudinary with optimization
- Star rating breakdown visualization
- Verified stay badge (automatic after checkout)
- Owner response with email notification
- Flagging system with admin dashboard
- Helpful/Unhelpful voting
- Rich text editor for review content
- Photo moderation (blur inappropriate content)

### Implementation Timeline
- **Database & Migrations:** 5 hours
- **Backend Endpoints:** 20-25 hours
- **Photo Upload Service:** 8-10 hours
- **Frontend Components:** 15-18 hours
- **Admin Moderation UI:** 10-12 hours
- **E2E Testing:** 10-12 hours
- **Total:** 50 hours

### Technical Complexity: 🟠 MEDIUM
- Photo upload and optimization (Cloudinary/S3 integration)
- Rating aggregation and analytics
- Moderation queue workflow
- Pagination and search optimization

### Phase 1 Dependencies
- ✅ Booking model complete
- ✅ User authentication established
- ✅ Notifications system working

### Success Metrics
- 30%+ of guests leave reviews
- <2% flagged reviews (low spam)
- Average rating display across hostels
- Owner response rate >50%

---

## Option 3: Disputes & Refunds System

### Overview
Implement dispute resolution, refund workflows, and admin mediation for booking conflicts.

### Strategic Value
- **Market Demand:** 🟢 HIGH - Essential for trust and legal compliance
- **Revenue Impact:** Medium - Protects platform from fraud, builds trust
- **Competitive Advantage:** Transparent dispute process attracts cautious users
- **User Satisfaction:** Medium - Necessary but not loved feature

### Technical Scope

#### New Database Models
```prisma
model Dispute {
  id            String @id @default(cuid())
  bookingId     String
  booking       Booking @relation(fields: [bookingId], references: [id])
  
  // Initiator
  initiatorId   String
  initiatorRole String  // TENANT | OWNER | ADMIN
  
  // Issue
  reason        String  // cancellation_mismatch | room_quality | property_damage | etc.
  description   String
  evidence      DisputeEvidence[]
  
  // Status
  status        String  // opened | responded | resolved | escalated
  priority      String  // low | medium | high | critical
  
  // Resolution
  resolution    String?
  refundAmount  BigInt?
  resolvedBy    String? // Admin ID
  resolvedAt    DateTime?
  
  // Timeline
  createdAt     DateTime @default(now())
  responseDeadline DateTime
  resolutionDeadline DateTime
  
  updates       DisputeUpdate[]
}

model DisputeEvidence {
  id        String @id @default(cuid())
  disputeId String
  dispute   Dispute @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  
  type      String  // photo | video | text | receipt
  url       String  // S3 URL for media
  content   String? // For text evidence
  
  uploadedBy String
  createdAt DateTime @default(now())
}

model DisputeUpdate {
  id        String @id @default(cuid())
  disputeId String
  dispute   Dispute @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  
  updatedBy String
  action    String  // opened | responded | admin_assigned | resolved | escalated
  message   String?
  
  createdAt DateTime @default(now())
}

model Refund {
  id        String @id @default(cuid())
  paymentId String @unique
  payment   Payment @relation(fields: [paymentId], references: [id])
  
  amount    BigInt  // Amount refunded
  reason    String
  
  status    String  // pending | processing | completed | failed
  
  processedAt DateTime?
  completedAt DateTime?
  
  createdAt DateTime @default(now())
}
```

#### New API Endpoints
```
POST   /disputes/:bookingId              - Create dispute
GET    /disputes                         - List user's disputes
GET    /disputes/:disputeId              - Get dispute details
PATCH  /disputes/:disputeId/respond      - Add response message
POST   /disputes/:disputeId/evidence     - Upload evidence

GET    /admin/disputes                   - Admin dispute queue (paginated)
GET    /admin/disputes/analytics         - Dispute statistics
PATCH  /admin/disputes/:disputeId/assign - Assign to admin
PATCH  /admin/disputes/:disputeId/resolve - Admin resolution
PATCH  /admin/disputes/:disputeId/escalate - Escalate dispute

POST   /refunds/:paymentId               - Request refund
GET    /refunds                          - List user's refunds
GET    /admin/refunds                    - Admin refund queue
PATCH  /admin/refunds/:refundId/process  - Process refund
PATCH  /admin/refunds/:refundId/complete - Mark complete
```

#### Frontend Components
```
DisputeForm.tsx                   - Create new dispute
DisputeTimeline.tsx               - Show dispute timeline
EvidenceUpload.tsx                - Upload photos/docs as evidence
DisputeCard.tsx                   - Display dispute status
DisputeChat.tsx                   - Message thread with admin
AdminDisputeQueue.tsx             - Admin dispute dashboard
RefundStatusDisplay.tsx           - Show refund progress
```

#### Key Features
- Dispute categories with templates
- Evidence upload (photos, documents)
- Automated workflows (escalate if no response in 48h)
- Admin assignment and case management
- Automated refund processing
- Timeline/audit log of all actions
- Email notifications at each step
- Refund status tracking

### Implementation Timeline
- **Database & Migrations:** 6 hours
- **Backend Services:** 25-30 hours
- **Frontend Components:** 12-15 hours
- **Admin Dashboard:** 12-15 hours
- **Refund Processing:** 8-10 hours
- **E2E Testing:** 10-12 hours
- **Total:** 60 hours

### Technical Complexity: 🟠 MEDIUM-HIGH
- Multi-step approval workflows
- Automatic escalation based on time
- Refund processor (payment gateway integration)
- Timeline/versioning of changes

### Phase 1 Dependencies
- ✅ Payment model complete
- ✅ Booking model with status tracking
- ✅ User authentication and roles

### Success Metrics
- <2% of bookings result in disputes
- 90% of disputes resolved within 7 days
- <0.5% refund fraud rate
- 80%+ user satisfaction with process

---

## Option 4: iOS Native App

### Overview
Native iOS app (SwiftUI) with offline capabilities, push notifications, and App Store deployment.

### Strategic Value
- **Market Demand:** 🟢 MEDIUM-HIGH - iOS users tend to spend more
- **Revenue Impact:** High - Mobile-first market, direct bookings
- **Competitive Advantage:** Platform expansion, brand presence
- **User Satisfaction:** High - Native performance and UX

### Technical Scope

#### Technology Stack
```
Framework:    SwiftUI (iOS 15+)
Backend:      Combine for async/await
Database:     Core Data + CloudKit sync
Networking:   URLSession with custom interceptors
Auth:         Keychain for JWT storage
Payments:     Paystack SDK + native bank integration
```

#### Core Features
```
Authentication
  - Google OAuth
  - Phone + OTP (Firebase Auth)
  - Face ID / Touch ID biometrics
  - Session persistence

Browsing
  - Hostel list with map view
  - Filters (price, date, amenities)
  - Hostel detail pages
  - Photo gallery with zoom
  - Reviews display

Booking
  - Calendar date picker
  - Room selection
  - Guest management
  - Payment flow (card/bank/mobile money)
  - Booking confirmation

User Profile
  - Profile management
  - Saved places
  - Booking history
  - Wishlist
  - Notifications
  - Account settings

Admin (Owner Dashboard)
  - Hostel management
  - Room inventory
  - Booking approvals
  - Payment tracking
  - Analytics dashboard
```

#### Project Structure
```
HostelGH-iOS/
  HostelGHApp.swift
  Models/
    Hostel.swift
    Booking.swift
    User.swift
    Payment.swift
  ViewModels/
    HostelListViewModel.swift
    BookingViewModel.swift
    AuthViewModel.swift
  Views/
    Auth/
      LoginView.swift
      SignupView.swift
    Hostels/
      HostelListView.swift
      HostelDetailView.swift
    Bookings/
      BookingFormView.swift
      BookingConfirmationView.swift
    Profile/
      ProfileView.swift
  Services/
    APIService.swift
    AuthService.swift
    BookingService.swift
  Utilities/
    Constants.swift
    Extensions.swift
```

#### New Backend Endpoints (for mobile)
```
GET    /api/v2/hostels           - Mobile-optimized list
POST   /api/v2/search            - Advanced search
GET    /api/v2/hostels/:id       - Hostel with all relations
POST   /api/v2/bookings          - Create booking (mobile)
GET    /api/v2/bookings          - User's bookings
POST   /api/v2/payments/init     - Mobile payment init
```

### Implementation Timeline
- **Project Setup & Config:** 5 hours
- **Authentication UI:** 12-15 hours
- **Hostel Browsing:** 18-20 hours
- **Booking Flow:** 25-30 hours
- **Payment Integration:** 15-18 hours
- **Profile & Settings:** 12-15 hours
- **Admin Features:** 20-25 hours
- **Testing & Optimization:** 15-20 hours
- **App Store Submission:** 5-8 hours
- **Total:** 120+ hours

### Technical Complexity: 🔴 HIGH
- SwiftUI state management
- Offline capabilities and sync
- App Store deployment process
- Platform-specific testing
- Native payment integrations

### Phase 1 Dependencies
- ✅ All backend APIs available
- ✅ JWT authentication working
- ✅ Webhook system established

### Timeline & Launch
- **Development:** 8-12 weeks
- **Testing:** 2 weeks
- **App Store Submission:** 1-2 weeks
- **Target Launch:** Q3 2026

### Success Metrics
- 10,000+ downloads in first month
- 4.5+ star App Store rating
- 40%+ DAU retention
- 30%+ of bookings from app

---

## Recommendation Matrix

| Factor | Mobile Money | Reviews V2 | Disputes | iOS App |
|--------|-------------|-----------|----------|---------|
| Time Investment | 40-60h | 50h | 60h | 120h+ |
| Market Impact | 🟢🟢🟢 | 🟢🟢 | 🟢 | 🟢🟢 |
| Technical Complexity | 🟠 Medium-High | 🟠 Medium | 🟠 Medium-High | 🔴 High |
| Revenue Impact | 🟢 Direct | 🟡 Indirect | 🟢 Risk Mitigation | 🟢 Direct |
| Team Capacity | 2-3 devs | 2-3 devs | 2-3 devs | 3-4 devs |
| Dependencies | Medium | Low | Low | High |
| Urgency | 🔴 Critical | 🟠 High | 🟠 High | 🟡 Medium |

---

## Recommendation

### 🏆 **PRIMARY: Option 1 - Mobile Money Integration (RECOMMENDED)**

**Why:**
1. **Market Critical:** 60%+ of Ghanaians use mobile money; currently impossible without it
2. **Time Efficient:** 40-60 hours vs 60-120 hours for other options
3. **Revenue Multiplier:** Immediately increases conversion rate by 30-40%
4. **Competitive Edge:** Most international platforms don't support local payment methods
5. **Team Fit:** Medium complexity, 2-3 devs, 2-3 weeks

**Implementation Plan:**
- Week 1: API integration with MTN and Vodafone (sandbox)
- Week 2: OTP flow, webhook handling, retry logic
- Week 3: Frontend components, testing, production cutover

---

### 🥈 **SECONDARY: Option 2 - Reviews V2 (POST Mobile Money)**

**Why:**
- Builds trust for increased conversion post-mobile money
- 50 hours (manageable)
- Can be done in parallel by second team while mobile money in production

---

### 🥉 **TERTIARY: Option 3 - Disputes (POST Reviews)**

**Why:**
- Ensures platform resilience as booking volume increases
- Protects revenue from fraud/chargebacks
- 60 hours

---

### ⏳ **FUTURE: Option 4 - iOS App (Q3 2026)**

**Why:**
- Significant time investment (120+ hours)
- Do after Phase 2 stabilizes
- Requires app store approval processes
- Can be outsourced if needed

---

## Next Steps

1. **User Decision:** Select one of the four options above
2. **Team Planning:** Assign developers, estimate timeline
3. **Specification:** Detailed implementation spec for selected feature
4. **Development:** Begin phase 2

---

**Document Version:** 1.0  
**Date:** May 1, 2026  
**Status:** Ready for Review & Selection
