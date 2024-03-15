import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies['refreshToken']
            ]),
            secretOrKey: process.env.JWT_RS,
            passReqToCallback: true,
        })
    }

    validate(req: Request, payload: any) {
        const refreshToken: string = req.cookies['refreshToken'];

        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

        return {
            ...payload,
            refreshToken
        };
    }
}