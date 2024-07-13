import { Request } from 'express';
import { JwtPayload } from "../types";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { USER_ROLES } from 'src/constants/schema.enum';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_AS,
            passReqToCallback: true,
        })
    }

    validate(req: Request, payload: JwtPayload) {
        const userInReq = req.params.userId || req.body.user;
        const userInPayload = payload.userId;
        console.log("payload: ", payload);

        if (userInReq !== userInPayload && payload.role !== USER_ROLES.Admin)
            throw new ForbiddenException("You do not have access to this resource.");

        return payload;
    }
}