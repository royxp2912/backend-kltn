import { IsEmail, IsNotEmpty } from "class-validator";

export class GetByEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}