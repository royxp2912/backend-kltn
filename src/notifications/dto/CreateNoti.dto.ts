import { Types } from "mongoose";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { NOTI_TYPE } from "src/constants/schema.enum";

export class CreateNotiDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsString()
    @IsOptional()
    type?: NOTI_TYPE;

    @IsString()
    @IsOptional()
    relation?: string;
}