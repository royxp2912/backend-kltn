import { Types, Document } from "mongoose";
import { Transform } from "class-transformer";
import { UserCoupon } from "src/schemas/UserCoupon.schema";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class HandleResponseGetListByUserDto {
    @IsArray()
    @IsNotEmpty()
    listCoupons: (Document<unknown, {}, UserCoupon> & UserCoupon & { _id: Types.ObjectId })[];

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}