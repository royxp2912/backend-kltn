import { Transform } from "class-transformer";
import { ORDER_STATUS } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class PaginationStatusDto {
    @IsEnum(ORDER_STATUS)
    @IsNotEmpty()
    status: ORDER_STATUS;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}