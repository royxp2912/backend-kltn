import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DetailYearEachCategoryDto {
    @IsString()
    @IsNotEmpty()
    category: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    year: number;
}