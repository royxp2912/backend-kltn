import { IsNotEmpty, IsString } from "class-validator";

export class CreateCateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    img: string;

    constructor(name: string, img: string) {
        this.name = name;
        this.img = img;
    }
}