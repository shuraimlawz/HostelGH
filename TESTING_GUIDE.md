# HostelGH API Testing Guide

This guide provides instructions on how to test the core flows of the HostelGH MVP.

## 1. Authentication
- **Register**: `POST /auth/register` with `RegisterDto`.
- **Login**: `POST /auth/login` with `LoginDto`.
- **Refresh**: `POST /auth/refresh` with `refreshToken`.
- **Logout**: `POST /auth/logout` (Requires Bearer Token).

## 2. Property Management (Owner)
- **Create Hostel**: `POST /hostels` (Requires OWNER role).
- **Add Room**: `POST /rooms/:hostelId` (Requires OWNER role).
- **Search Public**: `GET /hostels/public?city=Accra`.

## 3. Booking Flow
- **Request Booking**: `POST /bookings` (Requires TENANT role).
- **Approve Booking**: `PATCH /bookings/:id/approve` (Requires OWNER/ADMIN role).
- **Reject Booking**: `PATCH /bookings/:id/reject` (Requires OWNER/ADMIN role).

## 4. Payment Flow
- **Init Payment**: `POST /payments/paystack/init/:bookingId` (Requires TENANT/ADMIN role).
  - *Note*: Booking must be `APPROVED` first.
- **Verify Reference**: `POST /payments/paystack/verify` with `{ reference: "..." }`.
- **Webhook**: `POST /webhooks/paystack` (requires raw body and `x-paystack-signature`).

## 5. User Profile
- **Get Me**: `GET /users/me`.
- **Update Profile**: `PATCH /users/me`.

## Pre-seeded Credentials
- **Admin**: `admin@hostelbook.test` / `Password123!`
- **Owner**: `owner@hostelbook.test` / `Password123!`
- **Tenant**: `tenant@hostelbook.test` / `Password123!`

*Swagger UI is available at `/api/docs`.*
