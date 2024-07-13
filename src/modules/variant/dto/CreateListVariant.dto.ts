import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsArray, IsString, IsOptional, IsEnum } from "class-validator";
import { VARIANT_COLOR } from "src/constants/schema.enum";

export class CreateListVariantDto {
    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsString()
    @IsOptional()
    image?: string;

    @IsEnum(VARIANT_COLOR)
    @IsNotEmpty()
    color: VARIANT_COLOR;

    @IsString()
    @IsNotEmpty()
    details: string;
}