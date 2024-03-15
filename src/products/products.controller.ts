import { CreateProductDto, GetAllProductDto, GetByCategoryDto, GetByStatusDto } from './dto';
import { ProductsService } from './products.service';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
    Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UploadedFiles, UseInterceptors
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PRODUCT_BRAND } from 'src/constants/schema.enum';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { CategoriesService } from 'src/categories/categories.service';

@Controller('products')
export class ProductsController {

    constructor(
        private readonly productService: ProductsService,
        private readonly categoryService: CategoriesService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // POST ========================================
    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        // check category exist or not
        await this.categoryService.getById(createProductDto.category);

        await this.productService.create(createProductDto);

        return { message: "Create New Product Succeed" };
    }

    // PATCH - PUT ========================================
    @Patch("lock/:proId")
    async lock(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        await this.productService.lock(proId);

        return { message: "Lock Product Succeed" };
    }

    @Patch("hide/:proId")
    async hide(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        await this.productService.hide(proId);

        return { message: "Hide Product Succeed" };
    }

    @Patch("unLockOrHide/:proId")
    async unLockOrHide(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        await this.productService.unLockOrHide(proId);

        return { message: "UnLock Or UnHide Product Succeed" };
    }

    // GET ========================================
    @Get(":proId")
    async getById(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        const result = await this.productService.getById(proId);

        return { message: "Get Product Succeed", result };
    }

    @Get("brand/quantity")
    async getQuantityEachBrand() {
        const result = await this.productService.getQuantityEachBrand();

        return { message: "Get Quantity Product Each Brand Succeed", result };
    }

    @Get("find/by-category")
    async getByCategory(@Query() getByCategoryDto: GetByCategoryDto) {
        const result = await this.productService.getByCategory(getByCategoryDto);

        return { message: "Get Product By Category Succeed", result: result.data, pages: result.pages };
    }

    @Get("find/by-status")
    async getByStatus(@Query() getByStatusDto: GetByStatusDto) {
        const result = await this.productService.getByStatus(getByStatusDto);

        return { message: "Get Product By Status Succeed", result: result.data, pages: result.pages };
    }

    @Get()
    async getAll(@Query() getAllProductDto: GetAllProductDto) {
        const result = await this.productService.getAll(getAllProductDto);

        return { message: "Get All Product Succeed", result: result.data, pages: result.pages };
    }

    // DELETE ========================================
}

