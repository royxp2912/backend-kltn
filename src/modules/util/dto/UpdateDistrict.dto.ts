import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateDistrictDto {
    @IsString()
    @IsNotEmpty()
    districtId: string;

    @IsString()
    @IsOptional()
    district_name: string;

    @IsString()
    @IsOptional()
    district_type: string;
}