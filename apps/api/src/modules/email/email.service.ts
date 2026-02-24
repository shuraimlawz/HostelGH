import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private logger = new Logger(EmailService.name);

    constructor(private config: ConfigService) { }

    async onModuleInit() {
        // For development, we use ethereal email to generate preview links
        // In production, you would use real SMTP credentials from env
        const account = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass, // generated ethereal password
            },
        });

        this.logger.log(`Ethereal Email initialized. Emails will be caught at https://ethereal.email/login`);
    }

    async sendPasswordResetEmail(to: string, resetToken: string) {
        const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
        const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: '"HostelGH Security" <noreply@hostelgh.com>',
            to,
            subject: "Password Reset Request",
            html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">HostelGH Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not request a password reset, please ignore this email.</p>
          <p style="font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
        </div>
      `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${to}`);
            this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
            return false;
        }
    }
}
