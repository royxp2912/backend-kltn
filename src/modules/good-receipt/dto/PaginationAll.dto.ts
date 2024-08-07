import { IsNumber } from "class-validator";
import { Transform } from "class-transformer";

export class PaginationAllDto {
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}