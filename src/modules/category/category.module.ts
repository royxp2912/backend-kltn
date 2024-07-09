import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { Product, ProductSchema } from "src/schemas/product.schema";
import { Category, CategorySchema } from "src/schemas/category.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: Category.name, schema: CategorySchema },
        ]),
        CloudinaryModule
    ],
    providers: [CategoryService],
    controllers: [CategoryController],
    exports: [CategoryService],
})
export class CategoryModule { }