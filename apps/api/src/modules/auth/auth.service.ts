import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes, createHash } from "crypto";
import { EmailService } from "../email/email.service";

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
  ) { }

  async register(dto: RegisterDto) {
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException(
        "Cannot register as an ADMIN via public endpoint",
      );
    }
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException("Email already in use");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return {
      token: tokens.accessToken,
      userId: user.id,
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user)
      throw new UnauthorizedException("Invalid email or password");

    if (!user.isActive)
      throw new UnauthorizedException("Account is inactive");

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid email or password");

    const tokens = await this.issueTokens(user.id, user.role);
    return {
      token: tokens.accessToken,
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

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Invalid user");

    // rotate token: revoke old one
    await this.prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(user.id, user.role);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
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
          role: UserRole.TENANT, // Default to tenant temporarily
          emailVerified: true,
          isOnboarded: false, // Force role selection
        },
      });
    } else if (!user.googleId) {
      // Link existing email-only account to Google
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
        this.prisma.wallet.deleteMany({ where: { ownerId: userId } }),
        this.prisma.payoutRequest.deleteMany({ where: { ownerId: userId } }),
        this.prisma.subscription.deleteMany({ where: { ownerId: userId } }),
        this.prisma.payoutMethod.deleteMany({ where: { ownerId: userId } })
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success silently for security to avoid email enumeration
      return { message: "If an account exists, a reset link was sent." };
    }

    // Generate secure token
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = sha256(rawToken);

    // Set expiry 1 hr from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Delete any old unused tokens for this user
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

    // Send email with the raw unhashed token in the link
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

    // Hash the new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    });

    // Delete the token so it can't be used twice
    await this.prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return { message: "Password has been successfully reset." };
  }

  private async issueTokens(userId: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: this.config.get<string>("jwt.accessSecret"),
        expiresIn: "7d",
      },
    );

    const refreshPlain = randomBytes(48).toString("hex");
    const refreshHash = sha256(refreshPlain);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: refreshHash, expiresAt },
    });

    return { accessToken, refreshToken: refreshPlain };
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
}
