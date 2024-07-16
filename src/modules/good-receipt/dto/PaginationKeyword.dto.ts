import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class PaginationKeywordDto {
    @IsString()
    @IsNotEmpty()
    keyword: string;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}