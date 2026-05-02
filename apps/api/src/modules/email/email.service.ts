import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from 'resend';

@Injectable()
export class EmailService implements OnModuleInit {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);

    constructor(private config: ConfigService) { }

    async onModuleInit() {
        const apiKey = this.config.get<string>("app.resendApiKey");

        if (apiKey) {
            this.resend = new Resend(apiKey);
            this.logger.log("Email service initialized with official Resend SDK");
        } else {
            this.logger.warn("RESEND_API_KEY is missing in configuration mapping. Email delivery will fail.");
        }
    }

    /**
     * Sends an email using the official Resend SDK.
     * Follows the { data, error } pattern.
     */
    async send(options: {
        to: string | string[];
        subject: string;
        html: string;
        from?: string;
        text?: string;
        idempotencyKey?: string;
    }) {
        if (!this.resend) {
            this.logger.error("Resend client not initialized. Check RESEND_API_KEY mapping in configuration.ts.");
            return { data: null, error: { message: "Client not initialized", name: "InitError" } };
        }

        const defaultFrom = this.config.get<string>("app.emailFrom") || 'HostelGH <onboarding@resend.dev>';
        
        const { data, error } = await this.resend.emails.send({
            from: options.from || defaultFrom,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            idempotencyKey: options.idempotencyKey,
        });

        if (error) {
            this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
            return { data: null, error };
        }

        this.logger.log(`Email sent successfully: ${data.id}`);
        return { data, error: null };
    }

    async sendPasswordResetEmail(to: string, resetToken: string) {
        const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
        const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">HostelGH Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not request a password reset, please ignore this email.</p>
          <p style="font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
        </div>
      `;

        return this.send({
            to,
            subject: "Password Reset Request",
            html,
            idempotencyKey: `pw-reset/${to}-${Date.now()}`,
        });
    }

    async sendEmailVerification(to: string, verifyToken: string) {
        const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
        const verifyLink = `${frontendUrl}/auth/verify-email?token=${verifyToken}`;

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Confirm your email</h2>
          <p>Thanks for creating a HostelGH account. Please verify your email to activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not create an account, you can ignore this email.</p>
          <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
        </div>
      `;

        return this.send({
            to,
            subject: "Verify your email",
            html,
            idempotencyKey: `verify-email/${to}`,
        });
    }
}
