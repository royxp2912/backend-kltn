import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class DetailYearEachCategoryDto {
    @IsObjectId({ message: "category must be an ObjectId" })
    @IsNotEmpty()
    category: Types.ObjectId;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    year: number;
}