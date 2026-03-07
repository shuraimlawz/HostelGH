import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async getConversations(userId: string) {
        // @ts-ignore
        return this.prisma.conversation.findMany({
            where: {
                participants: { some: { id: userId } }
            },
            include: {
                participants: { select: { id: true, firstName: true, avatarUrl: true } },
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

    async sendMessage(conversationId: string, senderId: string, content: string) {
        // @ts-ignore
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                content
            }
        });

        // @ts-ignore
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        return message;
    }

    async findOrCreateConversation(participantIds: string[]) {
        // @ts-ignore
        const existing = await this.prisma.conversation.findFirst({
            where: {
                AND: participantIds.map(id => ({
                    participants: { some: { id } }
                }))
            }
        });

        if (existing) return existing;

        // @ts-ignore
        return this.prisma.conversation.create({
            data: {
                participants: {
                    connect: participantIds.map(id => ({ id }))
                }
            }
        });
    }
}
