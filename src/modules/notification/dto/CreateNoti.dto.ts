import { Types } from "mongoose";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { NOTI_TYPE } from "src/constants/schema.enum";

export class CreateNotiDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    body?: string;

    @IsEnum(NOTI_TYPE)
    @IsOptional()
    type?: NOTI_TYPE;

    @IsString()
    @IsOptional()
    relation?: string;
}