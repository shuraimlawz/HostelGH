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
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

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
        return message;
    }
}
