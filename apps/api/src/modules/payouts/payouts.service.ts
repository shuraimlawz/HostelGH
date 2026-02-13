import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePayoutMethodDto } from "./dto/provide-payout-method.dto";

@Injectable()
export class PayoutsService {
    constructor(private prisma: PrismaService) { }

    async create(ownerId: string, dto: CreatePayoutMethodDto) {
        if (dto.isDefault) {
            await this.prisma.payoutMethod.updateMany({
                where: { ownerId },
                data: { isDefault: false },
            });
        }

        return this.prisma.payoutMethod.create({
            data: {
                ...dto,
                ownerId,
            },
        });
    }

    async findAll(ownerId: string) {
        return this.prisma.payoutMethod.findMany({
            where: { ownerId },
            orderBy: { createdAt: "desc" },
        });
    }

    async remove(ownerId: string, id: string) {
        const method = await this.prisma.payoutMethod.findUnique({
            where: { id },
        });

        if (!method || method.ownerId !== ownerId) {
            throw new NotFoundException("Payout method not found");
        }

        return this.prisma.payoutMethod.delete({
            where: { id },
        });
    }

    async setDefault(ownerId: string, id: string) {
        await this.prisma.payoutMethod.updateMany({
            where: { ownerId },
            data: { isDefault: false },
        });

        return this.prisma.payoutMethod.update({
            where: { id },
            data: { isDefault: true },
        });
    }
}
