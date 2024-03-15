import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Category } from "src/schemas/Category.schema";
import { CreateCateDto, UpdateCateDto } from "./dto";

@Injectable()
export class CategoriesService {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

    async createCategory(createCateDto: CreateCateDto): Promise<void> {
        const newCate = new this.categoryModel(createCateDto);
        await newCate.save();
    }

    async updateCategory(updateCateDto: UpdateCateDto): Promise<void> {
        const { category, ...others } = updateCateDto;
        await this.categoryModel.findByIdAndUpdate(category, { $set: others });
    }

    async deleteById(cateId: Types.ObjectId): Promise<Category> {
        return await this.categoryModel.findByIdAndDelete(cateId);
    }

    async deleteAll(): Promise<void> {
        await this.categoryModel.deleteMany({});
    }

    async getByName(name: string): Promise<Category> {
        return await this.categoryModel.findOne({ name: name }).select("-__v -createdAt -updatedAt");
    }

    async getById(cateId: Types.ObjectId): Promise<Category> {
        const result = await this.categoryModel.findById(cateId).select("-__v -createdAt -updatedAt");
        if (!result) throw new NotFoundException("Category Not Found");
        return result;
    }

    async getAll(): Promise<Category[]> {
        return await this.categoryModel.find().select("-__v -createdAt -updatedAt");
    }
}