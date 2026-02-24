# HostelGH Ghana Booking Model - E2E Testing Guide

**Version:** 1.0  
**Date:** February 24, 2026  
**System:** Ghana Standalone Hostel Booking Model with Airbnb-quality UX

---

## Executive Summary

This document provides comprehensive testing coverage for the HostelGH Ghana standalone hostel booking system. The system allows hostel owners to list properties with multiple room types, while tenants can browse, request bookings, and complete payments via Paystack.

**Key Stakeholders:**
- **Hostel Owners/Managers**: Create hostels, manage room types, approve/reject bookings
- **Tenants/Students**: Browse hostels, create booking requests, upload KYC documents, pay via Paystack
- **Admin Users**: Verify hostels, view audit logs, manage system
- **System**: Automated tasks (payment verification, notification sending)

---

## Test Scenarios

### 1. OWNER FLOW: Create Hostel & Manage Rooms

#### 1.1 Create a New Hostel
**Actors:** Hostel Owner (User with OWNER role)

**Pre-conditions:**
- Owner is logged in
- Owner has space available (subscription limit not exceeded)

**Steps:**
1. Navigate to `/owner/hostels/new`
2. Fill in basic info:
   - Name: "Sunny Side Hostel"
   - Description: "Modern, secure hostel near KNUST campus"
   - City: "Kumasi"
   - Address: "123 Campus Ave, Kumasi"
   - University: "KNUST"
   - WhatsApp: "0244123456"
   - Distance to Campus: "5 min walk"
3. Select city/region
4. Add amenities (WiFi, AC, Laundry, Security)
5. Add utilities (water, light, gas)
6. Upload hostel images (min 1, max 10)
7. Accept terms and submit

**Expected Result:**
- Hostel created with status `PENDING_VERIFICATION` (first-time owners only)
- Subsequent hostels auto-publish
- Owner receives confirmation email at `email@example.com`
- Audit log entry created: `CREATE / HOSTEL / New property listed`
- Error handling: subscription limit exceeded, validation errors caught

**Verify:**
```
POST /hostels
- Response: { id, name, requiresVerification, ...hostel details }
- Database: Hostel record + AdminAuditLog record
```

---

#### 1.2 Owner Views Published Hostel
**Steps:**
1. Navigate to `/owner/hostels`
2. See hostel in list with status badge (if pending verification)
3. Click view button to see details
4. Verify displayed information matches input

**Expected Result:**
```
GET /hostels/my-hostels
- Returns all owner's hostels with status field
- UI shows: "Pending Verification" if pendingVerification=true
```

---

#### 1.3 Create Room Types Under Hostel
**Actors:** Hostel Owner

**Pre-conditions:**
- Hostel exists and is published (or visible to owner)

**Steps:**
1. From hostel detail, go to "Manage Rooms" section
2. Click "Add Room Type"
3. Enter room details:
   - Name: "2-in-a-Room Deluxe"
   - Description: "Spacious room with AC, en-suite, wardrobe"
   - Capacity: 2 (people per room)
   - Total Units: 10 (total rooms of this type)
   - Price Per Term: 150000 (pesewas = ₵1500.00)
   - Room Configuration: "2 per room"
   - Gender: MIXED
   - Has AC: Yes
   - Utilities Included: ["water", "light"]
4. Upload room images (optional)
5. Save

**Expected Result:**
```
POST /rooms/{hostelId}
- Response: { id, name, capacity, totalUnits, pricePerTerm, ... }
- Database: Room record created
- UI: Room appears in hostel's room list
- Availability: availableSlots = totalUnits initially
```

**Verify:**
```
GET /hostels/public/{hostelId}
- Response includes rooms array with pricing, capacity info
```

---

#### 1.4 Update Room Inventory & Pricing
**Steps:**
1. Select room from hostel management
2. Edit room details:
   - Change total units from 10 to 8 (sold some)
   - Change price from 150000 to 160000 (increase)
3. Save

