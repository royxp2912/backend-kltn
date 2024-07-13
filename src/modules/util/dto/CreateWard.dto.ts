import { IsNotEmpty, IsString } from "class-validator";

export class CreateWardDto {
    @IsString()
    @IsNotEmpty()
    wardId: string;

    @IsString()
    @IsNotEmpty()
    districtId: string;

    @IsString()
    @IsNotEmpty()
    ward_name: string;

    @IsString()
    @IsNotEmpty()
    ward_type: string;
}