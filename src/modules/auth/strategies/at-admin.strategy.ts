import { ForbiddenException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { USER_ROLES } from "src/constants/schema.enum";
import { JwtPayload } from "../types";

@Injectable()
export class AtAdminStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_AS,
        })
    }

    validate(payload: JwtPayload) {
        if (payload.role !== USER_ROLES.Admin) throw new ForbiddenException("You do not have access to this resource.");
        return payload;
    }
}