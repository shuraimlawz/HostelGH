import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async getConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: {
                participants: { some: { id: userId } }
            },
            include: {
                participants: { select: { id: true, firstName: true, avatarUrl: true, role: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    async getAdminSupportConversations() {
        return this.prisma.conversation.findMany({
            where: { isSupport: true },
            include: {
                participants: { select: { id: true, firstName: true, avatarUrl: true, email: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    async getMessages(conversationId: string) {
        // @ts-ignore
        return this.prisma.message.findMany({
            where: { conversationId },
            include: { sender: { select: { id: true, firstName: true } } },
            orderBy: { createdAt: 'asc' }
        });
    }

    async sendMessage(conversationId: string, senderId: string | null, content: string, guestName?: string) {
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                guestName,
                content
            }
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        return message;
    }

    async findOrCreateConversation(participantIds: string[]) {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                AND: participantIds.map(id => ({
                    participants: { some: { id } }
                })),
                isSupport: false // Regular chat, not support
            }
        });

        if (existing) return existing;

        return this.prisma.conversation.create({
            data: {
                participants: {
                    connect: participantIds.map(id => ({ id }))
                }
            }
        });
    }

    async findOrCreateSupportConversation(userId: string | null, guestId?: string) {
        if (!userId && !guestId) throw new Error("Unified identifier required");

        const where: any = { isSupport: true };
        if (userId) where.participants = { some: { id: userId } };
        else where.guestId = guestId;

        const existing = await this.prisma.conversation.findFirst({
            where,
            include: { messages: { take: 10, orderBy: { createdAt: 'desc' } } }
        });

        if (existing) return existing;

        // Create new support conversation with an admin
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) throw new Error("No admin available for support");

        return this.prisma.conversation.create({
            data: {
                isSupport: true,
                guestId: guestId || null,
                participants: {
                    connect: userId 
                        ? [{ id: userId }, { id: admin.id }] 
                        : [{ id: admin.id }]
                }
            }
        });
    }
}
