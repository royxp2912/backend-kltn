import { Types, Document } from "mongoose";
import { Transform } from "class-transformer";
import { Coupon } from "src/schemas/Coupon.schema";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class HandleResponseGetAllDto {
    @IsArray()
    @IsNotEmpty()
    listCoupons: (Document<unknown, {}, Coupon> & Coupon & { _id: Types.ObjectId })[];

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}