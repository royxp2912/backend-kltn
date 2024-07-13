import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { INVENTORY_SORT } from "src/constants/dto..enum";

export class PaginationInventoryDto {
    @IsEnum(INVENTORY_SORT)
    @IsOptional()
    sort?: INVENTORY_SORT;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}