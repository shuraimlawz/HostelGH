# HostelGH - Advanced Hostel Booking MVP

HostelGH is a robust, production-ready Minimum Viable Product (MVP) for managing hostel bookings, payments, and room inventory. Built with **NestJS**, **Prisma**, **PostgreSQL**, and **Paystack**.

## Features

### 🔐 Authentication & Security
- **JWT-Based Auth**: Secure registration, login, and token rotation (hashed).
- **RBAC**: Role-Based Access Control (Admin, Owner, Tenant).
- **Hardened Security**: Integrated **Helmet**, **Rate Limiting**, and strict **Validation Pipes**.
- **Centralized Errors**: Uniform error responses across all endpoints.

### 🏠 Property Management
- **Hostels**: Owners can manage their properties with public search and city-based filtering.
- **Rooms**: Granular inventory management with pricing and capacity controls.

### 📅 Booking & Availability
- **Transactional Requests**: Prevents overbooking using atomic database transactions.
- **Approval Workflow**: Owners review and approve requests before payments.

### 💳 Payments & Webhooks
- **Paystack Integration**: Full lifecycle from transaction initialization to verification.
- **Idempotent Webhooks**: Secure HMAC signature verification and double-spend protection.

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```
   *Note: Ensure `@nestjs/swagger` and `swagger-ui-express` are installed.*

2. **Database Setup**
   - Start PostgreSQL: `docker-compose up -d`
   - Run Migrations: `npx prisma migrate dev`
   - Seed Test Data: `npm run seed`

3. **Environment Variables**
   Configure the following in your `.env` file:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET` (min 16 chars)
   - `JWT_REFRESH_SECRET` (min 16 chars)
   - `PAYSTACK_SECRET_KEY`
   - `APP_URL` (optional)

4. **Run the Application**
   ```bash
   npm run start:dev
   ```

## Documentation
- **Swagger UI**: Access interactive API docs at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).
- **Testing Guide**: See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed execution steps.

## Tech Stack
- **Framework**: NestJS
- **ORM**: Prisma (PostgreSQL)
- **Payment Gateway**: Paystack
- **Security**: Passport-JWT, Bcrypt, Helmet, Throttler
- **Validation**: Joi, Class-Validator
