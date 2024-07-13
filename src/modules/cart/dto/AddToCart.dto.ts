import { Types } from "mongoose";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddToCartDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsEnum(VARIANT_COLOR)
    @IsNotEmpty()
    color: VARIANT_COLOR;

    @IsString()
    @IsNotEmpty()
    size: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;
}