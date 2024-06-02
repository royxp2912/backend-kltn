import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { Category, CategorySchema } from "src/schemas/category.schema";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
        CloudinaryModule
    ],
    providers: [CategoryService],
    controllers: [CategoryController],
    exports: [CategoryService],
})
export class CategoryModule { }