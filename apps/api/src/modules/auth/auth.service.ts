import { BadRequestException, Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes, createHash } from "crypto";

function sha256(input: string) {
    return createHash("sha256").update(input).digest("hex");
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) { }

    async register(dto: RegisterDto) {
        if (dto.role === UserRole.ADMIN) {
            throw new BadRequestException("Cannot register as an ADMIN via public endpoint");
        }
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
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
            select: { id: true, email: true, role: true, firstName: true, lastName: true },
        });

        const tokens = await this.issueTokens(user.id, user.role);
        return { user, ...tokens };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isActive) throw new UnauthorizedException("Invalid credentials");

        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException("Invalid credentials");

        const tokens = await this.issueTokens(user.id, user.role);
        return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
    }

    async refresh(userId: string, refreshToken: string) {
        const tokenHash = sha256(refreshToken);

        const tokenRow = await this.prisma.refreshToken.findFirst({
            where: { userId, tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
        });
        if (!tokenRow) throw new UnauthorizedException("Invalid refresh token");

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException("Invalid user");

        // rotate token: revoke old one
        await this.prisma.refreshToken.update({ where: { id: tokenRow.id }, data: { revokedAt: new Date() } });

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
                OR: [
                    { googleId: googleUser.googleId },
                    { email: googleUser.email }
                ]
            }
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
                    isOnboarded: false // Force role selection
                }
            });
        } else if (!user.googleId) {
            // Link existing email-only account to Google
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.googleId }
            });
        }

        const tokens = await this.issueTokens(user.id, user.role);
        return { user: { id: user.id, email: user.email, role: user.role, isOnboarded: user.isOnboarded }, ...tokens };
    }

    async completeOnboarding(userId: string, role: UserRole) {
        if (role === UserRole.ADMIN) {
            throw new BadRequestException("Cannot select ADMIN role");
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                role,
                isOnboarded: true
            },
        });

        const tokens = await this.issueTokens(user.id, user.role);
        return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
    }

    private async issueTokens(userId: string, role: string) {
        const accessToken = await this.jwt.signAsync(
            { sub: userId, role },
            {
                secret: this.config.get<string>('jwt.accessSecret'),
                expiresIn: "15m"
            }
        );

        const refreshPlain = randomBytes(48).toString("hex");
        const refreshHash = sha256(refreshPlain);

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash: refreshHash, expiresAt },
        });

        return { accessToken, refreshToken: refreshPlain };
    }
}
