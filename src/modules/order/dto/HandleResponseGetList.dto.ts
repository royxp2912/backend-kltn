import { Types, Document } from "mongoose";
import { Transform } from "class-transformer";
import { Order } from "src/schemas/order.schema";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class HandleResponseGetListDto {
    @IsArray()
    @IsNotEmpty()
    listOrders: (Document<unknown, {}, Order> & Order & { _id: Types.ObjectId })[];

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}