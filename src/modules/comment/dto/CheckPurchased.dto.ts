import { Types } from "mongoose";
import { IsNotEmpty } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class CheckPurchasedDto {
    @IsObjectId({ message: "commentator must be an ObjectId." })
    @IsNotEmpty()
    commentator: Types.ObjectId;

    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;
}