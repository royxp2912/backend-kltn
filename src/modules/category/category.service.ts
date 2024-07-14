import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCateDto, HandleResponseGetListDto, PaginationFindKeywordDto, UpdateCateDto } from "./dto";
import { Product } from "src/schemas/product.schema";
import { Category } from "src/schemas/category.schema";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>
    ) { }

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
        const found = await this.categoryModel.find().select("-__v -createdAt -updatedAt");
        const result = [];
        for (const cate of found) {
            const total = await (await this.productModel.find({ category: cate._id })).length;
            result.push({
                "_id": cate._id,
                "name": cate.name,
                "img": cate.img,
                "total": total,
            })
        }
        return result;
    }

    async findByKeyword(paginationFindKeywordDto: PaginationFindKeywordDto) {
        const keyword = paginationFindKeywordDto.keyword;
        const pageSize = paginationFindKeywordDto.pageSize || 1;
        const pageNumber = paginationFindKeywordDto.pageNumber || 6;
        const found = await this.categoryModel.find({
            $or: [{ 'name': { $regex: keyword, $options: 'i' } },],
        })
            .select("-__v -createdAt -updatedAt");
        const result = [];
        for (const cate of found) {
            const total = await (await this.productModel.find({ category: cate._id })).length;
            result.push({
                "_id": cate._id,
                "name": cate.name,
                "img": cate.img,
                "total": total,
            })
        }
        return await this.handleResponseGetList({ listCates: result, pageSize, pageNumber });
    }

    // special
    async handleResponseGetList(handleResponseGetListDto: HandleResponseGetListDto) {
        const { listCates, pageSize, pageNumber } = handleResponseGetListDto;

        const pages: number = Math.ceil(listCates.length / pageSize);
        const final = listCates.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const result = { total: listCates.length, pages: pages, data: final }

        return result;
    }
}