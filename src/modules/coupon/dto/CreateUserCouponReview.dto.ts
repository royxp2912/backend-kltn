import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateUserCouponReviewDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsOptional()
    @IsNumber()
    quantity?: number;
}