**Expected Result:**
- Updated room record
- Only new bookings use new price
- Existing approved bookings keep original price (snapshot in BookingItem)

---

#### 1.5 Add Hostel Facilities (Free & Paid)
**Steps:**
1. In hostel management, go to "Facilities" section
2. Add facilities:
   - Free: "Common Kitchen", "Study Lounge", "WiFi"
   - Paid: "Laundry Service (₵5)", "Generator Access (₵2)"
3. Save

**Expected Result:**
```
POST /hostels/{hostelId}/facilities
- Request: { name, type: "FREE" | "PAID" }
- Response: { id, hostelId, name, type, createdAt }

GET /hostels/public/{hostelId}
- Response includes facilities array separated by type
```

---

### 2. PUBLIC BROWSING FLOW: Tenant Discovers Hostels

#### 2.1 Search & Filter Hostels
**Actors:** Anonymous user (not logged in)

**Steps:**
1. Navigate to `/hostels` (or `/hostels/accra`, etc.)
2. See list of published hostels with:
   - Name, city, short description
   - Min price ("From ₵1,500.00")
   - Availability indicator ("Rooms Available" if slots > 0)
   - Image/gallery
3. Filter by:
   - City: Select "Kumasi"
   - Price range: ₵1000 - ₵2000
   - University: "KNUST"
   - Amenities: select WiFi, AC, Security
4. Sort by: "Recommended", "Price: Low to High", "Newest"

**Expected Result:**
```
GET /hostels/public?city=Kumasi&minPrice=100000&maxPrice=200000&amenities=WiFi,AC
- Response: Array of hostels with:
  - id, name, city, description, minPrice
  - availability: count of available slots across all rooms
  - amenities, images
  - owner: { id, firstName, avatarUrl }
```

---

#### 2.2 View Hostel Details (Public)
**Steps:**
1. Click on hostel card to open details page: `/hostels/[id]`
2. See complete hostel information:
   - Gallery (main image + thumbnails)
   - Owner info with verification badge
   - Description
   - Utilities included (water, light, gas - with icons)
   - Common amenities (free + paid separated)
   - Booking policies text
   - WhatsApp contact with direct link
3. Room types listed with:
   - Configuration ("2 in a room", "4 in a room")
   - Gender category (MALE/FEMALE/MIXED)
   - Capacity and AC indicator
   - Available slots ("2 Slots Left" or "Full")
   - Price per person per term (₵1,500.00)
   - CTA: "Select Room"
4. Side panel shows:
   - Owner details
   - Property manager info
   - Verification badges
   - Security notice: "Only make payments via platform's Paystack portal"

**Expected Result:**
```
GET /hostels/public/{hostelId}
- Response includes:
  - Hostel details (name, description, city, amenities, etc.)
  - rooms: Array with:
    - id, name, capacity, roomConfiguration, gender
    - pricePerTerm, availableSlots
    - images, hasAC, utilitiesIncluded
  - facilities: Array[{ name, type: "FREE"|"PAID" }]
  - owner: { id, firstName, lastName, avatarUrl, phone, email }
  - policiesText
  - whatsappNumber

UI displays:
- "From ₵X,XXX.XX" (min price from rooms)
- "X Slots Available" if any room has availability
- Room cards with all above details
```

---

### 3. BOOKING FLOW: Tenant Books a Room (Multi-Step)

#### 3.1 Tenant Not Logged In - Auth Modal
**Steps:**
1. On hostel details page, click "Select Room" on any room
2. NOT logged in → Auth Modal opens
3. Options: Login or Sign Up
4. Sign up with:
   - Email: tenant@example.com
   - Password: SecurePass123
   - First Name: John
   - Last Name: Doe
5. Complete sign up → Redirected to booking modal

**Expected Result:**
- Auth context updated
- BookingModal visible after auth
- Pre-fill fields from user profile

---

#### 3.2 Booking Modal - Step A: Personal Info
**Pre-conditions:**
- User logged in or just signed up
- Room selected
- Booking modal opened

