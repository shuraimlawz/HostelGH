import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { User } from "@prisma/client";

export enum AdminAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  PUBLISH = "PUBLISH",
  UNPUBLISH = "UNPUBLISH",
  SUSPEND = "SUSPEND",
  UNSUSPEND = "UNSUSPEND",
  VERIFY = "VERIFY",
  SYSTEM = "SYSTEM",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
}

export enum AdminEntity {
  USER = "USER",
  HOSTEL = "HOSTEL",
  ROOM = "ROOM",
  BOOKING = "BOOKING",
  PAYMENT = "PAYMENT",
  PAYOUT = "PAYOUT",
  SYSTEM = "SYSTEM",
}

@Injectable()
export class AdminAuditLogService {
  private readonly logger = new Logger(AdminAuditLogService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Log an admin action safely.
   * This method is async but we don't await it in the controller to avoid blocking the main request.
   * Errors here should not fail the main request.
   */
  async log(
    admin: User | null,
    action: AdminAction,
    entity: AdminEntity,
    entityId: string | null,
    details: string,
    metadata?: any,
    req?: any,
  ) {
    try {
      const ipAddress = req?.ip || req?.connection?.remoteAddress || "unknown";
      const userAgent = req?.headers?.["user-agent"] || "unknown";

      await this.prisma.adminAuditLog.create({
        data: {
          adminId: admin?.id || null,
          actionType: action,
          entityType: entity,
          entityId: entityId,
          details,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // We log the error but do not throw, to prevent breaking the admin flow
      this.logger.error(
        `Failed to create audit log for admin ${admin?.id} on ${entity} ${entityId}`,
        (error as any).stack,
      );
    }
  }
}
