import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class PaginationProductDto {
    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}