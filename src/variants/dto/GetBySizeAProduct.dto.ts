import { Types } from "mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetBySizeAProductDto {
    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    size: string;
}