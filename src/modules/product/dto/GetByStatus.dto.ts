import { Transform } from "class-transformer";
import { PRODUCT_STATUS } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class GetByStatusDto {
    @IsEnum(PRODUCT_STATUS)
    @IsNotEmpty()
    status: PRODUCT_STATUS;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}