import { IsNotEmpty, IsString } from "class-validator";

export class CreateProvinceDto {
    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @IsString()
    @IsNotEmpty()
    province_name: string;

    @IsString()
    @IsNotEmpty()
    province_type: string;
}