import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthsService } from "./auths.service";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuthsController } from "./auths.controller";
import { AtStrategy, RtStrategy } from "./strategies";
import { Auth, AuthSchema } from "src/schemas/Auth.schema";
import { User, UserSchema } from "src/schemas/User.schema";
import { CartsModule } from "src/carts/carts.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Auth.name, schema: AuthSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
        CartsModule,
    ],
    providers: [AuthsService, AtStrategy, RtStrategy],
    controllers: [AuthsController],
})
export class AuthsModule { }