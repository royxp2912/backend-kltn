import { IsNotEmpty, IsNumberString } from "class-validator";

export class DetailMonthDto {
    @IsNumberString()
    @IsNotEmpty()
    month: number;

    @IsNumberString()
    @IsNotEmpty()
    year: number;
}