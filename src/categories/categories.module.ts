import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";
import { Category, CategorySchema } from "src/schemas/Category.schema";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
        CloudinaryModule
    ],
    providers: [CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService],
})
export class CategoriesModule { }