import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class ResendService {
    private readonly client: Resend;

    constructor(private readonly config: ConfigService) {
        const key = this.config.get<string>("RESEND_API_KEY");
        if (!key) throw new InternalServerErrorException("RESEND_API_KEY not configured");
        this.client = new Resend(key);
    }

    async send(params: { to: string; subject: string; html: string }) {
        const from = this.config.get<string>("EMAIL_FROM");
        if (!from) throw new InternalServerErrorException("EMAIL_FROM not configured");

        return this.client.emails.send({
            from,
            to: params.to,
            subject: params.subject,
            html: params.html,
        }).catch(err => {
            console.error("Resend delivery failed", err);
            throw new InternalServerErrorException("Email delivery failed");
        });
    }
}
