import * as crypto from 'crypto';
import { JwtService } from "@nestjs/jwt";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Auth } from "src/schemas/auth.schema";
import { User } from "src/schemas/user.schema";
import { CartService } from '../cart/cart.service';
import { MailerService } from "@nestjs-modules/mailer";
import { compare, encode } from "src/utils/bcrypt/bcrypt";
import { JwtPayload, LoginResponse, Tokens } from "./types";
import { AUTH_TOKENS, USER_ROLES, USER_STATUS } from "src/constants/schema.enum";
import { InitListTokensDto, LoginDto, RegisterDto, SendOTPDto } from "./dto";
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly cartService: CartService,
        private readonly mailerService: MailerService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
    ) { }

    async register(registerDto: RegisterDto): Promise<void> {
        const password = await encode(registerDto.password);
        const newUser = new this.userModel({ ...registerDto, password });
        const result = await newUser.save();
        await this.cartService.create(result._id);
    }

    async loginAdmin(loginDto: LoginDto): Promise<LoginResponse | undefined> {
        const user = await this.userModel.findOne({ email: loginDto.email })
            .select("-__v -createdAt -updatedAt");

        if (!user) throw new HttpException("Invalid Email", HttpStatus.NOT_FOUND);
        if (user.role !== USER_ROLES.Admin) throw new BadRequestException("You are not an administrator.");

        const isCorrectPassword = await compare(loginDto.password, user.password);
        if (!isCorrectPassword) throw new HttpException("Incorrect Password", HttpStatus.BAD_REQUEST);

        if (user.status === USER_STATUS.Locked) throw new ForbiddenException("Your account has been locked!");
        const tokens: Tokens = await this.getTokens(user._id, user.role);
        // Login Done => Create List Tokens 
        await this.initListTokens({ user: user._id, token: tokens.refreshToken });
        const { password, role, status, ...others } = user.toObject();

        const result: LoginResponse = {
            user: others,
            tokens,
        }
        return result;
    }

    async login(loginDto: LoginDto): Promise<LoginResponse | undefined> {
        const user = await this.userModel.findOne({ email: loginDto.email })
            .select("-__v -createdAt -updatedAt");

        if (!user) throw new HttpException("Invalid Email", HttpStatus.NOT_FOUND);

        const isCorrectPassword = await compare(loginDto.password, user.password);
        if (!isCorrectPassword) throw new HttpException("Incorrect Password", HttpStatus.BAD_REQUEST);

        if (user.status === USER_STATUS.Locked) throw new ForbiddenException("Your account has been locked!");
        const tokens: Tokens = await this.getTokens(user._id, user.role);
        // Login Done => Create List Tokens 
        await this.initListTokens({ user: user._id, token: tokens.refreshToken });
        const { password, role, status, ...others } = user.toObject();

        const result: LoginResponse = {
            user: others,
            tokens,
        }
        return result;
    }

    async logout(userId: Types.ObjectId): Promise<void> {
        const isLogged = await this.authModel.findOneAndDelete({ user: userId });
        if (!isLogged) throw new UnauthorizedException("Unauthorized");
    }

    async sendOTP(sendOTPDto: SendOTPDto): Promise<number> {
        const OTP = crypto.randomInt(100000, 999999);
        console.log(OTP);


        try {
            await this.mailerService.sendMail({
                from: `P&P <${process.env.GMAIL_USER}>`,
                to: sendOTPDto.email,
                subject: "Email Authentication From P&P",
                html: this.createContextMail(OTP),
            })
        } catch (err) {
            throw new HttpException(err.message, err.status);
        }

        return OTP;
    }

    async refresh(userId: Types.ObjectId, role: USER_ROLES, token: string): Promise<Tokens> {
        const lastestToken = await this.getTokenLastest(userId);
        if (token !== lastestToken) throw new ForbiddenException("Refresh Token is not valid");

        const newTokens = await this.getTokens(userId, role);

        await this.addNewToken(userId, newTokens.refreshToken);
        return newTokens;
    }

    async getTokens(userId: Types.ObjectId, role: USER_ROLES): Promise<Tokens> {
        const jwtPayload: JwtPayload = { userId, role };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: process.env.JWT_AS,
                expiresIn: process.env.JWT_EXPIRATION_AT,
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: process.env.JWT_RS,
                expiresIn: process.env.JWT_EXPIRATION_RT,
            }),
        ]);

        return {
            accessToken: at,
            refreshToken: rt,
        };
    }

    async getTokenLastest(userId: Types.ObjectId): Promise<string> {
        const isLogged = await this.authModel.findOne({ user: userId });
        if (!isLogged) throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

        const lastest = isLogged.listTokens.pop();
        if (lastest.status === AUTH_TOKENS.Disabled) throw new ForbiddenException("Refresh Token has been Disabled");

        return lastest.value;
    }

    async validateRefreshToken(userId: Types.ObjectId, refreshToken: string) {
        const refreshTokenLasted = await this.getTokenLastest(userId);
        if (refreshTokenLasted !== refreshToken) throw new ForbiddenException('RefreshToken Invalid.');
    }

    async initListTokens(initListTokensDto: InitListTokensDto): Promise<Auth> {
        const isLogged = await this.authModel.findOne({ user: initListTokensDto.user });
        if (isLogged) throw new BadRequestException("User has been logged in");

        const init = new this.authModel({
            user: initListTokensDto.user,
            listTokens: [{
                value: initListTokensDto.token,
            }]
        })

        return await init.save();
    }

    async addNewToken(userId: Types.ObjectId, token: string): Promise<void> {
        // Vô hiệu hóa các RefrestToken cũ
        await this.authModel.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    'listTokens.$[].status': AUTH_TOKENS.Disabled
                }
            }
        );
        // Thêm RefreshToken mới
        await this.authModel.findOneAndUpdate(
            { user: userId },
            {
                $push: {
                    listTokens: { value: token }
                }
            },
        );
    }

    createContextMail(OTP: number): string {
        return `<!doctype html>
    <html lang="en-US">

    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Reset Password Email Template</title>
        <meta name="description" content="Reset Password Email Template.">
        <style type="text/css">
            a:hover {text-decoration: underline !important;}
        </style>
    </head>

    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                              <a href="https://web-demo.online" title="logo" target="_blank">
                                <i class="fas fa-fire"></i>
                              </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td> 
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to confirm your email !</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"><h1>${OTP}</h1></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply confirm your email. A unique otp for email confirmation has been generated for you. To confirm email, copy the otp and paste it into the email confirmation page.
                                            </p>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                OTP will expire after 5 minutes
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>No Copyright@2021</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>

    </html>`
    }
}