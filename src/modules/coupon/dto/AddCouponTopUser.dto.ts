import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Types } from "mongoose";

export class AddCouponTopUserDto {
    @IsObjectId({ message: "first must be an ObjectId." })
    @IsOptional()
    first?: Types.ObjectId;

    @IsObjectId({ message: "first must be an ObjectId." })
    @IsOptional()
    second?: Types.ObjectId;

    @IsObjectId({ message: "first must be an ObjectId." })
    @IsOptional()
    third?: Types.ObjectId;
}