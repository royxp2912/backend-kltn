import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetAllProductDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsOptional()
    user?: Types.ObjectId;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}