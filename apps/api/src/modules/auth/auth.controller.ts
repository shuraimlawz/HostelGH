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
import { AuthService } from "./auth.service";
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
  ) { }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login and get tokens" })
  @ApiResponse({
    status: 200,
    description: "Returns access and refresh tokens",
  })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and revoke refresh token" })
  logout(@Req() req: any) {
    return this.auth.logout(req.user.userId);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.userId, dto.refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("onboard")
  @ApiOperation({ summary: "Complete onboarding role selection" })
  onboard(@Req() req: any, @Body() body: { role: UserRole }) {
    return this.auth.completeOnboarding(req.user.userId, body.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("role")
  @ApiOperation({ summary: "Switch user account role (TENANT/OWNER)" })
  switchRole(@Req() req: any, @Body() body: { role: UserRole }) {
    return this.auth.switchRole(req.user.id, body.role);
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
    const result = await this.auth.validateGoogleUser(req.user);
    const frontendUrl = this.config.get<string>("app.frontendUrl");
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&userId=${result.user.id}&role=${result.user.role}&email=${result.user.email}&isOnboarded=${result.user.isOnboarded}`;
    return res.redirect(redirectUrl);
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
