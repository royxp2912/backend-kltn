import { Types, Document } from "mongoose";
import { Transform } from "class-transformer";
import { Product } from "src/schemas/Product.schema";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class HandleResponseGetListDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsOptional()
    user?: Types.ObjectId;

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