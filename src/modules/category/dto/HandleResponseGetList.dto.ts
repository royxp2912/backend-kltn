import { Types, Document } from "mongoose";
import { Transform } from "class-transformer";
import { Category } from "src/schemas/category.schema";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class HandleResponseGetListDto {
    @IsArray()
    @IsNotEmpty()
    listCates: (Document<unknown, {}, Category> & Category & { _id: Types.ObjectId })[];

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}