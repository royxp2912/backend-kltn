import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Types } from "mongoose";
import { USER_GENDER } from "src/constants/schema.enum";

export class UpdateUserDto {
    @IsObjectId({ message: "user must be an ObjectId" })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsOptional()
    fullName?: string;

    @IsEnum(USER_GENDER)
    @IsOptional()
    gender?: USER_GENDER;

    @IsOptional()
    @IsDateString()
    birthDay?: Date;
}