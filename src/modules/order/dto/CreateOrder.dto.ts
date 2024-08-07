import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { ORDER_PAYMENT_METHOD } from "src/constants/schema.enum";
import { DetailProductInOrder } from "src/constants/schema.type";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateOrderDto {
    @IsObjectId({ message: "user must be an ObjectId." })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsObjectId({ message: "deliveryAddress must be an ObjectId." })
    @IsNotEmpty()
    deliveryAddress: Types.ObjectId;

    @IsArray()
    @IsNotEmpty()
    items: DetailProductInOrder[];

    @IsEnum(ORDER_PAYMENT_METHOD)
    @IsOptional()
    paymentMethod?: ORDER_PAYMENT_METHOD;

    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsNumber()
    @IsOptional()
    discountAmount?: number;

    @IsObjectId({ message: "coupon must be an ObjectId." })
    @IsOptional()
    coupon?: Types.ObjectId;
}