**Steps (Step A):**
1. Confirm/edit personal information:
   - First Name: "John" (prefilled)
   - Last Name: "Doe" (prefilled)
   - Email: "john@example.com" (prefilled)
   - Phone: "0244567890"
2. Enter booking dates:
   - Start Date: "2026-03-01" (first semester)
   - End Date: "2026-07-15" (end of semester)
3. Slots: 1 (default)
4. Click "Next"

**Validation:**
- All fields required
- Phone format: matches Ghana numbers (0XX... or 233XX...)
- Dates: Start < End, not in past

**Expected Result:**
- Form validates silently
- Proceeds to Step B if valid

---

#### 3.3 Booking Modal - Step B: KYC & Identity
**Steps (Step B):**
1. Fill student information:
   - Level of Study: "200 Level" (select from dropdown)
   - Guardian Name: "Jane Doe"
   - Guardian Phone: "0244567891"
2. Upload optional documents:
   - **Admission Letter/Student ID**: Click upload → select admission_letter.pdf
     - File uploaded to Cloudinary
     - URL stored in state: "https://res.cloudinary.com/..."
     - UI shows: "✓ Uploaded"
   - **Passport Photo**: Click upload → select passport.jpg
     - Same Cloudinary upload process
     - UI shows: "✓ Uploaded"
3. Leave documents blank if optional (MVP)
4. Click "Next"

**Validation:**
- Level of Study, Guardian Name, Guardian Phone required
- Documents optional (MVP)
- File upload: max 5MB per file
- Accepted types: images (jpg, png), PDFs

**Expected Result:**
- Files uploaded to Cloudinary in `hostelgh/kyc` folder
- URLs stored in component state
- Form validates and proceeds to Step C

---

#### 3.4 Booking Modal - Step C: Summary & Confirmation
**Steps (Step C):**
1. Review booking summary:
   - Guest: John Doe
   - Dates: 2026-03-01 to 2026-07-15
   - Slots: 1
   - Room: "2-in-a-Room Deluxe"
   - Total: ₵1,500.00
2. Accept terms checkbox:
   - "I agree to the hostel's booking terms and policies..."
   - Required
3. Click "Submit Booking"

**Expected Result:**
- Booking request sent to backend
- Loading state shown

---

#### 3.5 Booking Request Created (Backend)
**API Call:**
```
POST /bookings
{
  hostelId: "hostel_123",
  tenantId: "user_456",
  startDate: "2026-03-01",
  endDate: "2026-07-15",
  items: [
    { roomId: "room_789", quantity: 1 }
  ],
  levelOfStudy: "200 Level",
  guardianName: "Jane Doe",
  guardianPhone: "0244567891",
  admissionDocUrl: "https://res.cloudinary.com/...",
  passportPhotoUrl: "https://res.cloudinary.com/..."
}
```

**Backend Logic:**
1. Validate hostel exists and isPublished
2. Validate room exists and isActive
3. Check availability (no overlapping bookings):
   - Query BookingItems for same roomId
   - Filter by bookings in status: PENDING_APPROVAL, APPROVED, CONFIRMED
   - Check date overlap
   - Verify quantity doesn't exceed totalUnits
4. Create booking in transaction:
   - Booking record: status = PENDING_APPROVAL
   - BookingItem record(s): quantity and unitPrice snapshot
   - Set paymentDeadline = now + 24 hours
5. Log audit: CREATE / BOOKING / "New booking request from john@example.com"
6. Send notifications:
   - Email to owner: "New booking request for Sunny Side Hostel"
   - SMS to owner (if phone): "New booking request for Sunny Side Hostel from John Doe"

