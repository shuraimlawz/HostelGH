import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class WalletsService {
    constructor(private prisma: PrismaService) { }

    async getWalletByOwner(ownerId: string) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { ownerId },
        });

        if (!wallet) {
            // Lazy create wallet if it doesn't exist
            wallet = await this.prisma.wallet.create({
                data: { ownerId, balance: 0 }
            });
        }

        return wallet;
    }
}
