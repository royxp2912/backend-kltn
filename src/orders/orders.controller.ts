import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Types } from 'mongoose';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { CANCEL_ORDER_TYPE } from './constants';
import { CreateOrderDto, PaginationDto, PaginationKeywordDto, PaginationStatusDto, PaginationUserAStatusDto, PaginationUserDto, PaymentUrlDto } from './dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    // CREATE ===============================================
    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
        const result = await this.ordersService.create(createOrderDto);
        return { message: "Create Order succeed.", result }
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
        await this.ordersService.cancelOrder(orderId, CANCEL_ORDER_TYPE.DUE_TO_USER);
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
    @Delete("spec/deleteAll")
    async spec_deleteAll() {
        this.ordersService.deleteAll_Spec();
        return { message: "Deletet all order succeed." }
    }

    // =============================================== VNPAY ===============================================
    @Get("create/payment-url")
    async generatePaymentUrl(@Query() paymentUrlDto: PaymentUrlDto) {
        const result = this.ordersService.generatePaymentUrl(paymentUrlDto);
        return { message: "Create payment-url succeed.", result }
    }

    @Get("vnpay/callback")
    async callbackVNPay(@Query() query, @Res({ passthrough: true }) res) {
        const result = this.ordersService.validatePaymentCallback(query);
        console.log("result callback; ", result);
        if (!result.isSuccess) return res.redirect(`https://www.nimo.tv/mixi?error=${result.message}`);

        // Nếu thanh toán thành công - đổi trạng thái đơn hàng sang đã thanh toán
        await this.ordersService.confirmPaid(result.vnp_TxnRef);
        return res.redirect("https://www.facebook.com/");
    }
}
