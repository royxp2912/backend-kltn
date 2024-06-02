import { Transform, Type } from "class-transformer";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { ReceipVarianttDto } from "./RecepitVariant.dto";

export class DetailGoodReceiptDto {
    @IsString()
    @IsNotEmpty()
    name_product: string;

    @IsEnum(VARIANT_COLOR)
    @IsNotEmpty()
    color: VARIANT_COLOR;

    @ValidateNested()
    @Type(() => ReceipVarianttDto)
    @IsNotEmpty()
    receipt_variant: ReceipVarianttDto;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    unit_price: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    total_quantity: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    total_price: number;
}