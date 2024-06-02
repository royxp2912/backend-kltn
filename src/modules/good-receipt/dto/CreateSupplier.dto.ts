import { Type } from "class-transformer";
import { BillingInfomationDto } from "./BillingInfomation.dto";
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty()
    supplier_name: string;

    @IsString()
    @IsNotEmpty()
    contacter_name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @ValidateNested()
    @Type(() => BillingInfomationDto)
    @IsNotEmpty()
    billing_infomation: BillingInfomationDto;
}