**Expected Result:**
```
Response:
{
  id: "booking_abc123",
  hostelId: "hostel_123",
  tenantId: "user_456",
  status: "PENDING_APPROVAL",
  startDate: "2026-03-01",
  endDate: "2026-07-15",
  paymentDeadline: "2026-02-25T10:00:00Z",
  items: [
    {
      id: "item_xyz",
      roomId: "room_789",
      quantity: 1,
      unitPrice: 150000
    }
  ]
}

Database:
- Booking record created with status PENDING_APPROVAL
- BookingItem record created with quantity and price snapshot
- AdminAuditLog entry: action=CREATE, entity=BOOKING

Notifications:
- Email sent to owner email
- SMS sent to owner phone (if available)
```

**Frontend Result:**
- Modal shows success screen
- Message: "Booking Request Submitted! The owner will review your booking and contact you within 24 hours."
- User can close modal
- Redirect to booking details or dashboard

---

#### 3.6 Availability Check & Conflict Prevention
**Scenario:** Multiple tenants trying to book the same room simultaneously

**Test:**
1. **Tenant A** clicks "Select Room" on "2-in-a-Room" with 2 slots
2. **Tenant B** clicks "Select Room" on SAME room
3. Both complete booking forms simultaneously
4. Both submit
5. Expected:
   - First request succeeds (slot reserved)
   - Second request fails: "Not enough availability for room... Available: 1, Requested: 1"
   - availableSlots updated only for first booking

**Verify:**
- Transaction isolation prevents double-booking
- Correct availability count reflects true capacity

---

### 4. OWNER APPROVAL FLOW

#### 4.1 Owner Views Pending Bookings
**Actors:** Hostel Owner

**Steps:**
1. Navigate to `/owner/bookings`
2. Filter by status: "PENDING_APPROVAL"
3. See list of bookings:
   - Tenant name and email
   - Room type requested
   - Dates (check-in/check-out)
   - Total price
   - Action buttons: "Approve", "Reject"
4. Click on booking to expand/view details:
   - KYC info: Level of study, Guardian name/phone
   - Documents uploaded (if any)
   - Personal info: Email, phone

**Expected Result:**
```
GET /bookings/owner
- Response: Array of bookings where hostel.ownerId = owner.id
- Includes: tenant info, room details, items, dates, payment details
- Filter by status on frontend

UI shows:
- Booking cards/table with key info
- Tenant avatar/initials
- Room name and dates
- Total amount
- Action buttons (conditional on status)
```

---

#### 4.2 Owner Approves Booking
**Steps:**
1. Owner sees pending booking from John Doe
2. Reviews details: room 2-in-a-room, dates look good
3. Clicks "Approve" button
4. (Optional) Modal for approval message (optional)
5. Confirm

**Expected Result:**
```
PATCH /bookings/{bookingId}/approve
- Response: Updated booking with status = APPROVED

Backend Logic:
1. Check booking status = PENDING_APPROVAL
2. Check authorization: actor is owner of hostel or ADMIN
3. Update room availableSlots: decrement by quantity
4. Update booking:
   - status = APPROVED
   - paymentDeadline = now + 24 hours
   - autoReleaseAt = now + 24 hours
5. Log audit: APPROVE / BOOKING
6. Send notifications:
   - Email to tenant: "Your booking for Sunny Side Hostel has been approved!"
   - SMS to tenant: "Your booking approved. Please complete payment on HostelGH within 24 hours."

Database:
- Booking.status = APPROVED
- Booking.paymentDeadline = future timestamp
- Room.availableSlots decremented (now shows 1 slot left)
- AdminAuditLog entry created
```

**Frontend:**
- Toast notification: "Booking approved! Tenant notified."
- Booking status updated in real-time
- Tenant's available payment options visible in tenant dashboard

---

#### 4.3 Owner Rejects Booking
**Steps:**
1. Owner sees another pending booking
2. Clicks "Reject"
3. Modal opens for rejection reason
4. Enters: "Room type is currently unavailable due to maintenance"
5. Confirms

