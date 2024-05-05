import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class PaymentUrlDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsNumberString()
    @IsNotEmpty()
    total: number;
}