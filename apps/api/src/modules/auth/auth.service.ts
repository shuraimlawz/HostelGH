import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes, createHash } from "crypto";
import { EmailService } from "../email/email.service";
import { AdminAuditLogService, AdminAction, AdminEntity } from "../admin/admin-audit.service";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly auditLogger: AdminAuditLogService,
  ) { }

  onModuleInit() {
    const accessSecret = this.config.get<string>("jwt.accessSecret");
    const refreshSecret = this.config.get<string>("jwt.refreshSecret");
    
    this.logger.log(`[Auth Audit] JWT Access Secret: ${accessSecret ? accessSecret.length + " chars" : "MISSING"}`);
    this.logger.log(`[Auth Audit] JWT Refresh Secret: ${refreshSecret ? refreshSecret.length + " chars" : "MISSING"}`);
  }

  async register(dto: RegisterDto) {
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException("Cannot register as an ADMIN via public endpoint");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.email },
            ...(dto.phone ? [{ phone: dto.phone }] : [])
          ]
        },
        select: { email: true, phone: true }
      });

      if (existingUser) {
        if (existingUser.email === dto.email) throw new BadRequestException("Email already in use");
        throw new BadRequestException("Phone number already in use");
      }

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: dto.role as UserRole,
          firstName: dto.firstName,
          middleName: (dto as any).middleName,
          lastName: dto.lastName,
          phone: dto.phone,
          gender: dto.gender as any,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      const rawToken = await this.prepareVerificationToken(user.email);
      
      this.emailService.sendEmailVerification(user.email, rawToken).catch(err => {
        this.logger.error(`Registration email delivery failed for ${user.email}: ${err.message}`);
      });

      return {
        message: "Account created successfully.",
        requiresEmailVerification: true,
        userId: user.id,
      };

    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new BadRequestException(`A user with this identity already exists.`);
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    let user;
    try {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.phone ? [{ phone: dto.phone }] : [])
          ]
        },
      });
    } catch (error: any) {
      this.logger.error(`Login DB Error: ${error.message}`);
      // Return a user-friendly message for connection/db issues
      throw new BadRequestException("We are experiencing connection issues. Please try again in a few minutes.");
    }



    if (!user) {
      this.auditLogger.log(null, AdminAction.LOGIN_FAILED, AdminEntity.USER, null, `Attempt for ${dto.email || dto.phone}: User not found`);
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isActive) {
      this.auditLogger.log(null, AdminAction.LOGIN_FAILED, AdminEntity.USER, user.id, "Attempt: Account inactive");
      throw new UnauthorizedException("Account is inactive");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException("Please sign in with Google.");
    }

    if (!user.emailVerified) {
      throw new ForbiddenException("Please verify your email to activate your account.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.auditLogger.log(null, AdminAction.LOGIN_FAILED, AdminEntity.USER, user.id, "Attempt: Invalid password");
      throw new UnauthorizedException("Invalid email or password");
    }

    this.auditLogger.log(null, AdminAction.LOGIN_SUCCESS, AdminEntity.USER, user.id, "Success", { role: user.role });

    const tokens = await this.issueTokens(user.id, user.role);
    return {
      userId: user.id,
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const tokenHash = sha256(refreshToken);

    const tokenRow = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!tokenRow) throw new UnauthorizedException("Invalid refresh token");

    this.prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date() },
    }).catch(e => this.logger.error(`Token rotation failed: ${e.message}`));

    return this.issueTokens(userId, null);
  }

  async logout(userId: string) {
    this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }).catch(e => this.logger.error(`Logout revocation failed: ${e.message}`));
    
    return { ok: true };
  }

  async validateGoogleUser(googleUser: any) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.googleId,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          role: UserRole.TENANT as UserRole,
          emailVerified: true,
          isOnboarded: false,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId },
      });
    }

    const tokens = await this.issueTokens(user.id, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
      },
      ...tokens,
    };
  }

  async completeOnboarding(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) {
      throw new BadRequestException("Cannot select ADMIN role");
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role,
        isOnboarded: true,
      },
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return {
      user: { id: user.id, email: user.email, role: user.role, isOnboarded: user.isOnboarded },
      ...tokens,
    };
  }

  async switchRole(userId: string, targetRole: UserRole) {
    if (targetRole === UserRole.ADMIN) {
      throw new BadRequestException("Cannot switch to ADMIN role");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");
    if (user.role === targetRole) throw new BadRequestException(`Already a ${targetRole}`);

    if (targetRole === UserRole.TENANT) {
      const hostels = await this.prisma.hostel.findMany({ select: { id: true }, where: { ownerId: userId } });
      const hostelIds = hostels.map(h => h.id);

      const deleteOperations = [
        this.prisma.subscription.deleteMany({ where: { userId: userId } })
      ];

      if (hostelIds.length > 0) {
        deleteOperations.unshift(
          this.prisma.booking.deleteMany({ where: { hostelId: { in: hostelIds } } }),
          this.prisma.room.deleteMany({ where: { hostelId: { in: hostelIds } } }),
          this.prisma.hostel.deleteMany({ where: { ownerId: userId } })
        );
      }

      await this.prisma.$transaction(deleteOperations as any);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: targetRole },
    });

    const tokens = await this.issueTokens(updatedUser.id, updatedUser.role);
    return {
      user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, isOnboarded: updatedUser.isOnboarded },
      ...tokens,
    };
  }

  async impersonateUser(adminId: string, targetUserId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new UnauthorizedException("Only admins can impersonate");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new BadRequestException("Target user not found");

    this.logger.log(`Admin ${admin.email} is impersonating ${targetUser.email}`);

    const tokens = await this.issueTokens(targetUser.id, targetUser.role);
    return {
      token: tokens.accessToken,
      userId: targetUser.id,
      user: { id: targetUser.id, email: targetUser.email, role: targetUser.role },
      ...tokens,
      isImpersonating: true,
    };
  }

  async changePassword(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException("User not found or password not set");
    }

    const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: "Password updated successfully" };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: "If an account exists, a reset link was sent." };
    }

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = sha256(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(email, rawToken);

    return { message: "If an account exists, a reset link was sent." };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = sha256(token);

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired reset token.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    });

    await this.prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return { message: "Password has been successfully reset." };
  }

  private async issueTokens(userId: string, role: string | null) {
    if (!role) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      role = user?.role || 'TENANT';
    }

    const accessTokenPromise = this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: this.config.get<string>("jwt.accessSecret"),
        expiresIn: "7d",
      },
    );

    const refreshPlain = randomBytes(48).toString("hex");
    const refreshHash = sha256(refreshPlain);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    const refreshTokenPromise = this.prisma.refreshToken.create({
      data: { userId, tokenHash: refreshHash, expiresAt },
    });

    const [accessToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);

    return { accessToken, refreshToken: refreshPlain };
  }

  private async prepareVerificationToken(email: string) {
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    this.prisma.emailVerificationToken.deleteMany({ where: { email } }).catch(() => {});
    
    await this.prisma.emailVerificationToken.create({
      data: { email, token: hashedToken, expiresAt },
    });

    return rawToken;
  }

  async verifyEmail(token: string) {
    const hashedToken = sha256(token);
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired token.");
    }

    await Promise.all([
      this.prisma.user.update({ where: { email: record.email }, data: { emailVerified: true } }),
      this.prisma.emailVerificationToken.delete({ where: { id: record.id } })
    ]);

    return { ok: true };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, select: { email: true, emailVerified: true } });
    if (!user) throw new BadRequestException("Account not found");
    if (user.emailVerified) return { ok: true, message: "Already verified." };
    
    const rawToken = await this.prepareVerificationToken(email);
    this.emailService.sendEmailVerification(email, rawToken).catch(() => {});
    
    return { ok: true };
  }
}
