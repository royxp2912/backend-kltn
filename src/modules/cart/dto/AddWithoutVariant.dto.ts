import { Types } from "mongoose";
import { IsNotEmpty } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class AddWithoutVariantDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;
}