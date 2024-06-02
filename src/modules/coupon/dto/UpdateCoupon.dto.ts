import { Types } from "mongoose";
import { COUPON_TYPE } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCouponDto {
    @IsObjectId({ message: "coupon must be an ObjectId." })
    @IsNotEmpty()
    coupon: Types.ObjectId;

    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    value?: number;

    @IsEnum(COUPON_TYPE)
    @IsOptional()
    type?: COUPON_TYPE;

    @IsNumber()
    @IsOptional()
    maxDiscount?: number;

    @IsNumber()
    @IsOptional()
    minAmount?: number;

    @IsNumber()
    @IsOptional()
    validityDuration?: number;
}