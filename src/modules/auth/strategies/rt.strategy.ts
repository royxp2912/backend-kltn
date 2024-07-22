import { Request } from 'express';
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthService } from '../auth.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
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
        const refreshToken: string = req.cookies['refreshToken'];

        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

        await this.authService.validateRefreshToken(payload.userId, refreshToken);

        return {
            ...payload,
            refreshToken
        };
    }
}