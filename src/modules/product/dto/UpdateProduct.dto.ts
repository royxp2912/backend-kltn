import { Types } from "mongoose";
import { PRODUCT_BRAND } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNumber, IsEnum, IsOptional, IsNotEmpty } from "class-validator";

export class UpdateProductDto {
    @IsObjectId({ message: "product must be an ObjectId" })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    desc?: string;

    @IsObjectId({ message: "category must be an ObjectId" })
    @IsOptional()
    category?: Types.ObjectId;

    @IsEnum(PRODUCT_BRAND)
    @IsOptional()
    brand?: PRODUCT_BRAND;

    @IsNumber()
    @IsOptional()
    price?: number;
}