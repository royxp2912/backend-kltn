import { Types } from "mongoose";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}