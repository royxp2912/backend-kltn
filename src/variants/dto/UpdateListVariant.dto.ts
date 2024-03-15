import { Types } from "mongoose";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsNumberString, Length, Matches, IsOptional } from "class-validator";

export class UpdateListVariantDto {
    // @IsObjectId({ message: "variant must be an ObjectId." })
    // @IsNotEmpty()
    // variant: Types.ObjectId;

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
    @IsOptional()
    details?: string;
}