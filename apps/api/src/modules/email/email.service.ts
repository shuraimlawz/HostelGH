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
        });

        if (error) {
            this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
            return { data: null, error };
        }

        this.logger.log(`Email sent successfully: ${data.id}`);
        return { data, error: null };
    }

    private getBaseTemplate(title: string, preheader: string, content: string) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9fafb; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                .header { background-color: #2563eb; padding: 30px 40px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                .content { padding: 40px; }
                .content h2 { color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 20px; }
                .content p { font-size: 16px; color: #4b5563; margin-bottom: 24px; }
                .btn-container { text-align: center; margin: 32px 0; }
                .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; }
                .footer { background-color: #f3f4f6; padding: 24px 40px; text-align: center; font-size: 13px; color: #6b7280; }
                .footer a { color: #2563eb; text-decoration: none; }
                .preview-text { display: none; max-height: 0; overflow: hidden; }
            </style>
        </head>
        <body>
            <div class="preview-text">${preheader}</div>
            <div class="container">
                <div class="header">
                    <h1>HostelGH</h1>
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} HostelGH. All rights reserved.</p>
                    <p>If you have any questions, reply to this email or contact <a href="mailto:support@hostelgh.com">support@hostelgh.com</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendPasswordResetEmail(to: string, resetToken: string) {
        const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
        const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

        const content = `
            <h2>Reset Your Password</h2>
            <p>We received a request to reset the password associated with your HostelGH account. Click the button below to choose a new password.</p>
            <div class="btn-container">
                <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email. Your password won't change until you create a new one.</p>
            <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour.</p>
        `;

        return this.send({
            to,
            subject: "Reset your HostelGH password",
            html: this.getBaseTemplate("Reset your HostelGH password", "Click here to securely reset your password.", content),
        });
    }

    async sendEmailVerification(to: string, verifyToken: string) {
        const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
        const verifyLink = `${frontendUrl}/auth/verify-email?token=${verifyToken}`;

        const content = `
            <h2>Verify Your Email Address</h2>
            <p>Welcome to HostelGH! We're excited to have you on board. Before you can start booking or listing hostels, we need to verify your email address.</p>
            <div class="btn-container">
                <a href="${verifyLink}" class="btn">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with HostelGH, you can safely ignore this email.</p>
            <p style="font-size: 14px; color: #6b7280;">This verification link will expire in 24 hours.</p>
        `;

        return this.send({
            to,
            subject: "Welcome to HostelGH - Verify your email",
            html: this.getBaseTemplate("Verify your email address", "Please verify your email address to activate your HostelGH account.", content),
        });
    }

    async sendWelcomeEmail(to: string, firstName?: string) {
        const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
        
        const content = `
            <h2>Welcome to HostelGH! 🎉</h2>
            <p>Hi ${firstName || 'there'},</p>
            <p>Your email has been successfully verified, and your account is fully activated. You're now ready to explore and book verified student accommodations across Ghana, or list your own properties.</p>
            <div class="btn-container">
                <a href="${frontendUrl}/hostels" class="btn">Explore Hostels</a>
            </div>
            <p>We're thrilled to have you in our community. If you ever need help, our support team is just an email away.</p>
        `;

        return this.send({
            to,
            subject: "Welcome to the HostelGH Community!",
            html: this.getBaseTemplate("Welcome to HostelGH", "Your account is fully activated. Start exploring today.", content),
        });
    }
}
