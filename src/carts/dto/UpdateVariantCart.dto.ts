import { Types } from "mongoose";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { VARIANT_COLOR } from "src/constants/schema.enum";

export class UpdateVariantCartDto {
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