import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNotEmpty, IsNumberString } from "class-validator";

export class UpdateDetailVariantDto {
    @IsObjectId({ message: "variant must be an ObjectId." })
    @IsNotEmpty()
    variant: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    size: string;

    @IsNumberString()
    @IsNotEmpty()
    quantity: number;
}