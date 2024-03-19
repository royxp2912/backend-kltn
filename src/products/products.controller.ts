import { Types } from 'mongoose';
import { ProductsService } from './products.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { CreateProductDto, GetAllProductDto, GetByCategoryDto, GetByStatusDto, PaginationKeywordSortDto, UpdateProductDto } from './dto';
import {
    Body, Controller, Get, Param, Patch, Post, Put, Query
} from '@nestjs/common';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productService: ProductsService,
        private readonly categoryService: CategoriesService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // CREATE ========================================
    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        // check category exist or not
        await this.categoryService.getById(createProductDto.category);
        await this.productService.create(createProductDto);
        return { message: "Create New Product Succeed" };
    }

    // UPDATE ========================================
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

    @Put()
    async update(@Body() updateProductDto: UpdateProductDto) {
        await this.productService.update(updateProductDto);
        return { message: "Update Product Succeed" };
    }

    // READ ========================================
    @Get("find/by-keyword")
    async findByKeywordASort(@Query() paginationKeywordSortDto: PaginationKeywordSortDto) {
        const result = await this.productService.findByKeywordASort(paginationKeywordSortDto);

        return { message: "Find Product By Keyword Succeed", result: result.data, pages: result.pages };
    }

    @Get(":proId")
    async getById(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        const result = await this.productService.getDetailProduct(proId);

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

