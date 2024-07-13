import { Types } from 'mongoose';
import { GoodReceiptService } from './good-receipt.service';
import { CreateGoodReceiptDto } from './dto/CreateGoodReceipt.dto';
import { CreateSupplierDto, PaginationAllDto, UpdateSupplierDto } from './dto';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import { Body, Controller, Get, Param, Post, Put, UseInterceptors, Query, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('good-receipts')
@UseInterceptors(TransformResponseInterceptor)
export class GoodReceiptController {
    constructor(private readonly goodReceiptService: GoodReceiptService) { }

    // ======================================== POST =======================================
    @Post("receipts")
    async createGoodReceipt(@Body() createGoodReceiptDto: CreateGoodReceiptDto) {
        await this.goodReceiptService.createGoodReceipt(createGoodReceiptDto);
        return { message: "Create Good Receipt succeed." }
    }     // == RECEIPT

    @Post("suppliers")
    async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
        await this.goodReceiptService.createSupplier(createSupplierDto);
        return { message: "Create Supplier succeed." }
    }     // == SUPPLIER

    // ======================================== PUT ========================================
    @Put("suppliers")
    async updateSupplier(@Body() updateSupplierDto: UpdateSupplierDto) {
        await this.goodReceiptService.updateSupplier(updateSupplierDto);
        return { message: "Update Supplier succeed." }
    }     // == SUPPLIER

    @UseGuards(AuthGuard('admin-jwt'))
    @Patch("receipts/:receiptId")
    async updateReceiptToWarehouse(@Req() req, @Param('receiptId', new ValidateObjectIdPipe()) receiptId: Types.ObjectId) {
        console.log("req: ", req);

        await this.goodReceiptService.updateReceiptToWarehouse(receiptId, req.user.userId);
        return { message: "Update Supplier succeed." }
    }

    // ======================================== GET ========================================
    @Get("receipts")
    async getAllGoodReceipt(@Query() paginationAllDto: PaginationAllDto) {
        const result = await this.goodReceiptService.getAllGoodReceipt(paginationAllDto);
        return { message: "Get All Good Receipt succeed.", pages: result.pages, result: result.data }
    } // == RECEIPT

    @Get("receipts/:receiptId")
    async getDetailReceipt(@Param('receiptId') receiptId: string) {
        const result = await this.goodReceiptService.getDetailGoodReceiptById(receiptId);
        return { message: "Get Detail Good Receipt succeed.", result }
    } // == RECEIPT

    @Get("suppliers")
    async getAllSupplier(@Query() paginationAllDto: PaginationAllDto) {
        const result = await this.goodReceiptService.getAllSupplier(paginationAllDto);
        return { message: "Get All Supplier succeed.", pages: result.pages, result: result.data }
    } // == SUPPLIER

    @Get("suppliers/:supId")
    async getSupplier(@Param('supId', new ValidateObjectIdPipe()) supId: Types.ObjectId) {
        const result = await this.goodReceiptService.getSupplierById(supId);
        return { message: "Get Supplier succeed.", result }
    }     // == SUPPLIER

    // ====================================== DELETE ======================================
    @Delete("receipts")
    async deleteAllReceipts() {
        await this.goodReceiptService.deleteAllReceipts();
        return { message: "Delete All Good Receipt succeed." }
    }// == RECEIPT

    @Delete("suppliers/:supId")
    async deleteSupplierById(@Param('supId', new ValidateObjectIdPipe()) supId: Types.ObjectId) {
        await this.goodReceiptService.deleteSupplierById(supId);
        return { message: "Delete Supplier succeed." }
    }// == SUPPLIER

    @Delete("suppliers")
    async deleteAllSuppliers() {
        await this.goodReceiptService.deleteAllSuppliers();
        return { message: "Delete All Supplier succeed." }
    }// == SUPPLIER
}
