import { Transform } from "class-transformer";
import { SORT } from "src/constants/dto..enum";
import { PRODUCT_BRAND, VARIANT_COLOR } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class PaginationKeywordSortDto {
    @IsString()
    @IsNotEmpty()
    keyword: string;

    @IsEnum(SORT)
    @IsOptional()
    sort?: SORT;

    @IsEnum(VARIANT_COLOR)
    @IsOptional()
    color?: VARIANT_COLOR;

    @IsEnum(PRODUCT_BRAND)
    @IsOptional()
    brand?: PRODUCT_BRAND;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}