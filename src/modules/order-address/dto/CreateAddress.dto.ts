import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAddressDto {
    @IsString()
    @IsNotEmpty()
    receiver: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    province: string;

    @IsString()
    @IsNotEmpty()
    districts: string;

    @IsString()
    @IsNotEmpty()
    wards: string;

    @IsString()
    @IsNotEmpty()
    specific: string;
}