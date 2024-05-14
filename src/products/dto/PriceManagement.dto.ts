import { Types } from "mongoose";
import { PRODUCT_BRAND } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsEnum, IsOptional, IsArray, IsNumber } from "class-validator";
import { OPTION_PRICE_MANAGEMENT, PART_PRICE_MANAGEMENT, TYPE_PRICE_MANAGEMENT } from "../constants";

export class PriceManagementDto {
    @IsArray()
    @IsOptional()
    selected?: Types.ObjectId[];

    @IsObjectId({ message: "category must be an ObjectId" })
    @IsOptional()
    category?: Types.ObjectId;

    @IsEnum(PRODUCT_BRAND)
    @IsOptional()
    brand?: PRODUCT_BRAND;

    @IsNumber()
    @IsNotEmpty()
    value: number;

    @IsEnum(OPTION_PRICE_MANAGEMENT)
    @IsNotEmpty()
    option: OPTION_PRICE_MANAGEMENT;

    @IsEnum(TYPE_PRICE_MANAGEMENT)
    @IsNotEmpty()
    type: TYPE_PRICE_MANAGEMENT;

    @IsEnum(PART_PRICE_MANAGEMENT)
    @IsNotEmpty()
    part: PART_PRICE_MANAGEMENT;
}