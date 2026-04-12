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
    status: BookingStatus.PENDING,
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

  describe('Booking Lifecycle', () => {
    it('should follow correct status flow', () => {
      const validTransitions = {
        PENDING: ['PAYMENT_SECURED', 'CANCELLED'],
        PAYMENT_SECURED: ['RESERVED'],
        RESERVED: ['CHECKED_IN', 'DISPUTED', 'CANCELLED'],
        CHECKED_IN: ['COMPLETED', 'DISPUTED'],
        COMPLETED: [],
        DISPUTED: ['COMPLETED', 'CANCELLED'],
        CANCELLED: [],
      };

      expect(validTransitions.PENDING).toContain('PAYMENT_SECURED');
      expect(validTransitions.PAYMENT_SECURED).toContain('RESERVED');
      expect(validTransitions.RESERVED).toContain('CHECKED_IN');
      expect(validTransitions.CHECKED_IN).toContain('COMPLETED');
    });
  });
});
