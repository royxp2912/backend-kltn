import { Types } from "mongoose";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";

export class CreateImageVariantDto {
    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsEnum(VARIANT_COLOR)
    @IsNotEmpty()
    color: VARIANT_COLOR;

    @IsString()
    @IsNotEmpty()
    image: string;

    constructor(product: Types.ObjectId, color: VARIANT_COLOR, image: string) {
        this.product = product;
        this.color = color;
        this.image = image;
    }
}