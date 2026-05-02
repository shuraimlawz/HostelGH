import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private logger = new Logger(EmailService.name);

    constructor(private config: ConfigService) { }

    async onModuleInit() {
        const smtpHost = this.config.get<string>("SMTP_HOST");
        const smtpPort = this.config.get<number>("SMTP_PORT");
        const smtpUser = this.config.get<string>("SMTP_USER");
        const smtpPass = this.config.get<string>("SMTP_PASS");

        // If we have SMTP credentials, use them (regardless of production/development)
        if (smtpHost && smtpUser && smtpPass) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort || 587,
                secure: (smtpPort || 587) === 465, // use TLS if port is 465
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            this.logger.log(`Email service initialized with SMTP: ${smtpHost}:${smtpPort}`);
            return;
        }

        // Fallback: Development: Use ethereal test account
        this.logger.warn("SMTP configuration incomplete. Falling back to development test account (Ethereal).");
        try {
            const account = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: account.user,
                    pass: account.pass,
                },
            });
            this.logger.log(`Ethereal Email initialized. Emails: https://ethereal.email/login`);
        } catch (err) {
            this.logger.error("Failed to initialize Ethereal fallback", err);
        }
    }

    async send(options: {
        to: string;
        subject: string;
        html: string;
        from?: string;
    }) {
        if (!this.transporter) {
            this.logger.error("Transporter not initialized. Cannot send email.");
            return false;
        }

        const defaultFrom = this.config.get<string>("EMAIL_FROM") || '"HostelGH" <noreply@hostelgh.com>';
        const mailOptions = {
            from: options.from || defaultFrom,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent to ${options.to}`);

            // Log test URL in development
            if (info.messageId?.includes("ethereal")) {
                this.logger.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
            }

            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error);
            return false;
        }
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
        });
    }
}
