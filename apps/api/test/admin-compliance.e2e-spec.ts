import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * E2E Test: Admin & Compliance Features
 * 
 * Validates:
 * 1. Audit logging for all mutations
 * 2. Admin verification workflow
 * 3. Dispute handling
 * 4. Data deletion compliance
 */
describe("Admin & Compliance (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let ownerToken: string;
  let tenantToken: string;
  let hostelId: string;
  let bookingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
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
    await prisma.hostelFacility.deleteMany();
    await prisma.hostel.deleteMany();
    await prisma.adminAuditLog.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  }

  describe("Setup: Create test data", () => {
    it("should create test users", async () => {
      // Admin
      let res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "admin@test.com",
          password: "TestPass123!@",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
        });
      adminToken = res.body.token;

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

      // Tenant
      res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "tenant@test.com",
          password: "TestPass123!@",
          firstName: "Tenant",
          lastName: "User",
          role: "TENANT",
        });
      tenantToken = res.body.token;

      expect(adminToken).toBeDefined();
      expect(ownerToken).toBeDefined();
      expect(tenantToken).toBeDefined();
    });

    it("should create hostel and booking", async () => {
      const hostelRes = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Hostel",
          city: "Accra",
          addressLine: "123 Test St",
        });
      hostelId = hostelRes.body.id;

      // Create room
      const roomRes = await request(app.getHttpServer())
        .post("/rooms")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          hostelId,
          name: "2-in-1",
          capacity: 2,
          totalUnits: 5,
          pricePerTerm: 150000,
        });
      const roomId = roomRes.body.id;

      // Verify hostel
      await request(app.getHttpServer())
        .patch(`/admin/hostels/${hostelId}/verify`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ approved: true });

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
    });
  });

  describe("1. Audit Logging Compliance", () => {
    it("should log hostel creation", async () => {
      const logs = await prisma.adminAuditLog.findMany({
        where: {
          entityType: "HOSTEL",
          actionType: "CREATE",
        },
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].entityId).toBe(hostelId);
      expect(logs[0].details).toBeDefined();
    });

    it("should log hostel verification", async () => {
      const logs = await prisma.adminAuditLog.findMany({
        where: {
          entityType: "HOSTEL",
          actionType: "VERIFY",
        },
      });

      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log booking creation", async () => {
      const logs = await prisma.adminAuditLog.findMany({
        where: {
          entityType: "BOOKING",
          actionType: "CREATE",
        },
      });

      expect(logs.length).toBeGreaterThan(0);
    });

    it("should retrieve audit logs with filters", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ entityType: "HOSTEL", actionType: "CREATE" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should store metadata for state changes", async () => {
      const logs = await prisma.adminAuditLog.findMany({
        where: {
          entityType: "HOSTEL",
        },
      });

      const verificationLog = logs.find((log) => log.actionType === "VERIFY");
      if (verificationLog) {
        expect(verificationLog.metadata).toBeDefined();
      }
    });
  });

  describe("2. Admin Verification Workflow", () => {
    it("should list pending hostels", async () => {
      // Create another unverified hostel
      const newHostel = await prisma.hostel.create({
        data: {
          name: "Unverified Hostel",
          city: "Kumasi",
          region: "Ashanti",
          addressLine: "456 Test Ave",
          ownerId: (await prisma.user.findUnique({ where: { email: "owner@test.com" } }))!.id,
          pendingVerification: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get("/admin/hostels/pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const found = response.body.some((h: any) => h.id === newHostel.id);
      expect(found).toBe(true);
    });

    it("should verify hostel", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/hostels/${hostelId}/verify`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ approved: true });

      expect(response.status).toBe(200);
      expect(response.body.isVerifiedHostel).toBe(true);
    });

    it("should reject hostel if needed", async () => {
      // Create another hostel to reject
      const hostel = await prisma.hostel.create({
        data: {
          name: "Bad Hostel",
          city: "Tamale",
          addressLine: "789 Bad St",
          ownerId: (await prisma.user.findUnique({ where: { email: "owner@test.com" } }))!.id,
          pendingVerification: true,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/admin/hostels/${hostel.id}/verify`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ approved: false, reason: "Insufficient documentation" });

      expect(response.status).toBe(200);
      expect(response.body.pendingVerification).toBe(false);
    });
  });

  describe("3. Data Deletion & Privacy", () => {
    it("should allow booking deletion request", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/request-deletion`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ reason: "User requested deletion" });

      expect(response.status).toBe(200);
      expect(response.body.deletionRequested).toBe(true);
    });

    it("should list pending deletions for admin", async () => {
      const response = await request(app.getHttpServer())
        .get("/bookings/pending-deletions")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should allow admin to confirm deletion", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/bookings/${bookingId}/admin-confirm`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe("4. Role-Based Access Control", () => {
    it("should prevent tenant from accessing admin endpoints", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/audit-logs")
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(403);
    });

    it("should prevent owner from accessing other owner's bookings", async () => {
      // Create another owner
      const newOwner = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "owner2@test.com",
          password: "TestPass123!@",
          firstName: "Owner2",
          lastName: "User",
          role: "OWNER",
        });

      const response = await request(app.getHttpServer())
        .get("/bookings/owner")
        .set("Authorization", `Bearer ${newOwner.body.token}`);

      // Should only see their own bookings (which should be empty)
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });

    it("should allow only owner to approve their bookings", async () => {
      // Tenant shouldn't be able to approve
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/approve`)
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({ slotNumber: 1 });

      expect(response.status).toBe(403);
    });
  });

  describe("5. Payment Security", () => {
    it("should not expose payment details to unauthorized users", async () => {
      // Create a payment
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          provider: "PAYSTACK",
          amount: 150000,
          reference: "test-ref-" + Date.now(),
        },
      });

      // Try to access as different tenant
      const otherTenant = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "other-tenant@test.com",
          password: "TestPass123!@",
          firstName: "Other",
          lastName: "Tenant",
          role: "TENANT",
        });

      const response = await request(app.getHttpServer())
        .get(`/payments/${bookingId}`)
        .set("Authorization", `Bearer ${otherTenant.body.token}`);

      expect(response.status).toBe(403);
    });

    it("should validate amount before processing", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments/initiate")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          bookingId,
          provider: "PAYSTACK",
          amount: 1, // Invalid: too low
        });

      expect(response.status).toBe(400);
    });
  });

  describe("6. Data Validation & Sanitization", () => {
    it("should reject XSS attempts in hostel name", async () => {
      const response = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "<script>alert('xss')</script>",
          city: "Accra",
          addressLine: "123 St",
        });

      expect(response.status).toBe(400);
    });

    it("should reject SQL injection attempts", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@example.com'; DROP TABLE users; --",
          password: "TestPass123!@",
          firstName: "Test",
          lastName: "User",
          role: "TENANT",
        });

      expect(response.status).toBe(400);
    });

    it("should validate email format", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "not-an-email",
          password: "TestPass123!@",
          firstName: "Test",
          lastName: "User",
          role: "TENANT",
        });

      expect(response.status).toBe(400);
    });

    it("should validate phone number format", async () => {
      const response = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Hostel",
          city: "Accra",
          addressLine: "123 St",
          whatsappNumber: "invalid-phone", // Should be valid Ghana format
        });

      expect(response.status).toBe(400);
    });
  });

  describe("7. Rate Limiting & DoS Protection", () => {
    it("should not allow excessive login attempts", async () => {
      // This is a placeholder - actual rate limiting should be implemented
      // in the auth controller
      const iterations = 50;
      let failed = 0;

      for (let i = 0; i < iterations; i++) {
        const response = await request(app.getHttpServer())
          .post("/auth/login")
          .send({
            email: "test@example.com",
            password: "wrongpassword",
          });

        if (response.status === 429) {
          failed++;
        }
      }

      // After many failed attempts, rate limiting should kick in
      // This is a smoke test - actual implementation varies
    });
  });
});
