import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { USER_COUPON_STATUS } from "src/constants/schema.enum";

export class PaginationUserStatusDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsEnum(USER_COUPON_STATUS)
    @IsNotEmpty()
    status: USER_COUPON_STATUS;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}