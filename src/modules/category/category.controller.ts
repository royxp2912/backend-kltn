import { CreateCateDto } from "./dto/CreateCate.dto";
import { CategoryService } from "./category.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { ValidateObjectIdPipe } from "src/utils/customPipe/validateObjectId.pipe";
import {
    Body, Controller, Delete, FileTypeValidator, Get, HttpException, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseInterceptors
} from "@nestjs/common";
import { Types } from "mongoose";
import { PaginationFindKeywordDto, UpdateCateDto } from "./dto";
import { TransformResponseInterceptor } from "src/utils/interceptors/response.interceptor";

@Controller('categories')
@UseInterceptors(TransformResponseInterceptor)
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly cloudinaryService: CloudinaryService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                    new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
                ]
            }),
        ) file: Express.Multer.File,
        @Body('name') name: string) {
        const found = await this.categoryService.getByName(name);
        if (found) throw new HttpException("Category Exist", HttpStatus.CONFLICT);

        const resultUpload = await this.cloudinaryService.uploadFile(file);
        const newCate: CreateCateDto = new CreateCateDto(name, resultUpload.url)
        await this.categoryService.createCategory(newCate);

        return { message: "Create New Category Succeed" };
    }

    // @Put()
    // @UseInterceptors(FileInterceptor('file'))
    // async update(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Body('name') name: string,
    //     @Body('category', new ValidateObjectIdPipe()) cateId: Types.ObjectId) {

    //     const found = await this.categoryService.getById(cateId);
    //     const update: UpdateCateDto = new UpdateCateDto(found.name, found.img);

    //     if (file) {
    //         await this.cloudinaryService.deleteImageOnCloud(found.img);
    //         update.img = await (await this.cloudinaryService.uploadFile(file)).url;
    //     }
    //     if (name) update.name = name;

    //     await this.categoryService.updateCategory(cateId, update);

    //     return { message: "Update Category Succeed" };
    // }

    @Put()
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @UploadedFile() file: Express.Multer.File,
        @Body() updateCateDto: UpdateCateDto,) {
        const found = await this.categoryService.getById(updateCateDto.category);

        if (file) {
            await this.cloudinaryService.deleteImageOnCloud(found.img);
            updateCateDto.img = await (await this.cloudinaryService.uploadFile(file)).url;
        }
        if (!updateCateDto.name) updateCateDto.name = found.name;

        await this.categoryService.updateCategory(updateCateDto);

        return { message: "Update Category Succeed" };
    }

    @Get("find/by-keyword")
    async findByKeyword(@Query() paginationFindKeywordDto: PaginationFindKeywordDto) {
        const result = await this.categoryService.findByKeyword(paginationFindKeywordDto);
        return { message: "Find By Keyword Succeed", result: result.data, pages: result.pages }
    }

    @Get(":cateId")
    async getById(@Param('cateId', new ValidateObjectIdPipe()) cateId: Types.ObjectId) {
        const result = await this.categoryService.getById(cateId);
        return { message: "Get Category By Id Succeed", result }
    }

    @Get()
    async getAllCategory() {
        const result = await this.categoryService.getAll();
        return { message: "Get All Category Succeed", result, total: result.length }
    }

    @Delete(":cateId")
    async deleteById(@Param('cateId', new ValidateObjectIdPipe()) cateId: Types.ObjectId) {
        const found = await this.categoryService.getById(cateId);

        // delete image on cloudinary
        await this.cloudinaryService.deleteImageOnCloud(found.img);
        // delete category
        await this.categoryService.deleteById(cateId);

        return { message: "Delete Category By Id Succeed" }
    }

    @Delete()
    async deleteAll() {
        const allCategory = await this.categoryService.getAll();
        await Promise.all(allCategory.map((cate) => (this.cloudinaryService.deleteImageOnCloud(cate.img))));
        await this.categoryService.deleteAll();
        return { message: "Delete All Category By Id Succeed" }
    }
}