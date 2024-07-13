import { Types } from "mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class InitListTokensDto {
    @IsObjectId({ message: "User must be an ObjectId" })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    token: string;
}