import { Types } from "mongoose";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Transform } from "class-transformer";

export class PaginationUserDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageSize: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    pageNumber: number = 1;
}