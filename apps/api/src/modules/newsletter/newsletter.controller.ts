import { Controller, Post, Get, Body, Param, Query } from "@nestjs/common";
import { NewsletterService } from "./newsletter.service";

@Controller("newsletter")
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    @Post("subscribe")
    async subscribe(@Body("email") email: string) {
        return this.newsletterService.subscribe(email);
    }

    @Post("unsubscribe")
    async unsubscribe(@Body("hash") hash: string) {
        return this.newsletterService.unsubscribe(hash);
    }

    @Get("unsubscribe-status/:hash")
    async getStatus(@Param("hash") hash: string) {
        return this.newsletterService.getSubscriberByHash(hash);
    }
}
