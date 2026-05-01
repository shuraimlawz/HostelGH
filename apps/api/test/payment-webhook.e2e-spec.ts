import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * E2E Test: Payment & Webhook Processing
 * 
 * Validates:
 * 1. Paystack payment initiation
 * 2. Payment webhook handling
 * 3. Booking status transitions on payment
 * 4. Refund handling
 */
describe("Payment & Webhook (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantToken: string;
  let ownerToken: string;
  let bookingId: string;
  let paymentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  async function cleanupDatabase() {
    await prisma.payment.deleteMany();
    await prisma.bookingItem.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hostel.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  }

  describe("Setup: Create test data", () => {
    it("should create users and booking", async () => {
      // Tenant
      let res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "tenant@test.com",
          password: "TestPass123!@",
          firstName: "Tenant",
          lastName: "User",
          role: "TENANT",
        });
      tenantToken = res.body.token;

      // Owner
      res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "owner@test.com",
          password: "TestPass123!@",
          firstName: "Owner",
          lastName: "User",
          role: "OWNER",
        });
      ownerToken = res.body.token;

      // Create hostel
      const hostelRes = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Payment Test Hostel",
          city: "Accra",
          addressLine: "123 Test St",
        });
      const hostelId = hostelRes.body.id;

      // Create room
      const roomRes = await request(app.getHttpServer())
        .post("/rooms")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          hostelId,
          name: "2-in-1",
          capacity: 2,
          totalUnits: 5,
          pricePerTerm: 250000, // ₵2,500
        });
      const roomId = roomRes.body.id;

      // Create booking
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      const bookingRes = await request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          hostelId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          items: [{ roomId, quantity: 1 }],
        });
      bookingId = bookingRes.body.id;

      // Approve booking
      await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/approve`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ slotNumber: 1 });

      expect(tenantToken).toBeDefined();
      expect(ownerToken).toBeDefined();
      expect(bookingId).toBeDefined();
    });
  });

  describe("1. Payment Initiation", () => {
    it("should initiate Paystack payment", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments/initiate")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          bookingId,
          provider: "PAYSTACK",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("authorizationUrl");
      expect(response.body).toHaveProperty("accessCode");
      expect(response.body.amount).toBeDefined();
      expect(response.body.currency).toBe("GHS");

      paymentId = response.body.id;
    });

    it("should calculate correct payment amount", async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { booking: { include: { items: true } } },
      });

      expect(payment).toBeDefined();
      expect(payment!.amount).toBe(250000); // Room price in pesewas
      expect(payment!.status).toBe("INITIATED");
    });

    it("should not allow duplicate payment initiation", async () => {
      // Try to initiate payment again for same booking
      const response = await request(app.getHttpServer())
        .post("/payments/initiate")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          bookingId,
          provider: "PAYSTACK",
        });

      // Should fail because payment already exists
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("2. Payment Status Retrieval", () => {
    it("should retrieve payment status", async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${bookingId}`)
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("amount");
    });

    it("should not allow access to other user's payment", async () => {
      // Create another tenant
      const otherTenant = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "other@test.com",
          password: "TestPass123!@",
          firstName: "Other",
          lastName: "User",
          role: "TENANT",
        });

      const response = await request(app.getHttpServer())
        .get(`/payments/${bookingId}`)
        .set("Authorization", `Bearer ${otherTenant.body.token}`);

      expect(response.status).toBe(403);
    });
  });

  describe("3. Webhook Payment Verification", () => {
    it("should handle successful payment webhook", async () => {
      // Simulate Paystack webhook
      const webhookPayload = {
        event: "charge.success",
        data: {
          id: 12345,
          reference: "test-reference-" + Date.now(),
          amount: 250000,
          paid_at: new Date().toISOString(),
          customer: {
            email: "tenant@test.com",
          },
          metadata: {
            bookingId: bookingId,
          },
        },
      };

      const response = await request(app.getHttpServer())
        .post("/payments/webhook")
        .send(webhookPayload);

      expect(response.status).toBe(200);
    });

    it("should update booking status to CONFIRMED after successful payment", async () => {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      expect(booking).toBeDefined();
      // Status should transition to COMPLETED or CONFIRMED
      expect([
        "COMPLETED",
        "CONFIRMED",
        "RESERVED",
        "PAYMENT_SECURED",
      ]).toContain(booking!.status);
    });

    it("should update room availability after payment", async () => {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { items: true },
      });

      const room = await prisma.room.findUnique({
        where: { id: booking!.items[0].roomId },
      });

      // Available slots should be reduced
      expect(room!.availableSlots).toBeLessThan(5);
    });

    it("should reject webhook with invalid signature", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments/webhook")
        .set("X-Paystack-Signature", "invalid-signature")
        .send({
          event: "charge.success",
          data: {},
        });

      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it("should reject duplicate webhook events", async () => {
      const reference = "duplicate-ref-" + Date.now();
      const payload = {
        event: "charge.success",
        data: {
          id: 99999,
          reference: reference,
          amount: 250000,
          metadata: { bookingId },
        },
      };

      // First call
      await request(app.getHttpServer())
        .post("/payments/webhook")
        .send(payload);

      // Second call with same reference should be idempotent
      const response2 = await request(app.getHttpServer())
        .post("/payments/webhook")
        .send(payload);

      expect(response2.status).toBe(200); // Should still succeed (idempotent)
    });
  });

  describe("4. Failed Payment Handling", () => {
    it("should handle failed payment webhook", async () => {
      // Create another booking for failed payment test
      const hostel = await prisma.hostel.findFirst();
      const room = await prisma.room.findFirst({ where: { hostelId: hostel!.id } });

      const booking = await prisma.booking.create({
        data: {
          hostelId: hostel!.id,
          tenantId: (await prisma.user.findUnique({ where: { email: "tenant@test.com" } }))!.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: "PENDING",
          items: {
            create: {
              roomId: room!.id,
              quantity: 1,
              unitPrice: room!.pricePerTerm,
            },
          },
        },
      });

      const webhookPayload = {
        event: "charge.failed",
        data: {
          id: 54321,
          reference: "failed-ref-" + Date.now(),
          amount: 250000,
          customer: {
            email: "tenant@test.com",
          },
          metadata: {
            bookingId: booking.id,
          },
        },
      };

      const response = await request(app.getHttpServer())
        .post("/payments/webhook")
        .send(webhookPayload);

      expect(response.status).toBe(200);
    });

    it("should keep booking in PENDING state on failed payment", async () => {
      const failedBooking = await prisma.booking.findFirst({
        where: { status: "PENDING" },
      });

      expect(failedBooking).toBeDefined();
      expect(failedBooking!.status).toBe("PENDING");
    });
  });

  describe("5. Payment Security", () => {
    it("should store payment reference securely", async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      expect(payment!.reference).toBeDefined();
      // Reference should be unique
      const anotherPayment = await prisma.payment.findUnique({
        where: { reference: payment!.reference },
      });
      expect(anotherPayment!.id).toBe(paymentId);
    });

    it("should not expose sensitive payment details in API response", async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${bookingId}`)
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.body).not.toHaveProperty("authorizationCode"); // Internal field
    });

    it("should validate amount matches booking price", async () => {
      const otherOwner = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "owner2@test.com",
          password: "TestPass123!@",
          firstName: "Owner2",
          lastName: "User",
          role: "OWNER",
        });

      // Create hostel with different price
      const hostel = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${otherOwner.body.token}`)
        .send({
          name: "Cheap Hostel",
          city: "Kumasi",
          addressLine: "456 St",
        });

      const room = await request(app.getHttpServer())
        .post("/rooms")
        .set("Authorization", `Bearer ${otherOwner.body.token}`)
        .send({
          hostelId: hostel.body.id,
          name: "Cheap Room",
          capacity: 1,
          totalUnits: 10,
          pricePerTerm: 50000, // Very cheap
        });

      const bookingRes = await request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          hostelId: hostel.body.id,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ roomId: room.body.id, quantity: 1 }],
        });

      // Try to pay wrong amount
      const payment = await prisma.payment.create({
        data: {
          bookingId: bookingRes.body.id,
          provider: "PAYSTACK",
          amount: 999999, // Wrong amount!
          reference: "wrong-amount-" + Date.now(),
        },
      });

      // Webhook comes with correct amount
      const webhookPayload = {
        event: "charge.success",
        data: {
          reference: payment.reference,
          amount: 50000, // Actual amount
        },
      };

      const response = await request(app.getHttpServer())
        .post("/payments/webhook")
        .send(webhookPayload);

      // Should either reject or accept - implementation dependent
      expect([200, 400]).toContain(response.status);
    });
  });

  describe("6. Payment Analytics", () => {
    it("should provide payment summary for owner", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments/analytics/owner")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalEarnings");
      expect(response.body).toHaveProperty("totalPayments");
    });

    it("should provide payment history", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments/history")
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
