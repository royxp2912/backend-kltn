import { Types } from "mongoose";
import { PRODUCT_BRAND } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsNumberString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    // @IsArray()
    // @IsOptional()
    // images?: string[];

    @IsString()
    @IsNotEmpty()
    desc: string;

    @IsObjectId({ message: "category must be an ObjectId" })
    @IsNotEmpty()
    category: Types.ObjectId;

    @IsEnum(PRODUCT_BRAND)
    @IsNotEmpty()
    brand: PRODUCT_BRAND;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    // @IsString()
    // @IsNotEmpty()
    // variants: string;
}