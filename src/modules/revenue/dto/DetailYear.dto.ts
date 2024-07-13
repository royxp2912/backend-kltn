import { IsNotEmpty, IsNumberString } from "class-validator";

export class DetailYearDto {
    @IsNumberString()
    @IsNotEmpty()
    year: number;
}