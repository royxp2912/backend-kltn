import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { CreateOrderDto, PaginationDto, PaginationKeywordDto, PaginationStatusDto, PaginationUserAStatusDto, PaginationUserDto } from './dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    // CREATE ===============================================
    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
        await this.ordersService.create(createOrderDto);
        return { message: "Create Order succeed." }
    }

    // READ =================================================
    @Get(":orderId")
    async getById(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        const result = await this.ordersService.getById(orderId);
        return { message: "Get Order succeed.", result }
    }

    @Get("find/by-user-status")
    async getByUserAndStatus(@Query() paginationUserAStatusDto: PaginationUserAStatusDto) {
        const result = await this.ordersService.getByUserAStatus(paginationUserAStatusDto);
        return { message: "Get Order succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-keyword")
    async findByKeyword(@Query() paginationKeywordDto: PaginationKeywordDto) {
        console.log(paginationKeywordDto.keyword);

        const result = await this.ordersService.findByKeyword(paginationKeywordDto);
        return { message: "Get Order succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-user")
    async getByUser(@Query() paginationUserDto: PaginationUserDto) {
        const result = await this.ordersService.getByUser(paginationUserDto);
        return { message: "Get Order succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-status")
    async getByStatus(@Query() paginationStatusDto: PaginationStatusDto) {
        const result = await this.ordersService.getByStatus(paginationStatusDto);
        return { message: "Get All Order By Status succeed.", result: result.data, pages: result.pages }
    }

    @Get()
    async getAll(@Query() paginationDto: PaginationDto) {
        const result = await this.ordersService.getAll(paginationDto);
        return { message: "Get All Order succeed.", result: result.data, pages: result.pages }
    }

    // UPDATE ===============================================

    // ====================================================================================================
    // =============================================== USER ===============================================
    @Patch("received/:orderId")
    async receivedOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.receivedOrder(orderId);
        return { message: "Received Order succeed." }
    }

    @Patch("return/:orderId")
    async returnOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.returnOrder(orderId);
        return { message: "Return Order succeed." }
    }
    // =============================================== USER ===============================================
    // ====================================================================================================

    @Patch("cancel/:orderId")
    async cancelOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.cancelOrder(orderId);
        return { message: "Cancel Order succeed." }
    }

    // ====================================================================================================
    // =============================================== ADMIN ==============================================
    @Patch("accepted/:orderId")
    async acceptedOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.acceptedOrder(orderId);
        return { message: "Accepted Order succeed." }
    }

    @Patch("delivering/:orderId")
    async deliveringOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.deliveringOrder(orderId);
        return { message: "Confirm Delivering Order succeed." }
    }

    @Patch("delivered/:orderId")
    async deliveredOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.confirmDeliveredOrder(orderId);
        return { message: "Confirm Delivered Order succeed." }
    }

    @Patch("confirmReturn/:orderId")
    async confirmReturnOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.ordersService.confirmReturnOrder(orderId);
        return { message: "Confirm Return Order succeed." }
    }
    // =============================================== ADMIN ==============================================
    // ====================================================================================================

    // DELETE ===============================================

    // =============================================== VNPAY ===============================================
    @Get("payment-url/:orderId")
    async generatePaymentUrl(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        const result = this.ordersService.generatePaymentUrl(orderId, 200);
        return { message: "Create payment-url succeed.", result }
    }

    @Get("vnpay/callback")
    async callbackVNPay(@Query() query) {
        const result = this.ordersService.validatePaymentCallback(query);
        console.log("result callback; ", result);

        return { message: "call back payment-url succeed.", result }
    }
}
