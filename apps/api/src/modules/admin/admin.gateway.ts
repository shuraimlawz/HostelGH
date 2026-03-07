import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'admin-events',
})
export class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        // Only admins should connect ideally
    }

    handleDisconnect(client: Socket) { }

    broadcastActivity(event: string, data: any) {
        this.server.emit('activity', { event, data, timestamp: new Date() });
    }

    broadcastStatsUpdate(stats: any) {
        this.server.emit('stats_update', stats);
    }
}
