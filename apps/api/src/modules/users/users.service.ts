import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

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

    async deleteProfile(id: string) {
        // Find if user exists
        const user = await this.findById(id);

        // Delete user (and cascades if configured, otherwise handle manually)
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
