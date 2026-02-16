import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
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

    async createPayoutRequest(ownerId: string, amount: number) {
        // Validate balance
        const wallet = await this.prisma.wallet.findUnique({ where: { ownerId } });
        if (!wallet || wallet.balance < amount) {
            throw new BadRequestException("Insufficient balance in wallet");
        }

        // Check for default payout method
        const defaultMethod = await this.prisma.payoutMethod.findFirst({
            where: { ownerId, isDefault: true }
        });
        if (!defaultMethod) {
            throw new BadRequestException("Please set a default payout method first");
        }

        return await this.prisma.$transaction(async (tx) => {
            // Deduct from wallet
            await tx.wallet.update({
                where: { ownerId },
                data: { balance: { decrement: amount } }
            });

            // Create request
            return tx.payoutRequest.create({
                data: {
                    ownerId,
                    amount,
                    status: "PENDING"
                }
            });
        });
    }

    async getPayoutHistory(ownerId: string) {
        return this.prisma.payoutRequest.findMany({
            where: { ownerId },
            orderBy: { createdAt: "desc" }
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
