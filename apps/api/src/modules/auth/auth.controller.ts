import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto, RefreshTokenDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      // "none" is required for cross-domain (Vercel -> Render)
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });
  }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    if ((result as any).refreshToken) {
      this.setRefreshCookie(res, (result as any).refreshToken);
    }
    return result;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login and get tokens" })
  @ApiResponse({
    status: 200,
    description: "Returns access and refresh tokens",
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @Get("verify-email")
  @ApiOperation({ summary: "Verify email with token" })
  async verifyEmail(@Req() req: Request) {
    const token = req.query?.token as string;
    if (!token) throw new BadRequestException("Verification token missing");
    return this.auth.verifyEmail(token);
  }

  @Post("resend-verification")
  @ApiOperation({ summary: "Resend verification email" })
  async resendVerification(@Body("email") email: string) {
    if (!email) throw new BadRequestException("Email is required");
    return this.auth.resendVerification(email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and revoke refresh token" })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    res.clearCookie("refresh_token", { path: "/auth/refresh" });
    return this.auth.logout(req.user.userId);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    // Read from HttpOnly cookie first (Web) -> fallback to Body (Mobile)
    const token = req.cookies?.refresh_token || dto.refreshToken;
    if (!token) throw new BadRequestException("Refresh token missing");

    // Decode JWT token to figure out who is requesting the refresh silently
    let userId = dto.userId;
    if (!userId) {
      try {
        const decoded = this.jwtService.decode(token) as any;
        userId = decoded?.sub;
      } catch (e) {
        throw new BadRequestException("Invalid refresh token payload");
      }
    }
    if (!userId) throw new BadRequestException("UserId could not be determined");

    const result = await this.auth.refresh(userId, token);
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("impersonate")
  @ApiOperation({ summary: "Admin impersonate a user" })
  impersonate(@Req() req: any, @Body("userId") userId: string) {
    if (!userId) throw new BadRequestException("userId is required");
    return this.auth.impersonateUser(req.user.userId, userId);
  }

  @Patch("onboard")
  @ApiOperation({ summary: "Complete onboarding role selection" })
  async onboard(@Req() req: any, @Body() body: { role: UserRole }, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.completeOnboarding(req.user.userId, body.role);
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("role")
  @ApiOperation({ summary: "Switch user account role (TENANT/OWNER)" })
  async switchRole(@Req() req: any, @Body() body: { role: UserRole }, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.switchRole(req.user.id, body.role);
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Initiate Google OAuth2 flow" })
  googleAuth(@Req() req: any) {
    // Guard handles redirect
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth2 callback" })
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    try {
      const result = await this.auth.validateGoogleUser(req.user);
      const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";

      // Secure the refresh token
      this.setRefreshCookie(res, result.refreshToken);

      const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

      // Only pass access token and user metadata via URL, keeping the long-lived refresh token out of browser history
      const redirectUrl = `${baseUrl}/auth/callback?accessToken=${result.accessToken}&userId=${result.user.id}&role=${result.user.role}&email=${encodeURIComponent(result.user.email)}&isOnboarded=${result.user.isOnboarded}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("[Google OAuth Callback Error]", error.message, error.stack);
      const frontendUrl = this.config.get<string>("app.frontendUrl") || "https://hostelgh.vercel.app";
      const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
      return res.redirect(`${baseUrl}/auth/login?error=OAuthFailed&message=${encodeURIComponent(error.message)}`);
    }
  }

  @Patch("password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change current user password" })
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(req.user.userId, dto);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request a password reset link to be sent to your email" })
  forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException("Email is required");
    }
    return this.auth.forgotPassword(body.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password using the secure token from email" })
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException("Token and new password are required");
    }
    return this.auth.resetPassword(body.token, body.newPassword);
  }
}
