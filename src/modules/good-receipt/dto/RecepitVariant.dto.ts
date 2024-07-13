import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ReceipVarianttDto {
    @IsString()
    @IsNotEmpty()
    size: string;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    quantity: number;
}