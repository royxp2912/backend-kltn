import { Types } from "mongoose";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsNumberString, IsOptional } from "class-validator";

export class CreateDetailVariantDto {
    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    variant: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    size: string;

    @IsNumberString()
    @IsNotEmpty()
    quantity: number;
}