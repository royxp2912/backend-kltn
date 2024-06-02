import { Types } from "mongoose";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateCommentDto {
    @IsObjectId({ message: "commentator must be an ObjectId." })
    @IsNotEmpty()
    commentator: Types.ObjectId;

    @IsObjectId({ message: "product must be an ObjectId." })
    @IsNotEmpty()
    product: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    order: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    @Type(() => Number)
    rating: number;

    @IsString()
    @IsOptional()
    content?: string;

    @IsArray()
    @IsOptional()
    images?: string[];
}