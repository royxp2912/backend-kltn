import { Types } from 'mongoose';
import { CreateDlvAddDto, UpdateDlvAddDto } from './dto';
import { DeliveryAddressService } from './deliveryAddress.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';

@Controller('deliveryAddress')
@UseInterceptors(TransformResponseInterceptor)
export class DeliveryAddressController {
    constructor(private readonly deliveryAddressService: DeliveryAddressService) { }

    // POST ========================================
    @Post()
    async create(@Body() createDlvAddDto: CreateDlvAddDto) {
        await this.deliveryAddressService.create(createDlvAddDto);
        return { message: "Create New Delivery Address Succeed" }
    }

    // PATCH - PUT ========================================
    @Patch("default/:dlvAddId")
    async setDefault(@Param('dlvAddId', new ValidateObjectIdPipe()) dlvAddId: Types.ObjectId) {
        await this.deliveryAddressService.setDefault(dlvAddId);
        return { message: "Set Default Delivery Address Succeed" }
    }

    @Put()
    async update(@Body() updateDlvAddDto: UpdateDlvAddDto) {
        await this.deliveryAddressService.update(updateDlvAddDto);
        return { message: "Update Delivery Address Succeed" }
    }

    // GET ========================================
    @Get(":dlvAddId")
    async getById(@Param('dlvAddId', new ValidateObjectIdPipe()) dlvAddId: Types.ObjectId) {
        const result = await this.deliveryAddressService.getById(dlvAddId);
        return { message: "Get Delivery Address Succeed", result }
    }

    @Get("user/:userId/default")
    async getDefaultByUserId(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.deliveryAddressService.getDefaultlByUserId(userId);
        return { message: "Get Default Delivery Address Of User Succeed", result }
    }

    @Get("user/:userId")
    async getByUserId(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.deliveryAddressService.getByUserId(userId);
        return { message: "Get Delivery Address Of User Succeed", result, total: result.length }
    }

    // DELETE ========================================
    @Delete(":dlvAddId")
    async deleteById(@Param('dlvAddId', new ValidateObjectIdPipe()) dlvAddId: Types.ObjectId) {
        await this.deliveryAddressService.deleteByID(dlvAddId);
        return { message: "Delete Delivery Address Succeed" }
    }

    @Delete("user/:userId")
    async deleteByUserId(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.deliveryAddressService.deleteByUserID(userId);
        return { message: "Delete Delivery Address Of User Succeed" }
    }

    @Delete()
    async deleteAll() {
        await this.deliveryAddressService.deleteAll();
        return { message: "Delete All Delivery Address Succeed" }
    }
}
