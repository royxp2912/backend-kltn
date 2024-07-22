import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, SendOTPDto } from "./dto";
import { Body, Controller, Post, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { TransformResponseInterceptor } from "src/utils/interceptors/response.interceptor";

@Controller('auths')
@UseInterceptors(TransformResponseInterceptor)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        await this.authService.register(registerDto);
        return { message: "Register Successful!" }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
        const result = await this.authService.login(loginDto);

        res.cookie('refreshToken', result.tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return {
            message: "Login Successful!",
            result: {
                user: result.user,
                token: result.tokens.accessToken,
            }
        }
    }

    @Post('admin/login')
    async loginAdmin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
        const result = await this.authService.loginAdmin(loginDto);

        res.cookie('refreshToken', result.tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
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
        const OTP = await this.authService.sendOTP(sendOTPDto);

        return { message: "Send OTP Successful!", result: OTP }
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    async refresh(@Req() req, @Res({ passthrough: true }) res) {
        const result = await this.authService.refresh(req.user.userId, req.user.role, req.user.refreshToken);

        res.cookie('refreshToken', result.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return { message: "Refresh Token succeed", result: result.accessToken };
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res) {
        await this.authService.logout(req.user.userId);
        res.clearCookie('refreshToken', { httpOnly: true });
        return { message: "Logout succeed" };
    }

    @Post('clear')
    async clearCookie(@Res({ passthrough: true }) res) {
        res.clearCookie('refreshToken', { httpOnly: true });
        return { message: "Clear RefreshToken succeed" };
    }
}