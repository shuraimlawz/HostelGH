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
    // 1. Initial Validations & Hashing (Outside DB)
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException("Cannot register as an ADMIN via public endpoint");
    }

    // Hash password immediately (CPU intensive)
    const passwordHash = await bcrypt.hash(dto.password, 10); // 10 rounds for speed

    try {
      // 2. Sequential Writes (Optimized - No transaction to avoid P2028 timeouts)
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

      // Create User
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

      // 3. Prepare token and fire email (Non-blocking)
      const rawToken = await this.prepareVerificationToken(user.email);
      
      // Fire-and-forget email delivery
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
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email }] : []),
          ...(dto.phone ? [{ phone: dto.phone }] : [])
        ]
      },
    });

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

    // Fire success audit (non-blocking)
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

    // Clean up old tokens without blocking
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
