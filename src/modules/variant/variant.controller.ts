import { Types } from 'mongoose';
import { VariantService } from './variant.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import {
    CreateListVariantDto, GetByColorAProductDto, GetBySizeAProductDto, GetVariantByInfoDto, UpdateListVariantDto
} from './dto';

@Controller('variants')
@UseInterceptors(TransformResponseInterceptor)
export class VariantController {

    constructor(
        private readonly variantService: VariantService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // POST  ==============================================
    @Post()
    @UseInterceptors(FileInterceptor("image"))
    async createList(
        @UploadedFile() image: Express.Multer.File,
        @Body() createListVariantDto: CreateListVariantDto,
    ) {
        if (image) {
            const found = await this.variantService.getVarByInfo(createListVariantDto.product, createListVariantDto.color);
            if (found) await this.cloudinaryService.deleteImageOnCloud(found.image);
            const resultUpload = await this.cloudinaryService.uploadFile(image);
            createListVariantDto.image = resultUpload.url;
        }
        await this.variantService.createList(createListVariantDto);
        return { message: "Create List Variant succeed." }
    }

    // PATCH - PUT ========================================
    @Put()
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @UploadedFile() image: Express.Multer.File,
        @Body() updateListVariantDto: UpdateListVariantDto,) {
        if (image) {
            const found = await this.variantService.getVarByInfo(updateListVariantDto.product, updateListVariantDto.color);
            await this.cloudinaryService.deleteImageOnCloud(found.image);
            updateListVariantDto.image = await (await this.cloudinaryService.uploadFile(image)).url;
        }

        await this.variantService.updateList(updateListVariantDto);
        return { message: "Update Variant Succeed" };
    }

    // GET ================================================
    @Get("find/by-size")
    async getColorBySizeAProduct(@Query() getBySizeAProductDto: GetBySizeAProductDto) {
        const result = await this.variantService.getColorBySizeAndProduct(getBySizeAProductDto.size, getBySizeAProductDto.product);
        return { message: "Get Variant succeed.", result }
    }

    @Get("find/by-color")
    async getSizeByColorAProduct(@Query() getByColorAProductDto: GetByColorAProductDto) {
        const result = await this.variantService.getSizeByColorAndProduct(getByColorAProductDto.color, getByColorAProductDto.product);
        return { message: "Get Variant succeed.", result }
    }

    @Get("find/by-info")
    async getDetailByInfo(@Query() getVariantByInfoDto: GetVariantByInfoDto) {
        const result = await this.variantService.getDetail(getVariantByInfoDto);
        return { message: "Get Detail Variant succeed.", result }
    }

    @Get(":varId")
    async getById(@Param('varId', new ValidateObjectIdPipe()) varId: Types.ObjectId) {
        const result = await this.variantService.getById(varId);
        return { message: "Get Variant succeed.", result }
    }

    @Get("find/by-product/:proId")
    async getListColorAndSize(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        // const result = await this.variantService.getListColorAndSize(proId);
        // return { message: "Get List Variant succeed.", result }
    }

    // DELETE =============================================
    @Delete()
    async deleteAll() {
        await this.variantService.deleteAll();
        return { message: "Delete Variant succeed." }
    }

    // TEST API =============================================
    @Get("find/by-test")
    async test(@Query("product") proId: Types.ObjectId) {
        const result = await this.variantService.getListVariantOfProduct(proId);
        return { message: "Find Product By Color succeed.", result }
    }
}
