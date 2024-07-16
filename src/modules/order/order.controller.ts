import { Types } from 'mongoose';
import { OrderService } from './order.service';
import { CANCEL_ORDER_TYPE } from './constants';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import {
    CreateOrderDto, PaginationDto, PaginationKeywordDto, PaginationStatusDto, PaginationUserAStatusDto, PaginationUserDto, PaymentUrlDto
} from './dto';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res, Redirect, UseGuards, UseInterceptors } from '@nestjs/common';

@Controller('orders')
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
    ) { }

    // CREATE ===============================================
    @Post()
    @UseInterceptors(TransformResponseInterceptor)
    async create(@Body() createOrderDto: CreateOrderDto) {
        console.log("createOrderDto: ", createOrderDto);

        const result = await this.orderService.create(createOrderDto);
        return { message: "Create Order succeed.", result }
    }

    // READ =================================================
    @Get(":orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async getById(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        const result = await this.orderService.getById(orderId);
        return { message: "Get Order succeed.", result }
    }

    @Get("/by-id/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async getByOrderId(@Param('orderId') orderId: string) {
        const result = await this.orderService.getByOrderId(orderId);
        return { message: "Get Order succeed.", result }
    }

    @Get("find/by-user-status")
    @UseInterceptors(TransformResponseInterceptor)
    async getByUserAndStatus(@Query() paginationUserAStatusDto: PaginationUserAStatusDto) {
        const result = await this.orderService.getByUserAStatus(paginationUserAStatusDto);
        return { message: "Get Order Of User by Status succeed.", result: result.data, pages: result.pages, total: result.total }
    }

    @Get("find/by-keyword")
    @UseInterceptors(TransformResponseInterceptor)
    async findByKeyword(@Query() paginationKeywordDto: PaginationKeywordDto) {
        const result = await this.orderService.findByKeyword(paginationKeywordDto);
        return { message: "Get Order succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-user")
    @UseInterceptors(TransformResponseInterceptor)
    async getByUser(@Query() paginationUserDto: PaginationUserDto) {
        const result = await this.orderService.getByUser(paginationUserDto);
        return { message: "Get Order succeed.", result: result.data, pages: result.pages, total: result.total }
    }

    @Get("find/by-status")
    @UseInterceptors(TransformResponseInterceptor)
    async getByStatus(@Query() paginationStatusDto: PaginationStatusDto) {
        const result = await this.orderService.getByStatus(paginationStatusDto);
        return { message: "Get All Order By Status succeed.", result: result.data, pages: result.pages, total: result.total }
    }

    @Get()
    @UseInterceptors(TransformResponseInterceptor)
    async getAll(@Query() paginationDto: PaginationDto) {
        const result = await this.orderService.getAll(paginationDto);
        return { message: "Get All Order succeed.", result: result.data, pages: result.pages, total: result.total }
    }

    // UPDATE ===============================================

    // ====================================================================================================
    // =============================================== USER ===============================================
    @Patch("received/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async receivedOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.receivedOrder(orderId);
        return { message: "Received Order succeed." }
    }

    @Patch("return/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async returnOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.returnOrder(orderId);
        return { message: "Return Order succeed." }
    }
    // =============================================== USER ===============================================
    // ====================================================================================================

    @Patch("cancel/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async cancelOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.cancelOrder(orderId, CANCEL_ORDER_TYPE.DUE_TO_USER);
        return { message: "Cancel Order succeed." }
    }

    // ====================================================================================================
    // =============================================== ADMIN ==============================================
    @Patch("accepted/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async acceptedOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.acceptedOrder(orderId);
        return { message: "Accepted Order succeed." }
    }

    @Patch("delivering/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async deliveringOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.deliveringOrder(orderId);
        return { message: "Confirm Delivering Order succeed." }
    }

    @Patch("delivered/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async deliveredOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.confirmDeliveredOrder(orderId);
        return { message: "Confirm Delivered Order succeed." }
    }

    @Patch("confirmReturn/:orderId")
    @UseInterceptors(TransformResponseInterceptor)
    async confirmReturnOrder(@Param('orderId', new ValidateObjectIdPipe()) orderId: Types.ObjectId) {
        await this.orderService.confirmReturnOrder(orderId);
        return { message: "Confirm Return Order succeed." }
    }
    // =============================================== ADMIN ==============================================
    // ====================================================================================================

    // DELETE ===============================================
    @Delete("spec/deleteAll")
    @UseInterceptors(TransformResponseInterceptor)
    async spec_deleteAll() {
        this.orderService.deleteAll_Spec();
        return { message: "Deletet all order succeed." }
    }

    // =============================================== VNPAY ===============================================
    @Get("create/payment-url")
    @UseInterceptors(TransformResponseInterceptor)
    async generatePaymentUrl(@Query() paymentUrlDto: PaymentUrlDto) {
        const result = await this.orderService.generatePaymentUrl(paymentUrlDto);
        return { message: "Create payment-url succeed.", result }
    }

    @Redirect()
    @Get("vnpay/callback")
    async callbackVNPay(@Query() query, @Res() res) {
        const result = this.orderService.validatePaymentCallback(query);
        console.log("result callback; ", result);
        if (!result.isSuccess) {
            const failUrl = `http://localhost:3000/orderFail/${result.vnp_TxnRef}?error=${result.message}`;
            return { statusCode: HttpStatus.FOUND, url: failUrl };
        }

        // Nếu thanh toán thành công - đổi trạng thái đơn hàng sang đã thanh toán
        await this.orderService.confirmPaid(result.vnp_TxnRef);
        const succeedUrl = `http://localhost:3000/orderSuccess/${result.vnp_TxnRef}`;
        return { statusCode: HttpStatus.FOUND, url: succeedUrl };
    }

    /// - tesst
    // @Get('redirect/callback')
    // @Redirect()
    // redirectToRoute() {
    //     const isTrue: boolean = true;
    //     if (isTrue) {
    //         console.log("dung");

    //         return { statusCode: HttpStatus.FOUND, url: "https://www.facebook.com/" };
    //     } else {
    //         console.log("sai");
    //         return { statusCode: HttpStatus.FOUND, url: "https://www.youtube.com/" };
    //     }
    // }


    @Get("test/api-test")
    @UseInterceptors(TransformResponseInterceptor)
    async tesst(@Query("product") product: Types.ObjectId) {
        const result = await this.orderService.getSoldOfProductInMonthAgo(product);

        return { message: "test succeed.", result }
    } convertUSDToVND

    // USD to VND
    @Get("convert/usd-vnd")
    @UseInterceptors(TransformResponseInterceptor)
    async converUSDToVND(@Query("amount") amount: number) {
        const result = await this.orderService.convertUSDToVND(amount);

        return { message: "convert succeed.", result }
    }

}
