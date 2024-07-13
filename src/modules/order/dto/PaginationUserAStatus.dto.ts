import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { ORDER_STATUS } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class PaginationUserAStatusDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

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