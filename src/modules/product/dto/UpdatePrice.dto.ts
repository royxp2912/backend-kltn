import { Types } from "mongoose";
import { PRODUCT_BRAND } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsEnum, IsOptional, IsArray, IsObject } from "class-validator";

export class UpdatePriceDto {
    @IsArray()
    @IsOptional()
    selected?: Types.ObjectId[];

    @IsObjectId({ message: "category must be an ObjectId" })
    @IsOptional()
    category?: Types.ObjectId;

    @IsEnum(PRODUCT_BRAND)
    @IsOptional()
    brand?: PRODUCT_BRAND;

    @IsObject()
    @IsNotEmpty()
    updateQuery: Object;
}