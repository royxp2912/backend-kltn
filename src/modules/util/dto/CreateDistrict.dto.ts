import { IsNotEmpty, IsString } from "class-validator";

export class CreateDistrictDto {
    @IsString()
    @IsNotEmpty()
    districtId: string;

    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @IsString()
    @IsNotEmpty()
    district_name: string;

    @IsString()
    @IsNotEmpty()
    district_type: string;
}