**Expected Result:**
```
PATCH /bookings/{bookingId}/reject
{
  reason: "Room type is currently unavailable due to maintenance"
}

Backend Logic:
1. Check authorization
2. Validate booking.status = PENDING_APPROVAL
3. Update booking:
   - status = REJECTED
   - notes = "Rejected: ${reason}"
4. Log audit: REJECT / BOOKING with reason in metadata
5. Send notifications:
   - Email to tenant: "Your booking request has been updated. Reason: ..."
   - SMS to tenant: (optional)

Database:
- Booking.status = REJECTED
- AdminAuditLog entry with reason
```

**Frontend:**
- Toast: "Booking rejected."
- Booking removed from PENDING_APPROVAL list
- Appears in REJECTED filter if applicable

---

### 5. PAYMENT FLOW: Tenant Pays via Paystack

#### 5.1 Tenant Initiates Payment
**Pre-conditions:**
- Booking is APPROVED
- Tenant can see "Pay Now" button in booking details

**Steps:**
1. Tenant navigates to `/tenant/bookings` or viewing approved booking
2. Sees booking status: "APPROVED - Payment Due by [date]"
3. Clicks "Pay Now" button
4. Payment initialization request sent

**Expected Result:**
```
POST /payments/{bookingId}/init
- Actor: tenant (authenticated)
- Response:
{
  reference: "HB_abc123def456",
  authorizationUrl: "https://checkout.paystack.com/...",
  accessCode: "123456"
}
```

---

#### 5.2 Paystack Checkout
**Steps:**
1. Redirect to Paystack checkout page
2. Paystack displays:
   - Amount: ₵1,500.00 (from booking items)
   - Email: john@example.com
   - Reference: HB_abc123def456
3. Tenant enters payment details:
   - Card/Mobile Money method
   - OTP confirmation
4. Payment successful
5. Redirected back to app: `/payment/callback?reference=HB_abc123def456`

**Expected Result:**
```
Backend Payment Split:
- Booking total: 150,000 pesewas (₵1,500.00)
- Platform fee (5%): 7,500 pesewas
- Owner earnings: 142,500 pesewas
```

---

#### 5.3 Webhook: Payment Verified
**Event:** Paystack sends webhook for `charge.success`

**Process:**
```
POST /webhooks/paystack
{
  event: "charge.success",
  data: {
    reference: "HB_abc123def456",
    amount: 150000,
    paid_at: "2026-02-25T09:30:00Z",
    customer: { email: "john@example.com" },
    ...
  }
}

Backend Logic:
1. Verify webhook signature (HMAC SHA512)
2. Find Payment by reference
3. Check Payment.status != SUCCESS (idempotent)
4. If already SUCCESS: return 200 (idempotent)
5. If not SUCCESS:
   - Update Payment: status = SUCCESS, paidAt = now
   - Update Booking: status = CONFIRMED
   - Increment owner wallet: balance += ownerEarnings
   - Log audit: UPDATE / PAYMENT / "Payment confirmed"
   - Send notifications:
     - Email to tenant: "Payment confirmed for Sunny Side Hostel"
     - SMS to tenant: "Payment of ₵1,500.00 confirmed. Your slot is now locked."
     - Email to owner: "Payment received for booking"

Database:
- Payment.status = SUCCESS
- Payment.paidAt = timestamp
- Booking.status = CONFIRMED
- Wallet record updated with new balance
```

**Frontend:**
- Tenant sees booking status: "CONFIRMED"
- Displays check-in/check-out dates
- Payment receipt available

---

### 6. ADMIN VERIFICATION FLOW (First-Time Hostels)

#### 6.1 Admin Reviews Pending Hostels
**Actors:** Admin user (ADMIN role)

**Steps:**
1. Admin navigates to `/admin/hostels/pending` (or admin dashboard)
2. Sees list of hostels with `pendingVerification = true`
3. Reviews hostel details:
   - Name, images, description
   - Owner info
   - Room types
   - Policies
4. Can view owner's payout method

