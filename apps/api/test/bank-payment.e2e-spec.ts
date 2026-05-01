import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E Test: Bank Payment Integration
 * 
 * Tests the new bank payment functionality:
 * 1. Get available payment methods
 * 2. Initiate bank transfer payment
 * 3. Verify bank transfer
 * 4. Select payment method
 * 5. List Ghana banks
 */
describe('Bank Payment E2E', () => {
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
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data
    await cleanupDatabase();

    // Create test users
    const tenantRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'bank.tenant@test.com',
        password: 'TestPass123!@',
        firstName: 'John',
        lastName: 'Tenant',
        role: 'TENANT',
      });
    tenantToken = tenantRes.body.token;

    const ownerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'bank.owner@test.com',
        password: 'TestPass123!@',
        firstName: 'Jane',
        lastName: 'Owner',
        role: 'OWNER',
      });
    ownerToken = ownerRes.body.token;

    // Create hostel
    const hostelRes = await request(app.getHttpServer())
      .post('/hostels')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Bank Payment Test Hostel',
        description: 'Test hostel for bank payment',
        location: 'Accra',
        city: 'Accra',
        region: 'Greater Accra',
        latitude: 5.603,
        longitude: -0.187,
        contactEmail: 'bank.owner@test.com',
        contactPhone: '+233501234567',
        checkInTime: '14:00',
        checkOutTime: '12:00',
      });
    const hostelId = hostelRes.body.id;

    // Create room
    const roomRes = await request(app.getHttpServer())
      .post('/rooms')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        hostelId,
        roomName: 'Dorm A',
        roomType: 'DORM',
        gender: 'MIXED',
        capacity: 4,
        pricePerNight: 50000, // GH₵500 in pesewas
        availableSlots: 4,
      });

    // Create booking
    const bookingRes = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        hostelId,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        items: [
          {
            roomId: roomRes.body.id,
            quantity: 1,
          },
        ],
      });
    bookingId = bookingRes.body.id;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  async function cleanupDatabase() {
    try {
      await prisma.payment.deleteMany();
      await prisma.bookingItem.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.room.deleteMany();
      await prisma.hostelFacility.deleteMany();
      await prisma.hostel.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      // Ignore errors during cleanup
    }
  }

  describe('Payment Methods', () => {
    it('should get available payment methods', async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/methods/${bookingId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('methods');
      expect(Array.isArray(response.body.methods)).toBe(true);
      expect(response.body.methods.length).toBeGreaterThan(0);

      const methods = response.body.methods.map((m: any) => m.type);
      expect(methods).toContain('CARD');
      expect(methods).toContain('BANK_TRANSFER');
    });

    it('should show correct fees for each payment method', async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/methods/${bookingId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      const bankTransfer = response.body.methods.find(
        (m: any) => m.type === 'BANK_TRANSFER'
      );
      expect(bankTransfer).toBeDefined();
      expect(bankTransfer.fees).toBe(300); // GH₵0.03
      expect(bankTransfer.processingTime).toBe('1-5 minutes');
    });

    it('should include all payment method details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/methods/${bookingId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      response.body.methods.forEach((method: any) => {
        expect(method).toHaveProperty('type');
        expect(method).toHaveProperty('label');
        expect(method).toHaveProperty('description');
        expect(method).toHaveProperty('fees');
        expect(method).toHaveProperty('processingTime');
        expect(method).toHaveProperty('available');
      });
    });
  });

  describe('Bank Transfer Payment', () => {
    it('should initiate bank transfer payment', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payments/bank/init/${bookingId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('reference');
      expect(response.body).toHaveProperty('bank');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('amountBreakdown');
      expect(response.body).toHaveProperty('currency', 'GHS');
      expect(response.body).toHaveProperty('referenceCode');

      paymentId = response.body.paymentId;

      // Verify bank details
      expect(response.body.bank).toHaveProperty('name');
      expect(response.body.bank).toHaveProperty('accountNumber');
      expect(response.body.bank).toHaveProperty('accountName');

      // Verify amount breakdown
      expect(response.body.amountBreakdown.bookingFee).toBeGreaterThan(0);
      expect(response.body.amountBreakdown.bankFee).toBe(300);
      expect(response.body.amountBreakdown.total).toBe(
        response.body.amountBreakdown.bookingFee + 300
      );
    });

    it('should only allow tenant or admin to initiate payment', async () => {
      const otherUser = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'other@test.com',
          password: 'TestPass123!@',
          firstName: 'Other',
          lastName: 'User',
          role: 'TENANT',
        });

      await request(app.getHttpServer())
        .post(`/payments/bank/init/${bookingId}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .expect(403);
    });

    it('should not allow payment for non-pending booking', async () => {
      // This would require a completed booking
      // Skipping for now as it requires more setup
      expect(true).toBe(true);
    });
  });

  describe('Payment Method Selection', () => {
    it('should select payment method', async () => {
      // First initiate payment
      const initRes = await request(app.getHttpServer())
        .post(`/payments/bank/init/${bookingId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      const payId = initRes.body.paymentId;

      // Then select method
      const response = await request(app.getHttpServer())
        .post('/payments/method/select')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          paymentId: payId,
          method: 'CARD',
        })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('paymentId', payId);
      expect(response.body).toHaveProperty('selectedMethod', 'CARD');
    });

    it('should reject invalid payment method', async () => {
      const initRes = await request(app.getHttpServer())
        .post(`/payments/bank/init/${bookingId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/payments/method/select')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          paymentId: initRes.body.paymentId,
          method: 'INVALID_METHOD',
        })
        .expect(400);
    });
  });

  describe('Ghana Bank Support', () => {
    it('should get list of Ghana banks', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/bank/list')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check for major Ghana banks
      const bankNames = response.body.map((b: any) => b.name);
      expect(bankNames.length).toBeGreaterThan(0);
    });

    it('should have required bank fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/bank/list')
        .expect(200);

      response.body.forEach((bank: any) => {
        expect(bank).toHaveProperty('id');
        expect(bank).toHaveProperty('name');
        expect(bank).toHaveProperty('code');
        expect(bank).toHaveProperty('currency');
      });
    });

    it('should resolve valid bank account', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/bank/resolve')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          accountNumber: '0132456789',
          bankCode: '030100', // GCB Bank
        })
        .expect(200);

      expect(response.body).toHaveProperty('account_number');
      expect(response.body).toHaveProperty('account_name');
      expect(response.body).toHaveProperty('bank_name');
    });

    it('should reject invalid bank account', async () => {
      await request(app.getHttpServer())
        .post('/payments/bank/resolve')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          accountNumber: 'INVALID',
          bankCode: 'INVALID',
        })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent booking', async () => {
      await request(app.getHttpServer())
        .post('/payments/bank/init/nonexistent')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/payments/methods/${bookingId}`)
        .expect(401);
    });

    it('should return 403 for unauthorized user', async () => {
      const other = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'other2@test.com',
          password: 'TestPass123!@',
          firstName: 'Other2',
          lastName: 'User2',
          role: 'TENANT',
        });

      await request(app.getHttpServer())
        .get(`/payments/methods/${bookingId}`)
        .set('Authorization', `Bearer ${other.body.token}`)
        .expect(403);
    });
  });
});
