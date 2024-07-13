import { COUPON_TYPE } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCouponDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    value: number;

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
    @IsNotEmpty()
    validityDuration: number;
}