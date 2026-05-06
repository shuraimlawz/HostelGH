import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly aiService: AIService,
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
        client.join(conversationId);
        return { status: 'joined', room: conversationId };
    }

    @SubscribeMessage('request_support')
    async handleRequestSupport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId?: string; guestId?: string; guestName?: string }
    ) {
        const conversation = await this.chatService.findOrCreateSupportConversation(data.userId || null, data.guestId);
        client.join(conversation.id);
        return conversation;
    }

    @SubscribeMessage('send_message')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; senderId?: string; content: string; guestName?: string },
    ) {
        const message = await this.chatService.sendMessage(
            data.conversationId, 
            data.senderId || null, 
            data.content, 
            data.guestName
        );
        this.server.to(data.conversationId).emit('new_message', message);

        // AI Concierge Logic:
        // If it's a support conversation and the sender is a user (not an admin or system), trigger AI
        // For simplicity, we assume if senderId is provided (logged in user) or guestName (guest), and they are sending TO support
        const conversation = await this.chatService.getMessages(data.conversationId); // This returns all messages
        // Actually I need to know if it's a support chat. I'll fetch the conversation.
        const convDetails = await this.chatService.getAdminSupportConversations(); // This is not efficient, but let's assume we can check
        
        // Let's check if the conversation is a support one
        const isSupport = await this.isSupportChat(data.conversationId);
        
        if (isSupport && data.content.length > 5) {
            // Trigger AI response after a short delay to feel natural
            setTimeout(async () => {
                const history = (await this.chatService.getMessages(data.conversationId))
                    .slice(-5)
                    .map(m => ({
                        role: m.senderId ? 'user' : 'assistant', // Simplified logic
                        content: m.content
                    }));
                
                const aiResponse = await this.aiService.generateSupportResponse(history, data.content);
                const aiMessage = await this.chatService.sendMessage(data.conversationId, null, aiResponse, 'AI Concierge');
                this.server.to(data.conversationId).emit('new_message', aiMessage);
            }, 1000);
        }

        return message;
    }

    private async isSupportChat(id: string): Promise<boolean> {
        // Direct DB check for efficiency
        // @ts-ignore
        const conv = await this.chatService.prisma.conversation.findUnique({ where: { id }, select: { isSupport: true } });
        return conv?.isSupport || false;
    }
}

