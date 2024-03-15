import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsNumberString, IsOptional, IsString, Validate } from "class-validator";

export class UpdateDlvAddDto {
    @IsObjectId({ message: "address must be an ObjectId" })
    @IsNotEmpty()
    address: Types.ObjectId;

    @IsString()
    @IsOptional()
    receiver?: string;

    @IsNumberString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    province?: string;

    @IsString()
    @IsOptional()
    districts?: string;

    @IsString()
    @IsOptional()
    wards?: string;

    @IsString()
    @IsOptional()
    specific?: string;
}