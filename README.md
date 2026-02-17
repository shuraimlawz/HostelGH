# HostelGH: Enterprise-Grade Hostel Management System

HostelGH is a sophisticated, high-performance ecosystem designed for the modern tertiary education housing market. It provides an end-to-end solution for property management, automated financial settlements, and secure tenant booking workflows.

## 🚀 Advanced Tech Stack

| Layer           | Technologies                                 |
| --------------- | -------------------------------------------- |
| **Frontend**    | React (Next.js), TypeScript, Tailwind CSS, Lucide |
| **Backend**     | NestJS (Node.js), TypeScript, Prisma ORM     |
| **Cloud & Ops** | Vercel, Cloudinary, Docker, NGINX (Roadmap to AWS) |
| **Data & Core** | PostgreSQL, Redis (Caching), Paystack (Finance) |

> [!NOTE]
> We are currently evolving our infrastructure towards a distributed microservices model to support future scale using technologies like Kafka, Airflow, and Hadoop for data orchestration.

## 🛠️ Core Capabilities

### 🏛️ Architecture & Security
- **JWT-Based Auth**: Secure registration, login, and token rotation (hashed).
- **RBAC**: Multi-tenant Role-Based Access Control (Admin, Owner, Tenant).
- **Hardened Edge**: Integrated **Helmet**, **Rate Limiting**, and strict **Validation Pipes**.
- **Observability**: Centralized error handling and structured logging.

### 🏠 Property & Inventory Control
- **Dynamic Listings**: Full property management with intelligent city-based searching and university proximity filtering.
- **Inventory Engine**: Granular room/bed management with pricing and gender-specific controls.

### 💳 Financial Infrastructure
- **Automated Settlement**: Integrated **Paystack Subaccounts** for 5/95 revenue splitting between platform and owners.
- **Instant Wallets**: Real-time balance tracking and settlement history.
- **Idempotency**: Webhook protection with HMAC verification to ensure zero double-spend.

## 📦 Distribution & Scaling

### 1. Development Environment
```bash
npm install
npm run start:dev
```

### 2. Database & Migrations
```bash
npx prisma migrate dev
npm run seed
```

### 3. Containerization
We provide multi-stage Docker builds for consistent deployment across environments.
```bash
docker-compose up --build
```

---

## 📈 Strategic Roadmap
Our engineering team is focused on continuous improvement towards a resilient enterprise architecture:
- **Phase 1**: Redis-backed session management for zero-latency auth.
- **Phase 2**: Event-driven architecture using Kafka for high-volume notification streams.
- **Phase 3**: AWS (EC2/RDS) migration for mission-critical reliability.
- **Phase 4**: Big Data analytics using Hadoop/Presto for market trend forecasting.

---
© 2026 HostelGH Engineering. All rights reserved.
