import { BILLING_METHOD } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateBillingInfomationDto {
    @IsEnum(BILLING_METHOD)
    @IsOptional()
    method?: BILLING_METHOD;

    @IsString()
    @IsOptional()
    bank?: string;

    @IsString()
    @IsOptional()
    bank_account?: string;
}