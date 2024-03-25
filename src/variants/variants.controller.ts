import { Types } from 'mongoose';
import { VariantsService } from './variants.service';
import { VARIANT_COLOR } from 'src/constants/schema.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import {
    CreateListVariantDto, DetailVariantDto, GetByColorAProductDto, GetBySizeAProductDto,
    GetVariantByInfoDto, IncreaseOrReduceDto, UpdateListVariantDto
} from './dto';

@Controller('variants')
export class VariantsController {

    constructor(
        private readonly variantsService: VariantsService,
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
            const found = await this.variantsService.getVarByInfo(createListVariantDto.product, createListVariantDto.color);
            if (found) await this.cloudinaryService.deleteImageOnCloud(found.image);
            const resultUpload = await this.cloudinaryService.uploadFile(image);
            createListVariantDto.image = resultUpload.url;
        }
        await this.variantsService.createList(createListVariantDto);
        return { message: "Create List Variant succeed." }
    }

    // PATCH - PUT ========================================
    @Put()
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @UploadedFile() image: Express.Multer.File,
        @Body() updateListVariantDto: UpdateListVariantDto,) {
        if (image) {
            const found = await this.variantsService.getVarByInfo(updateListVariantDto.product, updateListVariantDto.color);
            await this.cloudinaryService.deleteImageOnCloud(found.image);
            updateListVariantDto.image = await (await this.cloudinaryService.uploadFile(image)).url;
        }

        await this.variantsService.updateList(updateListVariantDto);
        return { message: "Update Variant Succeed" };
    }

    // GET ================================================
    @Get("find/by-size")
    async getColorBySizeAProduct(@Query() getBySizeAProductDto: GetBySizeAProductDto) {
        const result = await this.variantsService.getColorBySizeAndProduct(getBySizeAProductDto.size, getBySizeAProductDto.product);
        return { message: "Get Variant succeed.", result }
    }

    @Get("find/by-color")
    async getSizeByColorAProduct(@Query() getByColorAProductDto: GetByColorAProductDto) {
        const result = await this.variantsService.getSizeByColorAndProduct(getByColorAProductDto.color, getByColorAProductDto.product);
        return { message: "Get Variant succeed.", result }
    }

    @Get("find/by-info")
    async getDetailByInfo(@Query() getVariantByInfoDto: GetVariantByInfoDto) {
        // const result = await this.variantsService.getDetail(getVariantByInfoDto);
        // return { message: "Get Detail Variant succeed.", result }
    }

    @Get(":varId")
    async getById(@Param('varId', new ValidateObjectIdPipe()) varId: Types.ObjectId) {
        const result = await this.variantsService.getById(varId);
        return { message: "Get Variant succeed.", result }
    }

    @Get("find/by-product/:proId")
    async getListColorAndSize(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        // const result = await this.variantsService.getListColorAndSize(proId);
        // return { message: "Get List Variant succeed.", result }
    }

    // DELETE =============================================
    @Delete()
    async deleteAll() {
        await this.variantsService.deleteAll();
        return { message: "Delete Variant succeed." }
    }

    // TEST API =============================================
    @Get("find/by-test/test")
    async test(@Query("product") proId: Types.ObjectId, @Query("color") color: VARIANT_COLOR, @Query("size") size: string) {
        const result = await this.variantsService.getDetail({ product: proId, color: color, size: size });
        return { message: "Find Product By Color succeed.", result }
    }
}
