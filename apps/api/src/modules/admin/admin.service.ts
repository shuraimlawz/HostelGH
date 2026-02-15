import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { BroadcastMessageDto } from "./dto/broadcast-message.dto";

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationsService
    ) { }

    async getStats() {
        const [totalUsers, liveHostels, bookings, revenue] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.hostel.count({ where: { isPublished: true } }),
            this.prisma.booking.count(),
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: "SUCCESS" }
            })
        ]);

        return {
            totalUsers,
            liveHostels,
            bookings,
            revenue: revenue._sum.amount || 0
        };
    }

    async getActivity() {
        const [users, bookings, payments, hostels] = await Promise.all([
            this.prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, email: true, createdAt: true, role: true }
            }),
            this.prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { tenant: { select: { id: true, firstName: true, email: true } } }
            }),
            this.prisma.payment.findMany({
                take: 5,
                where: { status: "SUCCESS" },
                orderBy: { createdAt: 'desc' },
                include: { booking: { include: { tenant: { select: { id: true, firstName: true, email: true } } } } }
            }),
            this.prisma.hostel.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { owner: { select: { id: true, firstName: true, email: true } } }
            })
        ]);

        const activities = [
            ...users.map(u => ({
                id: u.id,
                user: u.firstName || u.email.split('@')[0],
                action: `Registered as ${u.role.toLowerCase()}`,
                time: u.createdAt,
                type: "success",
                targetUrl: `/admin/users?search=${u.email}`
            })),
            ...bookings.map(b => ({
                id: b.id,
                user: b.tenant.firstName || b.tenant.email.split('@')[0],
                action: "Created a new booking",
                time: b.createdAt,
                type: "info",
                targetUrl: `/admin/users?search=${b.tenant.email}`
            })),
            ...payments.map(p => ({
                id: p.id,
                user: p.booking.tenant.firstName || p.booking.tenant.email.split('@')[0],
                action: `Payment successful (₵${(p.amount / 100).toFixed(2)})`,
                time: p.createdAt,
                type: "success",
                targetUrl: `/admin/users?search=${p.booking.tenant.email}`
            })),
            ...hostels.map(h => ({
                id: h.id,
                user: h.owner.firstName || h.owner.email.split('@')[0],
                action: `Listed new hostel: ${h.name}`,
                time: h.createdAt,
                type: "warning",
                targetUrl: `/hostels/${h.id}` // Public hostel page or arguably admin edit page
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);

        return activities;
    }

    async getSecurityAlerts() {
        // Real logic: Check for unverified emails or other potential issues
        // We can add more complex logic here (e.g. failed login logs if we stored them)
        // For now, return empty if system is healthy, effectively removing "false info".

        const unverifiedAdmins = await this.prisma.user.count({
            where: { role: "ADMIN", emailVerified: false }
        });

        const alerts = [];

        if (unverifiedAdmins > 0) {
            alerts.push({
                type: "critical",
                message: `${unverifiedAdmins} Admin account(s) pending verification`,
                time: new Date()
            });
        }

        return alerts;
    }

    async createInternalUser(dto: CreateInternalUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new BadRequestException("User already exists");

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                role: dto.role,
                firstName: dto.firstName,
                lastName: dto.lastName,
                isOnboarded: true,
                emailVerified: true
            }
        });

        const { passwordHash, ...result } = user;
        return result;
    }

    async broadcastMessage(dto: BroadcastMessageDto) {
        const users = await this.prisma.user.findMany({
            where: { emailNotifications: true },
            select: { email: true, firstName: true }
        });

        if (users.length === 0) {
            return {
                success: true,
                recipients: 0,
                message: "No users with email notifications enabled"
            };
        }

        // Send emails to all users (in production, use a queue like BullMQ for better performance)
        const emailPromises = users.map(user =>
            this.notifications.sendBroadcastEmail(user.email, {
                title: dto.title,
                message: dto.message,
                type: dto.type
            }).catch(err => {
                console.error(`Failed to send broadcast to ${user.email}:`, err.message);
                return null; // Continue even if one email fails
            })
        );

        await Promise.all(emailPromises);

        return {
            success: true,
            recipients: users.length,
            message: `Broadcast sent to ${users.length} user(s)`
        };
    }
}
