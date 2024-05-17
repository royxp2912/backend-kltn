import { IsNotEmpty, IsNumberString, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Types } from "mongoose";

export class PaymentUrlDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsNumberString()
    @IsNotEmpty()
    total: number;
}