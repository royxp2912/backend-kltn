import { Types } from "mongoose";
import { Type } from "class-transformer";
import { IsObjectId } from "class-validator-mongo-object-id";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateCommentDto {
    @IsObjectId({ message: "comment must be an ObjectId." })
    @IsNotEmpty()
    comment: Types.ObjectId;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    @Type(() => Number)
    rating?: number;

    @IsString()
    @IsOptional()
    content?: string;

    @IsArray()
    @IsOptional()
    images?: string[];
}