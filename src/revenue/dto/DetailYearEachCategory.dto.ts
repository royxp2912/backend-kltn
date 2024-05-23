import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { PRODUCT_BRAND } from "src/constants/schema.enum";

export class DetailYearEachBrandDto {
    @IsEnum(PRODUCT_BRAND)
    @IsNotEmpty()
    brand: PRODUCT_BRAND;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    year: number;
}