**Expected Result:**
```
GET /admin/hostels?pending=true
- Returns hostels where pendingVerification = true

UI shows:
- Hostel cards with verification badge
- Owner contact info
- Approval/Rejection action buttons
```

---

#### 6.2 Admin Approves Hostel
**Steps:**
1. Reviews hostel info (looks legitimate)
2. Clicks "Verify & Publish"
3. Optional notes field

**Expected Result:**
```
PATCH /admin/hostels/{hostelId}/verify
- Update Hostel: isPublished = true, pendingVerification = false
- Log audit: VERIFY / HOSTEL / "Hostel verified and published"
- Send email to owner: "Welcome to HostelGH! Your property is now live."

Database:
- AdminAuditLog entry with adminId
```

---

#### 6.3 Admin Rejects Hostel
**Steps:**
1. Reviews hostel (violates terms or has issues)
2. Clicks "Reject"
3. Enters rejection reason
4. Confirm

**Expected Result:**
```
PATCH /admin/hostels/{hostelId}/reject
{
  reason: "Images do not meet quality standards"
}

Backend:
- Update Hostel: isPublished = false, pendingVerification = false
- Log audit: action = "REJECT" with reason
- Email to owner with reason and resubmission instructions
```

---

### 7. AUDIT LOGGING & SECURITY

#### 7.1 Audit Log Coverage
**Verify audit logs created for:**
1. ✅ Hostel creation (CREATE / HOSTEL)
2. ✅ Hostel verification (VERIFY / HOSTEL)
3. ✅ Booking creation (CREATE / BOOKING) - should auto-log
4. ✅ Booking approval (APPROVE / BOOKING)
5. ✅ Booking rejection (REJECT / BOOKING)
6. ✅ Room type creation (CREATE / ROOM)
7. ✅ Payment confirmation (UPDATE / PAYMENT)
8. ✅ Wallet updates (UPDATE / WALLET)

**Expected Fields in each log:**
- adminId (nullable for system actions)
- actionType
- entityType
- entityId
- details (human-readable)
- metadata (JSON - before/after state)
- ipAddress
- userAgent
- createdAt

**Verify:**
```
GET /admin/audit-logs?entityType=BOOKING
- Filter by date range, entity type, action, admin
- Shows all mutations with full history
```

---

### 8. ERROR SCENARIOS & EDGE CASES

#### 8.1 Booking Availability Exhaustion
**Test:**
1. Room has 2 slots total
2. Tenant A books 1 slot → availableSlots = 1
3. Tenant B books 1 slot → availableSlots = 0
4. Tenant C tries to book 1 slot → Error: "Not enough availability"

**Expected:** 400 Bad Request with clear message

---

#### 8.2 Double-Booking Prevention
**Test:**
1. Tenant A books: March 1 - July 15
2. Tenant B tries to book same room: July 10 - August 15 (overlaps)
3. Expected: Error if slots fully booked for overlap period

---

#### 8.3 Expired Payment Window
**Test:**
1. Booking approved on Feb 25, 10:00 AM
2. paymentDeadline = Feb 26, 10:00 AM
3. Tenant tries to pay on Feb 26, 11:00 AM
4. Expected: Error or auto-release warning

**Future Enhancement:** Cron job to auto-release unpaid bookings

---

#### 8.4 Unauthorized Access
**Test:**
1. Owner A tries to approve booking for Owner B's hostel
2. Expected: 403 Forbidden
3. Admin can approve any booking

---

#### 8.5 Invalid File Uploads
**Test:**
1. Tenant tries to upload 10MB file to KYC
2. Expected: 413 Payload Too Large
3. Tenant uploads .exe file
4. Expected: 400 Bad Request - "Invalid file type"

---

### 9. FRONTEND VALIDATION & UX

#### 9.1 Form Validation
**Test:**
- Required fields show red asterisk
- Real-time validation feedback
- Submit button disabled if form invalid
- Clear error messages for each field

