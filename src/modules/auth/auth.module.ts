import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { CartModule } from "../cart/cart.module";
import { AuthController } from "./auth.controller";
import { AtStrategy, RtStrategy } from "./strategies";
import { Auth, AuthSchema } from "src/schemas/auth.schema";
import { User, UserSchema } from "src/schemas/user.schema";

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
    providers: [AuthService, AtStrategy, RtStrategy],
    controllers: [AuthController],
})
export class AuthModule { }