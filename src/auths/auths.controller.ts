import { AuthGuard } from "@nestjs/passport";
import { LoginDto, RegisterDto, SendOTPDto } from "./dto";
import { AuthsService } from "./auths.service";
import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";

@Controller('auths')
export class AuthsController {
    constructor(private readonly authsService: AuthsService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        await this.authsService.register(registerDto);
        return { message: "Register Successful!" }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
        const result = await this.authsService.login(loginDto);

        res.cookie('refreshToken', result.tokens.refreshToken, { httpOnly: true });
        return {
            message: "Login Successful!",
            result: {
                user: result.user,
                token: result.tokens.accessToken,
            }
        }
    }

    @Post('sendOTP')
    async sendOTP(@Body() sendOTPDto: SendOTPDto) {
        const OTP = await this.authsService.sendOTP(sendOTPDto);

        return { message: "Send OTP Successful!", result: OTP }
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    async refresh(@Req() req, @Res({ passthrough: true }) res) {
        const result = await this.authsService.refresh(req.user.userId, req.user.email, req.user.refreshToken);

        res.cookie('refreshToken', result.refreshToken, { httpOnly: true });
        return { message: "Refresh Token succeed", result: result.accessToken };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res) {
        await this.authsService.logout(req.user.userId);
        res.clearCookie('refreshToken', { httpOnly: true });
        return { message: "Logout succeed" };
    }
}