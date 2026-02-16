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
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalUsers, liveHostels, bookings, revenue, lastMonthUsers, lastMonthBookings] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.hostel.count({ where: { isPublished: true } }),
            this.prisma.booking.count(),
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: "SUCCESS" }
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: lastMonth, lt: thisMonthStart } }
            }),
            this.prisma.booking.count({
                where: { createdAt: { gte: lastMonth, lt: thisMonthStart } }
            })
        ]);

        const thisMonthUsers = await this.prisma.user.count({
            where: { createdAt: { gte: thisMonthStart } }
        });

        const thisMonthBookings = await this.prisma.booking.count({
            where: { createdAt: { gte: thisMonthStart } }
        });

        // Calculate trends
        const userTrend = lastMonthUsers > 0 ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0;
        const bookingTrend = lastMonthBookings > 0 ? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100) : 0;

        return {
            totalUsers,
            liveHostels,
            bookings,
            revenue: revenue._sum.amount || 0,
            trends: {
                users: userTrend,
                bookings: bookingTrend
            }
        };
    }

    async getAnalytics() {
        // Get monthly data for last 6 months
        const now = new Date();
        const monthlyData = [];

        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);

            const [users, revenue] = await Promise.all([
                this.prisma.user.count({
                    where: { createdAt: { gte: monthStart, lte: monthEnd } }
                }),
                this.prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: "SUCCESS",
                        createdAt: { gte: monthStart, lte: monthEnd }
                    }
                })
            ]);

            monthlyData.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
                users,
                revenue: (revenue._sum.amount || 0) / 100
            });
        }

        return { monthlyData };
    }

    async getActivity(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const fetchCount = Math.max(skip + limit, 50); // Fetch enough to cover sorting

        const [users, bookings, payments, hostels, totalUsers, totalBookings, totalPayments, totalHostels] = await Promise.all([
            this.prisma.user.findMany({
                take: fetchCount,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, email: true, createdAt: true, role: true }
            }),
            this.prisma.booking.findMany({
                take: fetchCount,
                orderBy: { createdAt: 'desc' },
                include: { tenant: { select: { id: true, firstName: true, email: true } } }
            }),
            this.prisma.payment.findMany({
                take: fetchCount,
                where: { status: "SUCCESS" },
                orderBy: { createdAt: 'desc' },
                include: { booking: { include: { tenant: { select: { id: true, firstName: true, email: true } } } } }
            }),
            this.prisma.hostel.findMany({
                take: fetchCount,
                orderBy: { createdAt: 'desc' },
                include: { owner: { select: { id: true, firstName: true, email: true } } }
            }),
            this.prisma.user.count(),
            this.prisma.booking.count(),
            this.prisma.payment.count({ where: { status: "SUCCESS" } }),
            this.prisma.hostel.count()
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
                targetUrl: `/hostels/${h.id}`
            }))
        ]
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(skip, skip + limit);

        const total = totalUsers + totalBookings + totalPayments + totalHostels;

        return {
            activities,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
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

    async getUsers() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                isActive: true
            }
        });
    }

    async updateUserRole(userId: string, role: UserRole) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException("User not found");

        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, email: true, role: true }
        });
    }

    async broadcastMessage(dto: BroadcastMessageDto) {
        try {
            console.log('[Broadcast] Starting broadcast with:', { title: dto.title, type: dto.type });

            const users = await this.prisma.user.findMany({
                where: { emailNotifications: true },
                select: { email: true, firstName: true }
            });

            console.log(`[Broadcast] Found ${users.length} users with email notifications enabled`);

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
                }).then(() => {
                    console.log(`[Broadcast] Successfully sent to ${user.email}`);
                    return true;
                }).catch(err => {
                    console.error(`[Broadcast] Failed to send to ${user.email}:`, err.message, err.stack);
                    return null; // Continue even if one email fails
                })
            );

            const results = await Promise.all(emailPromises);
            const successCount = results.filter(r => r === true).length;

            console.log(`[Broadcast] Completed: ${successCount}/${users.length} emails sent successfully`);

            return {
                success: true,
                recipients: users.length,
                successfulSends: successCount,
                message: `Broadcast sent to ${successCount}/${users.length} user(s)`
            };
        } catch (error) {
            console.error('[Broadcast] Fatal error:', error.message, error.stack);
            throw error;
        }
    }
}
