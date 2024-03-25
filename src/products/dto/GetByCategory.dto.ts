import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetByCategoryDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsOptional()
    user?: Types.ObjectId;

    @IsObjectId({ message: "category must be an ObjectId." })
    @IsNotEmpty()
    category: Types.ObjectId;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}