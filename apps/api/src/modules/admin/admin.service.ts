import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { HostelsService } from "../hostels/hostels.service";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { BroadcastMessageDto } from "./dto/broadcast-message.dto";
import { AdminQueryDto } from "./dto/admin-query.dto";
import {
  AdminAction,
  AdminEntity,
  AdminAuditLogService,
} from "./admin-audit.service";
import { AdminGateway } from "./admin.gateway";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes, createHash } from "crypto";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly hostels: HostelsService,
    private readonly audit: AdminAuditLogService,
    private readonly gateway: AdminGateway,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  async getAnalytics() {
    // Get monthly data for last 6 months
    const now = new Date();
    const monthlyData = [];

    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i),
        1,
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i) + 1,
        0,
      );

      const [users, revenue] = await Promise.all([
        this.prisma.user.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } },
        }),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: "SUCCESS",
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        users,
        revenue: (revenue._sum.amount || 0) / 100,
      });
    }

    return { monthlyData };
  }

  // --- USERS ---

  async getUsers(query: AdminQueryDto) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status === "active") where.isActive = true;
    if (status === "suspended") where.isActive = false;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { ownedHostels: true, bookings: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async toggleUserSuspension(
    adminId: string,
    userId: string,
    suspended: boolean,
  ) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !suspended },
    });

    await this.audit.log(
      admin,
      suspended ? AdminAction.SUSPEND : AdminAction.UNSUSPEND,
      AdminEntity.USER,
      userId,
      `User ${user.email} was ${suspended ? "suspended" : "unsuspended"}`,
      { suspended },
    );

    return user;
  }

  async updateUserRole(adminId: string, userId: string, role: UserRole) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await this.audit.log(
      admin,
      AdminAction.UPDATE,
      AdminEntity.USER,
      userId,
      `User ${user.email} role updated to ${role}`,
      { role },
    );

    return user;
  }

  // --- HOSTELS ---

  async getHostels(query: AdminQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "pending") where.pendingVerification = true;
    if (status === "published") where.isPublished = true;
    if (status === "unpublished") where.isPublished = false;

    const [data, total] = await Promise.all([
      this.prisma.hostel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { rooms: true, bookings: true } },
        },
      }),
      this.prisma.hostel.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async verifyUser(adminId: string, userId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const user = await this.prisma.user.update({
      where: { id: userId },
      // @ts-ignore
      data: { isVerified: true },
    });

    await this.audit.log(
      admin!,
      AdminAction.VERIFY,
      AdminEntity.USER,
      userId,
      `User ${user.email} (Owner) identity verified with Ghana Card`,
    );

    this.gateway.broadcastActivity('USER_VERIFIED', { userId, email: user.email });

    return user;
  }

  async verifyHostel(adminId: string, hostelId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const hostel = await this.hostels.verifyHostel(hostelId);

    // Also set the isVerifiedHostel flag for the badge
    await this.prisma.hostel.update({
      where: { id: hostelId },
      // @ts-ignore
      data: { isVerifiedHostel: true },
    });

    await this.audit.log(
      admin!,
      AdminAction.VERIFY,
      AdminEntity.HOSTEL,
      hostelId,
      `Hostel ${hostel.name} verified and published with verification badge`,
    );

    this.gateway.broadcastActivity('HOSTEL_VERIFIED', { hostelId, name: hostel.name });

    // @ts-ignore
    return { ...hostel, isVerifiedHostel: true };
  }

  async rejectHostel(adminId: string, hostelId: string, reason: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const hostel = await this.hostels.rejectHostel(hostelId, reason);

    await this.audit.log(
      admin,
      AdminAction.REJECT,
      AdminEntity.HOSTEL,
      hostelId,
      `Hostel ${hostel.name} rejected. Reason: ${reason}`,
    );

    return hostel;
  }

  async toggleHostelFeature(
    adminId: string,
    hostelId: string,
    featured: boolean,
  ) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const hostel = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: { isFeatured: featured },
    });

    await this.audit.log(
      admin,
      AdminAction.UPDATE,
      AdminEntity.HOSTEL,
      hostelId,
      `Hostel ${hostel.name} feature status toggled to ${featured}`,
      { featured },
    );

    return hostel;
  }

  async updateHostel(
    adminId: string,
    hostelId: string,
    data: { published?: boolean },
  ) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    const updateData: any = {};
    if (data.published !== undefined) updateData.isPublished = data.published;

    const hostel = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: updateData,
    });

    await this.audit.log(
      admin,
      AdminAction.UPDATE,
      AdminEntity.HOSTEL,
      hostelId,
      `Hostel ${hostel.name} updated`,
      data,
    );

    return hostel;
  }

  // --- BOOKINGS ---

  async getBookings(query: AdminQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { tenant: { email: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          tenant: { select: { email: true, firstName: true, lastName: true } },
          hostel: { select: { name: true } },
          payment: { select: { status: true, amount: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // --- PAYMENTS ---

  async getPayments(query: AdminQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { booking: { tenant: { email: { contains: search } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            include: {
              tenant: { select: { email: true, firstName: true } },
              hostel: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // --- STATS & EXTRAS ---

  async getStats() {
    // ... (Keep existing stats logic, maybe optimize later) ...
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      liveHostels,
      bookings,
      revenue,
      lastMonthUsers,
      lastMonthBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.hostel.count({ where: { isPublished: true } }),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonthStart } },
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonthStart } },
      }),
    ]);

    // ... Calculate trends ...
    const userTrend =
      lastMonthUsers > 0
        ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0; // Simplified for now

    return {
      totalUsers,
      liveHostels,
      bookings,
      revenue: revenue._sum.amount || 0,
      trends: { users: userTrend, bookings: 0 }, // Placeholder
    };
  }

  async getActivity(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.adminAuditLog.count(),
    ]);

    return {
      activities: data.map((log) => ({
        type: this.getLogType(log.actionType),
        user: `${log.admin.firstName} ${log.admin.lastName}`,
        action: log.details,
        time: log.createdAt,
        targetUrl:
          log.entityType === "HOSTEL"
            ? `/admin/hostels?id=${log.entityId}`
            : undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getLogType(action: string): string {
    switch (action) {
      case "SUSPEND":
      case "REJECT":
        return "warning";
      case "DELETE":
        return "critical";
      case "CREATE":
      case "PUBLISH":
      case "APPROVE":
      case "VERIFY":
        return "success";
      default:
        return "info";
    }
  }

  async updatePayoutStatus(adminId: string, id: string, status: any) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });

    return await this.prisma.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.update({
        where: { id },
        data: {
          status: status,
          processedBy: adminId,
        },
        include: { owner: { select: { id: true, email: true } } },
      });

      // If rejected, refund the money to the wallet
      if (status === "REJECTED") {
        await tx.wallet.update({
          where: { ownerId: payout.owner.id },
          data: { balance: { increment: payout.amount } },
        });
      }

      await this.audit.log(
        admin,
        status === "PAID"
          ? AdminAction.APPROVE
          : status === "REJECTED"
            ? AdminAction.REJECT
            : AdminAction.UPDATE,
        AdminEntity.PAYOUT,
        id,
        `Payout request for ${payout.owner.email} updated to ${status}${status === "REJECTED" ? " (Refunded to wallet)" : ""}`,
        { status },
      );

      return payout;
    });
  }

  async broadcastMessage(adminId: string, dto: BroadcastMessageDto) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    // Simulating broadcast - in real app this would send notifications/emails
    await this.audit.log(
      admin!,
      AdminAction.SYSTEM,
      AdminEntity.SYSTEM,
      null,
      `Broadcast message sent: ${dto.title}`,
      dto,
    );
    return { success: true };
  }

  async getSecurityAlerts() {
    return [];
  }

  async getPendingPayouts() {
    return this.prisma.payoutRequest.findMany({
      where: { status: "PENDING" },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            payoutMethods: { where: { isDefault: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInternalUser(dto: any) {
    return {};
  }
  async deleteUser(id: string) {
    return {};
  } // Deprecated in favor of toggleUserSuspension

  async getNotificationCounts() {
    const [pendingHostels, pendingPayouts] = await Promise.all([
      this.prisma.hostel.count({ where: { pendingVerification: true } }),
      this.prisma.payoutRequest.count({ where: { status: "PENDING" } }),
    ]);

    return {
      hostels: pendingHostels,
      payouts: pendingPayouts,
      total: pendingHostels + pendingPayouts,
    };
  }

  async getAlerts() {
    const counts = await this.getNotificationCounts();
    const alerts = [];
    if (counts.hostels > 0) {
      alerts.push({
        message: `${counts.hostels} hostels pending verification`,
        type: "info",
      });
    }
    if (counts.payouts > 0) {
      alerts.push({
        message: `${counts.payouts} payout requests pending`,
        type: "warning",
      });
    }
    return alerts;
  }

  // --- COMMAND CENTER METHODS ---

  async getVerificationQueue() {
    const [pendingHostels, pendingOwners] = await Promise.all([
      this.prisma.hostel.findMany({
        where: { pendingVerification: true },
        include: { owner: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.findMany({
        // @ts-ignore
        where: { role: UserRole.OWNER, isVerified: false, ghanaCardUrl: { not: null } },
        // @ts-ignore
        select: { id: true, firstName: true, lastName: true, email: true, ghanaCardUrl: true, ghanaCardId: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { hostels: pendingHostels, owners: pendingOwners };
  }

  async getDisputes() {
    // @ts-ignore
    return this.prisma.dispute.findMany({
      include: {
        booking: {
          include: {
            tenant: { select: { firstName: true, lastName: true, email: true } },
            hostel: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDisputeStatus(adminId: string, disputeId: string, status: any) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    // @ts-ignore
    const dispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status },
      include: { booking: true }
    });

    await this.audit.log(
      admin!,
      AdminAction.UPDATE,
      AdminEntity.SYSTEM,
      disputeId,
      `Dispute ${disputeId} status updated to ${status}`,
    );

    this.gateway.broadcastActivity('DISPUTE_UPDATED', { disputeId, status });

    return dispute;
  }

  async getFinancialStats() {
    const [totalVolume, escrowBalance, pendingPayouts] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' }
      }),
      this.prisma.wallet.aggregate({
        // @ts-ignore
        _sum: { pendingBalance: true }
      }),
      this.prisma.payoutRequest.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
      })
    ]);

    return {
      totalVolume: totalVolume._sum.amount || 0,
      // @ts-ignore
      escrowBalance: escrowBalance._sum.pendingBalance || 0,
      pendingPayouts: pendingPayouts._sum.amount || 0
    };
  }

  async impersonateUser(adminId: string, targetUserId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new BadRequestException("Only admins can impersonate");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new BadRequestException("Target user not found");

    const accessToken = await this.jwt.signAsync(
      { sub: targetUser.id, role: targetUser.role },
      {
        secret: this.config.get<string>("jwt.accessSecret"),
        expiresIn: "7d",
      },
    );

    const refreshPlain = randomBytes(48).toString("hex");
    const refreshHash = sha256(refreshPlain);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await this.prisma.refreshToken.create({
      data: { userId: targetUser.id, tokenHash: refreshHash, expiresAt },
    });

    await this.audit.log(
      admin,
      AdminAction.SYSTEM,
      AdminEntity.USER,
      targetUserId,
      `Admin ${admin.email} started impersonating ${targetUser.email}`,
    );

    return {
      token: accessToken,
      refreshToken: refreshPlain,
      userId: targetUser.id,
      user: { id: targetUser.id, email: targetUser.email, role: targetUser.role },
    };
  }
}
