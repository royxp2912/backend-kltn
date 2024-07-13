import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Types } from "mongoose";

export class UpdateCateDto {
    @IsObjectId({ message: "category must be an ObjectId." })
    @IsNotEmpty()
    category: Types.ObjectId;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    img?: string;

    constructor(name: string, img: string) {
        this.name = name;
        this.img = img;
    }
}