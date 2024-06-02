import { Types } from "mongoose";
import { Transform, Type } from "class-transformer";
import { IsObjectId } from "class-validator-mongo-object-id";
import { DetailGoodReceiptDto } from "./DetailGootReceipt.dto";
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateGoodReceiptDto {
    @IsObjectId({ message: "supplier must be an ObjectId." })
    @IsNotEmpty()
    supplier: Types.ObjectId;

    @IsObjectId({ message: "confirmer must be an ObjectId." })
    @IsNotEmpty()
    confirmer: Types.ObjectId;

    @IsNotEmpty()
    @IsDateString()
    confirmation_date: Date;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @ValidateNested({ each: true })
    @Type(() => DetailGoodReceiptDto)
    @IsNotEmpty()
    details: DetailGoodReceiptDto[];
}