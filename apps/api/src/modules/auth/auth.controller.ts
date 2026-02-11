import { Body, Controller, Post, Req, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto, RefreshTokenDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post("register")
    @ApiOperation({ summary: "Register a new user" })
    @ApiResponse({ status: 201, description: "User successfully registered" })
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Login and get tokens" })
    @ApiResponse({ status: 200, description: "Returns access and refresh tokens" })
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
}

