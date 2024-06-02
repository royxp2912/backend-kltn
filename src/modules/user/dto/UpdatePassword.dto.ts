import { Types } from "mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class UpdatePasswordDto {
    @IsObjectId({ message: "User must be an ObjectId" })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}