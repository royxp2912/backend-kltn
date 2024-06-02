import { Transform } from "class-transformer";
import { USER_STATUS } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class GetByStatusDto {
    @IsEnum(USER_STATUS)
    @IsNotEmpty()
    status: USER_STATUS;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}