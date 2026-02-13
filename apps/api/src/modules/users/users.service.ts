import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
        });

        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    async updateProfile(id: string, dto: UpdateProfileDto) {
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true },
        });
    }
}

interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
}
