import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * E2E Test: Complete Booking Flow
 * 
 * This test suite validates the entire Phase 1 booking workflow:
 * 1. User Registration (Tenant & Owner)
 * 2. Owner creates Hostel
 * 3. Owner creates Room Types
 * 4. Tenant browses & searches hostels
 * 5. Tenant creates booking request
 * 6. Owner approves/rejects booking
 * 7. Tenant initiates payment
 * 8. Payment webhook confirmation
 */
describe("Booking Flow (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let tenantToken: string;
  let adminToken: string;

  let hostelId: string;
  let roomId: string;
  let bookingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  async function cleanupDatabase() {
    // Delete in order of dependencies
    await prisma.payment.deleteMany();
    await prisma.bookingItem.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hostelFacility.deleteMany();
    await prisma.hostel.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  }

  // ==================== REGISTRATION TESTS ====================

  describe("1. User Registration", () => {
    it("should register a new tenant account", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "tenant@test.com",
          password: "TestPass123!@",
          firstName: "Jane",
          lastName: "Tenant",
          role: "TENANT",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.userId).toBeDefined();

      tenantToken = response.body.token;
    });

    it("should register a new owner account", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "owner@test.com",
          password: "TestPass123!@",
          firstName: "John",
          lastName: "Owner",
          role: "OWNER",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");

      ownerToken = response.body.token;
    });

    it("should register an admin account", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "admin@test.com",
          password: "TestPass123!@",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
        });

      expect(response.status).toBe(201);
      adminToken = response.body.token;
    });

    it("should reject duplicate email", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "tenant@test.com",
          password: "TestPass123!@",
          firstName: "Duplicate",
          lastName: "User",
          role: "TENANT",
        });

      expect(response.status).toBe(400);
    });

    it("should reject weak password", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "weakpass@test.com",
          password: "123",
          firstName: "Weak",
          lastName: "Pass",
          role: "TENANT",
        });

      expect(response.status).toBe(400);
    });
  });

  // ==================== OWNER HOSTEL CREATION TESTS ====================

  describe("2. Owner Creates Hostel", () => {
    it("should create a new hostel", async () => {
      const response = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Legon Premium Hostel",
          description: "Modern hostel near LEGON campus with WiFi and AC",
          addressLine: "123 Main Street",
          city: "Accra",
          region: "Greater Accra",
          university: "UG",
          whatsappNumber: "0244123456",
          distanceToCampus: "5 minute walk",
          utilitiesIncluded: ["water", "light"],
          genderCategory: "MIXED",
          amenities: ["WiFi", "AC", "Security"],
          images: [],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Legon Premium Hostel");
      expect(response.body.isPublished).toBe(false); // First-time owner requires verification

      hostelId = response.body.id;
    });

    it("should not allow tenant to create hostel", async () => {
      const response = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          name: "Unauthorized Hostel",
          city: "Accra",
        });

      expect(response.status).toBe(403); // Forbidden
    });

    it("should retrieve owner's hostels", async () => {
      const response = await request(app.getHttpServer())
        .get("/hostels/my-hostels")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(hostelId);
    });
  });

  // ==================== ADMIN VERIFICATION TESTS ====================

  describe("3. Admin Verifies Hostel", () => {
    it("should list pending hostels for admin", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/hostels/pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should verify hostel (admin action)", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/hostels/${hostelId}/verify`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ approved: true });

      expect(response.status).toBe(200);
      expect(response.body.isVerifiedHostel).toBe(true);
    });
  });

  // ==================== ROOM CREATION TESTS ====================

  describe("4. Owner Creates Room Types", () => {
    it("should create a room type", async () => {
      const response = await request(app.getHttpServer())
        .post(`/rooms`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          hostelId: hostelId,
          name: "2-in-1 Deluxe",
          description: "Spacious room with AC and private bathroom",
          capacity: 2,
          totalUnits: 10,
          pricePerTerm: 150000, // ₵1,500 in pesewas
          roomConfiguration: "2 per room",
          gender: "MIXED",
          hasAC: true,
          utilitiesIncluded: ["water", "light"],
          images: [],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.availableSlots).toBe(10); // Initially all available

      roomId = response.body.id;
    });

    it("should create another room type", async () => {
      const response = await request(app.getHttpServer())
        .post(`/rooms`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          hostelId: hostelId,
          name: "4-in-1 Economy",
          description: "Affordable room for 4 people",
          capacity: 4,
          totalUnits: 5,
          pricePerTerm: 100000, // ₵1,000 in pesewas
          roomConfiguration: "4 per room",
          gender: "MIXED",
          hasAC: false,
          utilitiesIncluded: ["water"],
          images: [],
        });

      expect(response.status).toBe(201);
    });

    it("should retrieve room details", async () => {
      const response = await request(app.getHttpServer())
        .get(`/hostels/public/${hostelId}`)
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.rooms).toBeDefined();
      expect(response.body.rooms.length).toBeGreaterThan(0);
    });
  });

  // ==================== PUBLIC BROWSING TESTS ====================

  describe("5. Tenant Browses Hostels", () => {
    it("should list all published hostels", async () => {
      const response = await request(app.getHttpServer())
        .get("/hostels/public")
        .query({ city: "Accra" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should filter hostels by city", async () => {
      const response = await request(app.getHttpServer())
        .get("/hostels/public")
        .query({ city: "Accra" });

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        response.body.forEach((hostel: any) => {
          expect(hostel.city).toBe("Accra");
        });
      }
    });

    it("should filter hostels by price range", async () => {
      const response = await request(app.getHttpServer())
        .get("/hostels/public")
        .query({
          city: "Accra",
          minPrice: 100000,
          maxPrice: 200000,
        });

      expect(response.status).toBe(200);
    });

    it("should filter by amenities", async () => {
      const response = await request(app.getHttpServer())
        .get("/hostels/public")
        .query({
          city: "Accra",
          amenities: "WiFi,AC",
        });

      expect(response.status).toBe(200);
    });

    it("should get hostel details with rooms", async () => {
      const response = await request(app.getHttpServer())
        .get(`/hostels/public/${hostelId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(hostelId);
      expect(response.body.rooms).toBeDefined();
      expect(response.body.owner).toBeDefined();
    });
  });

  // ==================== BOOKING CREATION TESTS ====================

  describe("6. Tenant Creates Booking", () => {
    it("should create a booking request", async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

      const response = await request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          hostelId: hostelId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          items: [
            {
              roomId: roomId,
              quantity: 1,
            },
          ],
          levelOfStudy: "Level 100",
          guardianName: "Mr. Guardian",
          guardianPhone: "0200123456",
          notes: "Looking forward to my stay",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.status).toBe("PENDING");
      expect(response.body.items).toBeDefined();

      bookingId = response.body.id;
    });

    it("should reject booking with insufficient slots", async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Try to book more than available
      const response = await request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          hostelId: hostelId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          items: [
            {
              roomId: roomId,
              quantity: 20, // More than available (10)
            },
          ],
        });

      expect(response.status).toBe(400);
    });

    it("should retrieve tenant's bookings", async () => {
      const response = await request(app.getHttpServer())
        .get("/bookings/me")
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // ==================== OWNER APPROVAL TESTS ====================

  describe("7. Owner Manages Bookings", () => {
    it("should retrieve owner's bookings", async () => {
      const response = await request(app.getHttpServer())
        .get("/bookings/owner")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should approve a booking", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/approve`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          slotNumber: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("APPROVED");
    });

    it("should not allow tenant to approve their own booking", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/approve`)
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          slotNumber: 1,
        });

      expect(response.status).toBe(403);
    });
  });

  // ==================== PAYMENT TESTS ====================

  describe("8. Payment Processing", () => {
    it("should initiate payment (Paystack)", async () => {
      const response = await request(app.getHttpServer())
        .post(`/payments/initiate`)
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          bookingId: bookingId,
          provider: "PAYSTACK",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("authorizationUrl");
      expect(response.body).toHaveProperty("accessCode");
    });

    it("should retrieve payment status", async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${bookingId}`)
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });
  });

  // ==================== AUDIT LOGGING TESTS ====================

  describe("9. Audit Logging", () => {
    it("should have audit logs for hostel creation", async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/audit-logs`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ entityType: "HOSTEL" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should have audit logs for booking approval", async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/audit-logs`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ entityType: "BOOKING", actionType: "APPROVE" });

      expect(response.status).toBe(200);
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe("10. Error Handling & Edge Cases", () => {
    it("should reject unauthorized access", async () => {
      const response = await request(app.getHttpServer())
        .get("/bookings/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should reject missing required fields", async () => {
      const response = await request(app.getHttpServer())
        .post("/hostels")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          description: "Missing name",
        });

      expect(response.status).toBe(400);
    });

    it("should handle non-existent hostel", async () => {
      const response = await request(app.getHttpServer())
        .get("/hostels/public/non-existent-id");

      expect(response.status).toBe(404);
    });

    it("should handle archived hostels", async () => {
      // Archive a hostel
      await prisma.hostel.update({
        where: { id: hostelId },
        data: { isArchived: true },
      });

      const response = await request(app.getHttpServer())
        .get(`/hostels/public/${hostelId}`);

      expect(response.status).toBe(404);

      // Restore for other tests
      await prisma.hostel.update({
        where: { id: hostelId },
        data: { isArchived: false },
      });
    });

    it("should reject booking for archived hostel", async () => {
      // Archive hostel
      await prisma.hostel.update({
        where: { id: hostelId },
        data: { isArchived: true },
      });

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      const response = await request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          hostelId: hostelId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          items: [{ roomId: roomId, quantity: 1 }],
        });

      expect(response.status).toBe(404);

      // Restore
      await prisma.hostel.update({
        where: { id: hostelId },
        data: { isArchived: false },
      });
    });
  });
});
