import { Types } from "mongoose";
import { Type } from "class-transformer";
import { IsObjectId } from "class-validator-mongo-object-id";
import { UpdateBillingInfomationDto } from "./UpdateBillingInfomation.dto";
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class UpdateSupplierDto {
    @IsObjectId({ message: "supplier must be an ObjectId." })
    @IsNotEmpty()
    supplier: Types.ObjectId;

    @IsString()
    @IsOptional()
    supplier_name?: string;

    @IsString()
    @IsOptional()
    contacter_name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @ValidateNested()
    @Type(() => UpdateBillingInfomationDto)
    @IsOptional()
    billing_infomation?: UpdateBillingInfomationDto;
}