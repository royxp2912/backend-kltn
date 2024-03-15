import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsNotEmpty, IsNumberString, IsString, Validate } from "class-validator";

export class CreateDlvAddDto {
    @IsObjectId({ message: "User must be an ObjectId" })
    @IsNotEmpty()
    user: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    receiver: string;

    @IsNumberString()
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