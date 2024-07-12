import { Request } from 'express';
import { AuthService } from '../auth.service';
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { USER_ROLES } from 'src/constants/schema.enum';
import { ForbiddenException, Injectable, Req } from "@nestjs/common";

@Injectable()
export class RtAdminStrategy extends PassportStrategy(Strategy, 'admin-jwt-refresh') {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies['refreshToken']
            ]),
            secretOrKey: process.env.JWT_RS,
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: any) {
        if (payload.role !== USER_ROLES.Admin) throw new ForbiddenException("You do not have access to this resource.");

        const refreshToken: string = req.cookies['refreshToken'];

        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

        await this.authService.validateRefreshToken(payload.userId, refreshToken);

        return { ...payload, refreshToken };
    }
}