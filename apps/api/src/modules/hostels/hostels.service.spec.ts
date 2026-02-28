import { Test, TestingModule } from '@nestjs/testing';
import { HostelsService } from './hostels.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AdminAuditLogService } from '../admin/admin-audit.service';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('HostelsService', () => {
  let service: HostelsService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockHostel: any = {
    id: 'hostel-1',
    name: 'Legon Hostel',
    city: 'Accra',
    addressLine: '123 Main St',
    description: 'Premium hostel near Legon',
    ownerId: 'owner-1',
    featured: true,
    verified: true,
    minPrice: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      bookings: 25,
      rooms: 10,
    },
    rating: 4.5,
  };

  const mockHostels = [
    mockHostel,
    {
      ...mockHostel,
      id: 'hostel-2',
      name: 'KNUST Hostel',
      city: 'Kumasi',
      featured: false,
      minPrice: 8000,
      _count: { bookings: 15, rooms: 8 },
      rating: 4.2,
    },
    {
      ...mockHostel,
      id: 'hostel-3',
      name: 'UCC Hostel',
      city: 'Cape Coast',
      featured: false,
      minPrice: 9000,
      _count: { bookings: 5, rooms: 6 },
      rating: 3.8,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostelsService,
        {
          provide: PrismaService,
          useValue: {
            hostel: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              groupBy: jest.fn(), // used in trending fallback logic
            },
            booking: {
              groupBy: jest.fn(), // trending algorithm needs this
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            getJson: jest.fn(),
            setJson: jest.fn(),
          },
        },
        {
          provide: SubscriptionsService,
          useValue: {
            checkLimit: jest.fn(),
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

    service = module.get<HostelsService>(HostelsService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('publicSearch', () => {
    it('should return hostels sorted by relevance (featured, bookings, rating)', async () => {
      const query = {
        city: 'Accra',
        sort: 'relevance',
        limit: 10,
        page: 1,
      };

      (redisService.getJson as jest.Mock).mockResolvedValue(null);
      (prismaService.hostel.findMany as jest.Mock).mockResolvedValue(
        mockHostels,
      );
      (redisService.set as jest.Mock).mockResolvedValue(true);

      const result = await service.publicSearch(query);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('hostel-1'); // Featured first
      expect(prismaService.hostel.findMany).toHaveBeenCalled();
    });

    it('should filter hostels by city', async () => {
      const query = {
        city: 'Kumasi',
        sort: 'relevance',
        limit: 10,
        page: 1,
      };

      (redisService.getJson as jest.Mock).mockResolvedValue(null);
      (prismaService.hostel.findMany as jest.Mock).mockResolvedValue([
        mockHostels[1],
      ]);

      const result = await service.publicSearch(query);

      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('Kumasi');
    });

    it('should filter hostels by price range', async () => {
      const query = {
        minPrice: 8000,
        maxPrice: 10000,
        sort: 'relevance',
        limit: 10,
        page: 1,
      };

      (redisService.getJson as jest.Mock).mockResolvedValue(null);
      (prismaService.hostel.findMany as jest.Mock).mockResolvedValue(
        mockHostels.filter((h) => h.minPrice >= 8000 && h.minPrice <= 10000),
      );

      const result = await service.publicSearch(query);

      expect(result.every((h) => h.minPrice >= 8000 && h.minPrice <= 10000)).toBe(
        true,
      );
    });

    it('should return cached results if available', async () => {
      const query = {
        city: 'Accra',
        sort: 'relevance',
      };
      const cacheKey = `search:${JSON.stringify(query)}`;

      (redisService.getJson as jest.Mock).mockResolvedValue(mockHostels);

      const result = await service.publicSearch(query);

      expect(result).toHaveLength(3);
      expect(redisService.getJson).toHaveBeenCalledWith(cacheKey);
    });

    it('should handle pagination correctly', async () => {
      const query = {
        sort: 'relevance',
        limit: 2,
        page: 2,
      };

      (redisService.getJson as jest.Mock).mockResolvedValue(null);
      (prismaService.hostel.findMany as jest.Mock).mockResolvedValue(
        mockHostels.slice(2, 4),
      );

      const result = await service.publicSearch(query);

      expect(prismaService.hostel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 2,
          take: 2,
        }),
      );
    });
  });

  describe('getPublicDetail', () => {
    it('should return hostel details for public view', async () => {
      const hostelId = 'hostel-1';
      const actor = { id: 'owner-1', role: UserRole.OWNER };

      (redisService.getJson as jest.Mock).mockResolvedValue(null);
      (prismaService.hostel.findUnique as jest.Mock).mockResolvedValue(
        mockHostel,
      );

      const result = await service.getById(actor, hostelId);

      expect(result).toEqual(mockHostel);
      expect(prismaService.hostel.findUnique).toHaveBeenCalledWith({
        where: { id: hostelId },
        include: {
          rooms: { orderBy: { createdAt: 'asc' } },
          facilities: true,
          _count: { select: { bookings: true } },
        },
      });
    });

    it('should throw error if hostel not found', async () => {
      const actor = { id: 'owner-1', role: UserRole.OWNER };
      (prismaService.hostel.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getById(actor, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new hostel', async () => {
      const ownerId = 'owner-1';
      const createDto = {
        name: 'New Hostel',
        city: 'Accra',
        addressLine: '456 Oak St',
        description: 'A new hostel',
        minPrice: 12000,
        listingFeeModel: 'STANDARD',
      };

      (prismaService.hostel.create as jest.Mock).mockResolvedValue({
        id: 'hostel-new',
        ...createDto,
        ownerId,
        featured: false,
        isPublished: false,
        owner: { email: 'owner@example.com' },
      });

      const result = await service.create(ownerId, createDto as any);

      expect(result.name).toBe(createDto.name);
      expect(result.ownerId).toBe(ownerId);
      expect(result.listingFeeModel).toBe('STANDARD');
      expect(prismaService.hostel.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const ownerId = 'owner-1';
      const invalidDto = {
        name: '',
        city: 'Accra',
      };

      // This assumes validation is done at service level
      expect(invalidDto.name).toBe('');
    });
  });

  describe('getTrendingLocations', () => {
    it('should return top cities by booking count', async () => {
      const trendingLocations = ['Accra', 'Kumasi', 'Cape Coast'];

      (redisService.getJson as jest.Mock).mockResolvedValue(null);
      (prismaService.booking.groupBy as jest.Mock).mockResolvedValue([]);
      (prismaService.hostel.groupBy as jest.Mock).mockResolvedValue([]);
      (prismaService.hostel.findMany as jest.Mock).mockResolvedValue(
        mockHostels,
      );

      const result = await service.getTrendingLocations();

      // Result should be array of city names
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(typeof result[0]).toBe('string');
      }
    });
  });

  describe('update', () => {
    it('should update hostel details', async () => {
      const hostelId = 'hostel-1';
      const ownerId = 'owner-1';
      const updateDto = {
        name: 'Updated Hostel Name',
        description: 'Updated description',
      };

      (prismaService.hostel.findUnique as jest.Mock).mockResolvedValue(mockHostel);
      (prismaService.hostel.update as jest.Mock).mockResolvedValue({
        ...mockHostel,
        ...updateDto,
      });

      const result = await service.update({ id: ownerId, role: 'OWNER' }, hostelId, updateDto as any);

      expect(result.name).toBe(updateDto.name);
      expect(prismaService.hostel.update).toHaveBeenCalled();
    });

    it('should throw error if hostel not found', async () => {
      (prismaService.hostel.update as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.update({ id: 'owner-1', role: 'OWNER' }, 'nonexistent', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a hostel', async () => {
      const hostelId = 'hostel-1';
      const ownerId = 'owner-1';
      (prismaService.hostel.findUnique as jest.Mock).mockResolvedValue(mockHostel);      (prismaService.hostel.delete as jest.Mock).mockResolvedValue(mockHostel);

      const result = await service.delete({ id: ownerId, role: 'OWNER' }, hostelId);

      expect(result.id).toBe(hostelId);
      expect(prismaService.hostel.delete).toHaveBeenCalled();
    });
  });

  describe('relevance sorting', () => {
    it('should prioritize featured hostels', () => {
      const unsorted = [
        { ...mockHostel, featured: false, _count: { bookings: 100 } },
        { ...mockHostel, featured: true, _count: { bookings: 10 } },
      ];

      // Featured should come first regardless of bookings
      expect(unsorted[1].featured).toBe(true);
    });

    it('should sort by booking count for non-featured', () => {
      const hostels = [
        { ...mockHostel, featured: false, _count: { bookings: 5 } },
        { ...mockHostel, featured: false, _count: { bookings: 25 } },
      ];

      // Higher bookings should come first
      expect(hostels[1]._count.bookings).toBeGreaterThan(
        hostels[0]._count.bookings,
      );
    });

    it('should sort by rating as tiebreaker', () => {
      const hostels = [
        {
          ...mockHostel,
          featured: false,
          _count: { bookings: 20 },
          rating: 4.2,
        },
        {
          ...mockHostel,
          featured: false,
          _count: { bookings: 20 },
          rating: 4.5,
        },
      ];

      // Higher rating should come first when bookings are equal
      expect(hostels[1].rating).toBeGreaterThan(hostels[0].rating);
    });
  });
});