#### 9.2 Loading States
**Test:**
- Booking submission shows spinner with "Submitting..."
- File uploads show progress indicator
- API calls show appropriate loading UI

#### 9.3 Toast Notifications
**Test:**
- Success: "Booking submitted!" (green)
- Error: Clear error message (red)
- Info: Important updates (blue)
- Auto-dismiss after 5 seconds

---

### 10. EMAIL & NOTIFICATION CONTENT

#### 10.1 Booking Request Notification (to Owner)
**Template:** `bookingRequestedTemplate`
```
Subject: "New booking request • Sunny Side Hostel"
Body:
- Tenant name
- Room type & dates
- Contact info
- Action: "Approve/Reject on HostelGH"
```

#### 10.2 Booking Approved Notification (to Tenant)
**Template:** `bookingApprovedTemplate`
```
Subject: "Booking approved • Sunny Side Hostel"
Body:
- Congratulations message
- Check-in/check-out dates
- Payment due date
- Payment link: "Pay Now"
- WhatsApp contact for owner
```

#### 10.3 Payment Confirmed Notification (to Both)
**Template:** `paymentConfirmedTemplate`
```
To Tenant:
- Payment confirmed: ₵1,500.00
- Booking reference
- Check-in instructions
- Owner's WhatsApp

To Owner:
- Payment received: ₵1,500.00 (minus platform fee)
- Tenant info
- Check-in date
```

---

## Pre-Deployment Checklist

- [ ] All DTOs created and validated
- [ ] Backend endpoints responding correctly
- [ ] Database migrations run
- [ ] Cloudinary credentials configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- [ ] Paystack credentials configured (PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY)
- [ ] SMTP configured or Ethereal test account set up
- [ ] Frontend pages render without errors
- [ ] Auth flow working (login/signup)
- [ ] File uploads working (to Cloudinary)
- [ ] Payment flow tested (checkout redirect)
- [ ] Webhook signature verification working
- [ ] Audit logging captured for all mutations
- [ ] Email templates tested (preview URLs available)
- [ ] No console errors in browser
- [ ] Responsive design checked on mobile
- [ ] Build passes: `npm run build` (frontend) and NestJS compile
- [ ] Environment variables all set

---

## Performance & Load Testing

**Future Enhancements:**
- Load test booking creation under concurrent requests
- Database query optimization for hostel search (indexes on city, amenities)
- Caching strategy for public hostel listings
- Rate limiting on booking creation (prevent spam)
- CDN for image delivery (Cloudinary provides this)

---

## Security Checklist

- [ ] CORS properly configured
- [ ] CSRF tokens on state-changing requests
- [ ] Rate limiting enabled
- [ ] SQL Injection prevention (Prisma ORM)
- [ ] XSS prevention (React escaping + sanitization)
- [ ] Sensitive fields not logged (passwords, credit cards)
- [ ] Webhook signature verification enabled (Paystack)
- [ ] Bearer token validation on protected routes
- [ ] Role-based access control (Owner vs Tenant vs Admin)
- [ ] Audit logs track all mutations with actor info

---

## Monitoring & Observability

**Recommended:**
- Sentry for error tracking
- LogRocket for user session replay (optional)
- Database query logging for slow queries
- Payment webhook logging (detailed for debugging)
- Email delivery status monitoring (for bounce/spam issues)

---

## Known Limitations & Future Work

1. **Payment Window Auto-Release**: Currently manual. Implement cron job to auto-release unpaid bookings after 24 hours.
2. **Mobile Money**: Full Paystack Mobile Money support ready, test with MTN/Vodafone during UAT.
3. **Bulk Operations**: Owners cannot bulk-update inventory. Implement if needed.
4. **Cancellation Policy**: Static terms. Could be dynamic per hostel.
5. **Dispute Resolution**: No built-in dispute mechanism. Future feature.
6. **Referral Program**: Not included in MVP.

---

**Document Prepared By:** Development Team  
**Last Updated:** February 24, 2026  
**Status:** Ready for QA Testing
