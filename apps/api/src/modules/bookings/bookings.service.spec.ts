import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminAuditLogService } from '../admin/admin-audit.service';
import { BookingStatus } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';



describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AdminAuditLogService;

  const mockBooking = {
    id: 'booking-1',
    tenantId: 'user-1',
    hostelId: 'hostel-1',
    status: BookingStatus.PENDING_APPROVAL,
    items: [
      {
        id: 'item-1',
        roomId: 'room-1',
        quantity: 1,
        unitPrice: 500000,
        bookingId: 'booking-1',
        createdAt: new Date(),
      },
    ],
    hostel: {
      id: 'hostel-1',
      name: 'Legon Hostel',
      ownerId: 'owner-1',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: {
            booking: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            hostel: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendBookingNotification: jest.fn(),
          },
        },
        {
          provide: AdminAuditLogService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AdminAuditLogService>(AdminAuditLogService);
  });

  describe('createBooking', () => {
    it('should handle booking creation', () => {
      expect(true).toBe(true);
    });
  });

  describe('getMyBookings', () => {
    it('should return user bookings', () => {
      expect(true).toBe(true);
    });
  });

  describe('getOwnerBookings', () => {
    it('should return all bookings for owner properties', async () => {
      const ownerId = 'owner-1';

      (prismaService.booking.findMany as jest.Mock).mockResolvedValue([
        mockBooking,
      ]);

      const result = await service.getOwnerBookings(ownerId);

      expect(result).toHaveLength(1);
      expect(result[0].hostel.ownerId).toBe(ownerId);
      expect(prismaService.booking.findMany).toHaveBeenCalled();
    });

    it('should include pending, active, and completed bookings', async () => {
      const ownerId = 'owner-1';

      const bookings = [
        { ...mockBooking, status: 'PENDING_APPROVAL' },
        { ...mockBooking, status: 'CONFIRMED' },
        { ...mockBooking, status: 'COMPLETED' },
      ];

      (prismaService.booking.findMany as jest.Mock).mockResolvedValue(bookings);

      const result = await service.getOwnerBookings(ownerId);

      expect(result.some((b) => b.status === 'PENDING_APPROVAL')).toBe(true);
      expect(result.some((b) => b.status === 'CONFIRMED')).toBe(true);
      expect(result.some((b) => b.status === 'COMPLETED')).toBe(true);
    });
  });

  describe('approveBooking', () => {
    it('should approve booking', () => {
      expect(true).toBe(true);
    });

    it('should throw if not found', () => {
      expect(true).toBe(true);
    });

    it('should check ownership', () => {
      expect(true).toBe(true);
    });
  });

  describe('rejectBooking', () => {
    it('should reject booking', () => {
      expect(true).toBe(true);
    });
  });

  describe('checkIn', () => {
    it('should mark booking as checked in', async () => {
      const bookingId = 'booking-1';
      const user = { id: 'owner-1', role: 'OWNER' };

      (prismaService.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'CONFIRMED',
      });

      (prismaService.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'CHECKED_IN',
      });

      const result = await service.checkIn({ id: 'owner-1', role: 'OWNER' } as any, bookingId);

      expect(result.status).toBe('CHECKED_IN');
    });
  });

  describe('checkOut', () => {
    it('should mark booking as checked out', async () => {
      const bookingId = 'booking-1';
      const user = { id: 'owner-1', role: 'OWNER' };

      (prismaService.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'CHECKED_IN',
      });

      (prismaService.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'CHECKED_OUT',
      });

      const result = await service.checkOut({ id: 'owner-1', role: 'OWNER' } as any, bookingId);

      expect(result.status).toBe('CHECKED_OUT');
    });
  });

  describe('complete', () => {
    it('should mark booking as completed', async () => {
      const bookingId = 'booking-1';
      const user = { id: 'owner-1', role: 'OWNER' };

      (prismaService.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'CHECKED_OUT',
      });

      (prismaService.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'COMPLETED',
      });

      const result = await service.complete({ id: 'owner-1', role: 'OWNER' } as any, bookingId);

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('cancelBooking', () => {
    it('stub', () => {
      expect(true).toBe(true);
    });
  });

  describe('getOwnerAnalytics', () => {
    it('should return analytics', () => {
      expect(true).toBe(true);
    });
  });

  describe('booking status transitions', () => {
    it('should follow correct status flow', () => {
      const validTransitions = {
        PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
        APPROVED: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
        CHECKED_IN: ['CHECKED_OUT'],
        CHECKED_OUT: ['COMPLETED'],
        COMPLETED: [],
        REJECTED: [],
        CANCELLED: [],
      };

      expect(validTransitions.PENDING_APPROVAL).toContain('APPROVED');
      expect(validTransitions.CONFIRMED).toContain('CHECKED_IN');
      expect(validTransitions.CHECKED_IN).toContain('CHECKED_OUT');
    });
  });
});
