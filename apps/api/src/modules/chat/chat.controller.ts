import { Controller, Get, Param, UseGuards, Req } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @UseGuards(JwtAuthGuard)
    @Get("conversations")
    async getConversations(@Req() req) {
        return this.chatService.getConversations(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @Get("support/active")
    async getSupportConversations() {
        return this.chatService.getAdminSupportConversations();
    }

    @Get(":id/messages")
    async getMessages(@Param("id") id: string) {
        return this.chatService.getMessages(id);
    }
}
