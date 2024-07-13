import { IsOptional, IsEnum, IsNotEmpty, IsString, IsDateString } from "class-validator";
import { USER_GENDER, USER_STATUS } from "src/constants/schema.enum";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEnum(USER_GENDER)
    @IsNotEmpty()
    gender: USER_GENDER;

    @IsNotEmpty()
    @IsDateString()
    birthDay: Date;

    @IsOptional()
    @IsEnum(USER_STATUS)
    role?: USER_STATUS;
}