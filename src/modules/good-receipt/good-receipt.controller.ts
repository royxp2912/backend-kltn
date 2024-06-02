import { Types } from 'mongoose';
import { GoodReceiptService } from './good-receipt.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { Body, Controller, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import { CreateGoodReceiptDto } from './dto/CreateGoodReceipt.dto';

@Controller('good-receipts')
@UseInterceptors(TransformResponseInterceptor)
export class GoodReceiptController {
    constructor(private readonly goodReceiptService: GoodReceiptService) { }

    // ======================================== POST =======================================
    @Post("receipt")
    async createGoodReceipt(@Body() createGoodReceiptDto: CreateGoodReceiptDto) {
        await this.goodReceiptService.createGoodReceipt(createGoodReceiptDto);
        return { message: "Create Good Receipt succeed." }
    }     // == RECEIPT

    @Post("supplier")
    async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
        await this.goodReceiptService.createSupplier(createSupplierDto);
        return { message: "Create Supplier succeed." }
    }     // == SUPPLIER

    // ======================================== PUT ========================================
    @Put("supplier")
    async updateSupplier(@Body() updateSupplierDto: UpdateSupplierDto) {
        await this.goodReceiptService.updateSupplier(updateSupplierDto);
        return { message: "Update Supplier succeed." }
    }     // == SUPPLIER

    // ======================================== GET ========================================
    @Get("supplier/:supId")
    async getSupplier(@Param('supId', new ValidateObjectIdPipe()) supId: Types.ObjectId) {
        const result = await this.goodReceiptService.getSupplierById(supId);
        return { message: "Get Supplier succeed.", result }
    }     // == SUPPLIER

    // ======================================= DELETE ======================================
}
