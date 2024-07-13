import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { CartModule } from "../cart/cart.module";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AtStrategy, RtStrategy } from "./strategies";
import { Auth, AuthSchema } from "src/schemas/auth.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { AtAdminStrategy } from "./strategies/at-admin.strategy";
import { RtAdminStrategy } from "./strategies/rt-admin-strategy";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Auth.name, schema: AuthSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
        CartModule,
    ],
    providers: [AuthService, AtStrategy, RtStrategy, AtAdminStrategy, RtAdminStrategy],
    controllers: [AuthController],
})
export class AuthModule { }