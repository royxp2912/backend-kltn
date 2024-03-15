import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetAllProductDto {
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}