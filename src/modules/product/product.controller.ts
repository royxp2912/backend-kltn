import { Types } from 'mongoose';
import { Payload } from './types/Payload.type';
import { ProductService } from './product.service';
import { getPayloadOfToken } from 'src/utils/jwt/decode.jwt';
import { CategoryService } from '../category/category.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import {
    CreateProductDto, GetAllProductDto, GetByCategoryDto, GetByStatusDto, PaginationKeywordSortDto, PriceManagementDto, UpdateProductDto
} from './dto';
import {
    Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards, UseInterceptors
} from '@nestjs/common';

@Controller('products')
@UseInterceptors(TransformResponseInterceptor)
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly categoryService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // CREATE ========================================
    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        // check category exist or not
        await this.categoryService.getById(createProductDto.category);
        const result = await this.productService.create(createProductDto);
        return { message: "Create New Product Succeed", result: result._id };
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
    async findByKeywordASort(@Query() paginationKeywordSortDto: PaginationKeywordSortDto, @Req() req) {
        const refreshToken = req.cookies["refreshToken"]
        if (refreshToken) {
            const payload = getPayloadOfToken(refreshToken) as Payload;
            paginationKeywordSortDto.user = payload.userId;
        }

        const result = await this.productService.findByKeywordASort(paginationKeywordSortDto);

        return { message: "Find Product By Keyword Succeed", result: result.data, pages: result.pages };
    }

    @Get("admin/find/by-keyword")
    async findByKeyword(@Query() paginationKeywordSortDto: PaginationKeywordSortDto) {
        const result = await this.productService.findByKeyword(paginationKeywordSortDto);
        return { message: "Find Product By Keyword Succeed", result: result.data, pages: result.pages };
    }

    @Get(":proId")
    async getById(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId, @Req() req) {
        const refreshToken = req.cookies["refreshToken"];
        if (refreshToken) {
            const payload = getPayloadOfToken(refreshToken) as Payload;
            const userId = payload.userId;
            const result = await this.productService.getDetailProduct(proId, userId);
            return { message: "Get Product Succeed", result };
        } else {
            const result = await this.productService.getDetailProduct(proId);
            return { message: "Get Product Succeed", result };
        }
    }

    @Get("admin/:proId")
    async getByIdByAdmin(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        const result = await this.productService.getDetailProductByAdmin(proId);
        return { message: "Get Product Succeed", result };
    }

    @Get("brand/quantity")
    async getQuantityEachBrand() {
        const result = await this.productService.getQuantityEachBrand();

        return { message: "Get Quantity Product Each Brand Succeed", result };
    }

    @Get("find/by-category")
    async getByCategory(@Query() getByCategoryDto: GetByCategoryDto, @Req() req) {
        const refreshToken = req.cookies["refreshToken"]
        if (refreshToken) {
            const payload = getPayloadOfToken(refreshToken) as Payload;
            getByCategoryDto.user = payload.userId;
        }

        const result = await this.productService.getByCategory(getByCategoryDto);

        return { message: "Get Product By Category Succeed", result: result.data, pages: result.pages };
    }

    @Get("find/by-status")
    async getByStatus(@Query() getByStatusDto: GetByStatusDto) {
        const result = await this.productService.getByStatus(getByStatusDto);

        return { message: "Get Product By Status Succeed", result: result.data, pages: result.pages };
    }

    @Get("find/by-favorites")
    async getFavoriteList(@Query() getAllProductDto: GetAllProductDto) {
        const result = await this.productService.getFavoriteList(getAllProductDto);

        return { message: "Get Favorite List of User Succeed", result: result.data, pages: result.pages };
    }

    @Get("action/by-admin")
    async getAllByAdmin(@Query() getAllProductDto: GetAllProductDto, @Req() req) {
        const refreshToken = req.cookies["refreshToken"]
        if (refreshToken) {
            const payload = getPayloadOfToken(refreshToken) as Payload;
            getAllProductDto.user = payload.userId;
        }

        const result = await this.productService.getAll(getAllProductDto);
        return { message: "Get All Product Succeed", result: result.data, pages: result.pages };
    }

    @Get()
    async getAll(@Query() getAllProductDto: GetAllProductDto, @Req() req) {
        const refreshToken = req.cookies["refreshToken"]
        if (refreshToken) {
            const payload = getPayloadOfToken(refreshToken) as Payload;
            getAllProductDto.user = payload.userId;
        }

        const result = await this.productService.getAllByUser(getAllProductDto);
        return { message: "Get All Product Succeed", result: result.data, pages: result.pages };
    }

    // DELETE ========================================
    @Delete(":proId")
    async deleteProductById(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        await this.productService.deleteById(proId);
        return { message: "Delete Product By Id Succeed" };
    }
    // ======================================== PRICE MANAGEMENT ========================================
    @Put("management/price")
    async priceManagement(@Body() priceManagementDto: PriceManagementDto) {
        const result = await this.productService.priceManagement(priceManagementDto);
        return { message: "Update Price Of Product ssSucceed" };
    }
}

