import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { createHash } from "crypto";

@Injectable()
export class NewsletterService {
    constructor(private prisma: PrismaService) { }

    private generateHash(email: string): string {
        // Use a simple but secure hash for unsubscription identification
        return createHash("sha256").update(email.toLowerCase() + process.env.JWT_SECRET).digest("hex");
    }

    async subscribe(email: string) {
        const hash = this.generateHash(email);

        return this.prisma.newsletterSubscriber.upsert({
            where: { email },
            update: { isActive: true, hash },
            create: { email, hash, isActive: true }
        });
    }

    async unsubscribe(hash: string) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { hash }
        });

        if (!subscriber) {
            throw new NotFoundException("Subscriber not found with the provided hash.");
        }

        return this.prisma.newsletterSubscriber.update({
            where: { hash },
            data: { isActive: false }
        });
    }

    async getSubscriberByHash(hash: string) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { hash }
        });
        if (!subscriber) throw new NotFoundException("Invalid unsubscription link.");
        return subscriber;
    }
}
