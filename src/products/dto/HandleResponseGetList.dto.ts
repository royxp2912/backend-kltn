import { Types, Document } from "mongoose";
import { Transform } from "class-transformer";
import { Product } from "src/schemas/Product.schema";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class HandleResponseGetListDto {
    @IsArray()
    @IsNotEmpty()
    listProducts: (Document<unknown, {}, Product> & Product & { _id: Types.ObjectId })[];

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}