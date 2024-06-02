import { IsEmail, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";

export class UpdateEmailDto {
    @IsObjectId({ message: "User must be an ObjectId" })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}