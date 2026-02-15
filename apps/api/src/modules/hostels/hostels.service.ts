import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";

@Injectable()
export class HostelsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(ownerId: string, dto: CreateHostelDto) {
        return this.prisma.hostel.create({
            data: { ...dto, ownerId },
        });
    }

    async update(actor: UserActor, hostelId: string, dto: UpdateHostelDto) {
        const hostel = await this.getHostelById(hostelId);
        this.validateOwnership(actor, hostel.ownerId);

        return this.prisma.hostel.update({
            where: { id: hostelId },
            data: dto,
        });
    }

    async delete(actor: UserActor, hostelId: string) {
        const hostel = await this.getHostelById(hostelId);
        this.validateOwnership(actor, hostel.ownerId);

        return this.prisma.hostel.delete({ where: { id: hostelId } });
    }

    async findMyHostels(ownerId: string) {
        return this.prisma.hostel.findMany({
            where: { ownerId },
            include: { _count: { select: { rooms: true, bookings: true } } },
            orderBy: { createdAt: "desc" },
        });
    }

    async publicSearch(params: {
        city?: string,
        region?: string,
        minPrice?: number,
        maxPrice?: number,
        amenities?: string[],
        university?: string,
        sort?: string,
        gender?: string,
        roomConfig?: string
    }) {
        const { city, region, minPrice, maxPrice, amenities, university, sort, gender, roomConfig } = params;

        // Intelligent Suggestion Algorithm: 
        // 1. Featured hostels first
        // 2. Then by selected sorting criteria
        const orderBy: any[] = [{ isFeatured: "desc" }];

        if (sort === "price_asc") {
            orderBy.push({ minPrice: "asc" });
        } else if (sort === "price_desc") {
            orderBy.push({ minPrice: "desc" });
        } else if (sort === "name_asc") {
            orderBy.push({ name: "asc" });
        } else {
            orderBy.push({ createdAt: "desc" }); // Default to Newest
        }

        return this.prisma.hostel.findMany({
            where: {
                isPublished: true,
                city: city ? { contains: city, mode: "insensitive" } : undefined,
                region: region ? { equals: region, mode: "insensitive" } : undefined,
                university: university ? { contains: university, mode: "insensitive" } : undefined,
                amenities: amenities && amenities.length > 0 ? { hasEvery: amenities } : undefined,
                bookingStatus: { not: "CLOSED" },
                minPrice: (minPrice !== undefined || maxPrice !== undefined) ? {
                    gte: minPrice,
                    lte: maxPrice,
                } : undefined,
                rooms: (gender || roomConfig) ? {
                    some: {
                        isActive: true,
                        gender: gender ? (gender as any) : undefined,
                        roomConfiguration: roomConfig ? { contains: roomConfig, mode: "insensitive" } : undefined,
                        availableSlots: { gt: 0 }
                    }
                } : undefined
            },
            include: { rooms: { where: { isActive: true } } },
            orderBy: orderBy,
        });
    }

    async getPublicById(id: string) {
        const hostel = await this.prisma.hostel.findFirst({
            where: { id, isPublished: true },
            include: {
                rooms: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
                owner: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!hostel) throw new NotFoundException("Hostel not found or not published");
        return hostel;
    }

    async getCityStats() {
        const stats = await this.prisma.hostel.groupBy({
            by: ['city'],
            _count: {
                id: true
            },
            where: {
                isPublished: true
            }
        });

        const cityImages: Record<string, string> = {
            "Accra": "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?w=400&h=300&fit=crop",
            "Kumasi": "https://images.unsplash.com/photo-1596401057633-5310457b1d4f?w=400&h=300&fit=crop",
            "Cape Coast": "https://images.unsplash.com/photo-1590636287955-ea299941a547?w=400&h=300&fit=crop",
            "Takoradi": "https://images.unsplash.com/photo-1583002444634-8b64e6259f9e?w=400&h=300&fit=crop",
            "Tamale": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&h=300&fit=crop"
        };

        return stats.map(s => ({
            name: s.city,
            count: `${s._count.id} ${s._count.id === 1 ? 'Hostel' : 'Hostels'}`,
            image: cityImages[s.city] || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop"
        }));
    }

    async addHostelImages(hostelId: string, userId: string, imageUrls: string[]) {
        const hostel = await this.getHostelById(hostelId);
        this.validateOwnership({ userId, role: UserRole.OWNER }, hostel.ownerId);

        return this.prisma.hostel.update({
            where: { id: hostelId },
            data: {
                images: {
                    push: imageUrls,
                },
            },
        });
    }

    async removeHostelImage(hostelId: string, userId: string, imageUrl: string) {
        const hostel = await this.getHostelById(hostelId);
        this.validateOwnership({ userId, role: UserRole.OWNER }, hostel.ownerId);

        const updatedImages = hostel.images.filter(img => img !== imageUrl);

        return this.prisma.hostel.update({
            where: { id: hostelId },
            data: {
                images: updatedImages,
            },
        });
    }

    private async getHostelById(id: string) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id } });
        if (!hostel) throw new NotFoundException("Hostel not found");
        return hostel;
    }

    private validateOwnership(actor: UserActor, ownerId: string) {
        const isAuthorized = actor.role === UserRole.ADMIN || actor.userId === ownerId;
        if (!isAuthorized) throw new ForbiddenException("Not allowed to modify this hostel");
    }
}

interface UserActor {
    userId: string;
    role: UserRole;
}

interface CreateHostelDto {
    name: string;
    addressLine: string;
    city: string;
    description?: string;
    region?: string;
    country?: string;
    images?: string[];
    amenities?: string[];
    university?: string;
    isPublished?: boolean;
}

interface UpdateHostelDto extends Partial<CreateHostelDto> { }
