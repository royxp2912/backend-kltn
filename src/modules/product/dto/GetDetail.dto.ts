import { Types } from "mongoose";
import { PRODUCT_BRAND } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsNumberString, IsOptional } from "class-validator";

export class GetDetailDto {
    @IsObjectId({ message: "product must be an ObjectId" })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsObjectId({ message: "user must be an ObjectId" })
    @IsOptional()
    user?: Types.ObjectId;
}