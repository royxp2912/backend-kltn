import { Types } from "mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class SendPushDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;
}