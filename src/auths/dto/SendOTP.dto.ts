import { IsNotEmpty, IsEmail } from "class-validator";

export class SendOTPDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}