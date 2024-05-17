import { VNPay } from 'vnpay';
import { v4 as uuidv4 } from 'uuid';
import { Model, Types } from 'mongoose';
import { PaginationRes } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Order } from 'src/schemas/Order.schema';
import { CartsService } from 'src/carts/carts.service';
import { Cron, CronExpression } from "@nestjs/schedule";
import { CouponsService } from 'src/coupons/coupons.service';
import { ProductsService } from 'src/products/products.service';
import { VariantsService } from 'src/variants/variants.service';
import { OrderAddressService } from 'src/orderaddress/orderaddress.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DeliveryAddressService } from 'src/deliveryaddress/deliveryAddress.service';
import { NOTI_TYPE, ORDER_PAYMENT_METHOD, ORDER_STATUS } from 'src/constants/schema.enum';
import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateOrderDto, HandleResponseGetListDto, PaginationDto, PaginationKeywordDto, PaginationStatusDto, PaginationUserAStatusDto, PaginationUserDto, PaymentUrlDto
} from './dto';
import { CANCEL_ORDER_TYPE } from './constants';

@Injectable()
export class OrdersService {
    private vnpay: VNPay;

    constructor(
        private readonly cartsService: CartsService,
        private readonly couponsService: CouponsService,
        private readonly variantsService: VariantsService,
        private readonly productsService: ProductsService,
        private readonly orderAddressService: OrderAddressService,
        private readonly notificationsService: NotificationsService,
        private readonly deliveryAddressService: DeliveryAddressService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    ) {
        this.vnpay = new VNPay({
            vnpayHost: 'https://sandbox.vnpayment.vn',
            tmnCode: process.env.VNP_TMNCODE,
            secureSecret: process.env.VNP_HASHSECRET,
        });
    }

    // CREATE ===============================================
    async create(createOrderDto: CreateOrderDto): Promise<string> {
        const { coupon, ...others } = createOrderDto;
        const isStock = await createOrderDto.items.reduce(async (acc, cur) => {
            const checked = await this.variantsService.checkedStockVariant(
                {
                    product: cur.product,
                    color: cur.color,
                    size: cur.size,
                    quantity: cur.quantity,
                }
            );
            return acc && checked;
        }, Promise.resolve(true));
        if (!isStock) throw new BadRequestException(`Product is out of stock.`);

        const orderAddress = await this.convertDeliveryToOrder(others.deliveryAddress);

        const newOrder = new this.orderModel({ ...others, deliveryAddress: orderAddress, orderId: uuidv4() });
        const savedOrder = await newOrder.save();

        await Promise.all(newOrder.items.map(item => {
            this.cartsService.removeFromCart({ user: newOrder.user, product: item.product });
            this.variantsService.reduceQuantity({ product: item.product, color: item.color, size: item.size, quantity: item.quantity });
            this.productsService.updateSold(item.product, item.quantity);
        }))
        if (coupon) await this.couponsService.deleteByUserACoupon(coupon);

        // await this.notificationsService.createNotification({ user: others.user, type: NOTI_TYPE.ORDER_SUCCEED, relation: savedOrder.orderId });

        if (savedOrder.paymentMethod === ORDER_PAYMENT_METHOD.VNPAY) return this.generatePaymentUrl({ orderId: savedOrder.orderId, total: savedOrder.total });

        return ORDER_PAYMENT_METHOD.COD;
    }

    // READ =================================================
    async findByKeyword(paginationKeywordDto: PaginationKeywordDto) {
        const keyword = paginationKeywordDto.keyword;
        const pageSize = paginationKeywordDto.pageSize || 1;
        const pageNumber = paginationKeywordDto.pageNumber || 1;

        const found = await this.orderModel.find({
            $or: [
                { 'items.name': { $regex: keyword, $options: 'i' } },
                { status: { $regex: keyword, $options: 'i' } },
                { paymentMethod: { $regex: keyword, $options: 'i' } },
            ],
        })
            .sort({ createdAt: -1 })
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        return this.handleResponseGetList({ listOrders: found, pageSize, pageNumber });
    }

    async getById(orderId: Types.ObjectId) {
        const result = await this.orderModel.findById(orderId)
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        if (!result) throw new NotFoundException("Order not found.");
        return result;
    }

    async getByOrderId(orderId: string) {
        const result = await this.orderModel.findOne({ orderId: orderId })
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        if (!result) throw new NotFoundException("Order not found.");
        return result;
    }

    async getByUserAStatus(paginationUserAStatusDto: PaginationUserAStatusDto) {
        const user = paginationUserAStatusDto.user;
        const status = paginationUserAStatusDto.status;
        const pageSize = paginationUserAStatusDto.pageSize || 1;
        const pageNumber = paginationUserAStatusDto.pageNumber || 1;

        const userFound = await this.userModel.findById(user);
        if (!userFound) throw new BadGatewayException("User does not exist.");

        const found = await this.orderModel.find({ user, status })
            .sort({ createdAt: -1 })
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        return this.handleResponseGetList({ listOrders: found, pageSize, pageNumber });
    }

    async getByUser(paginationUserDto: PaginationUserDto) {
        const user = paginationUserDto.user;
        const pageSize = paginationUserDto.pageSize || 1;
        const pageNumber = paginationUserDto.pageNumber || 1;

        const userFound = await this.userModel.findById(user);
        if (!userFound) throw new BadGatewayException("User does not exist.");

        const found = await this.orderModel.find({ user })
            .sort({ createdAt: -1 })
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        return this.handleResponseGetList({ listOrders: found, pageSize, pageNumber });
    }

    async getByStatus(paginationStatusDto: PaginationStatusDto) {
        const status = paginationStatusDto.status;
        const pageSize = paginationStatusDto.pageSize || 1;
        const pageNumber = paginationStatusDto.pageNumber || 1;
        const found = await this.orderModel.find({ status })
            .sort({ createdAt: -1 })
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        return this.handleResponseGetList({ listOrders: found, pageSize, pageNumber });
    }

    async getAll(paginationDto: PaginationDto) {
        const pageSize = paginationDto.pageSize || 1;
        const pageNumber = paginationDto.pageNumber || 1;
        const found = await this.orderModel.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        return this.handleResponseGetList({ listOrders: found, pageSize, pageNumber });
    }

    // UPDATE ===============================================

    // ====================================================================================================
    // =============================================== USER ===============================================
    async receivedOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.DeliveredSuccessfully && found.status !== ORDER_STATUS.Delivering) {
            throw new BadRequestException("Order is in an unfulfillable status.");
        }
        found.status = ORDER_STATUS.Successful;
        await found.save();
    }

    async returnOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Successful && found.status !== ORDER_STATUS.DeliveredSuccessfully) {
            throw new BadRequestException("Order is in non-returnable status.");
        }
        found.status = ORDER_STATUS.Return;
        await found.save();
    }
    // =============================================== USER ===============================================
    // ====================================================================================================
    async cancelOrder(orderId: Types.ObjectId, type: CANCEL_ORDER_TYPE): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Confirming) throw new BadRequestException("Order is in non-cancelable status.");
        found.status = ORDER_STATUS.Cancel;
        await found.save();

        switch (type) {
            case CANCEL_ORDER_TYPE.DUE_TO_USER:
                await this.notificationsService.createNotification({ user: found.user, type: NOTI_TYPE.ORDER_CANCELLED_BY_USER, relation: found.orderId });
                break;

            case CANCEL_ORDER_TYPE.DUE_TO_ADMIN:
                await this.notificationsService.createNotification({ user: found.user, type: NOTI_TYPE.ORDER_CANCELLED_BY_ADMIN, relation: found.orderId });
                break;

            case CANCEL_ORDER_TYPE.DUE_TO_EXPIRATION:
                await this.notificationsService.createNotification({ user: found.user, type: NOTI_TYPE.ORDER_CANCELLED_DUE_TO_EXPIRATION, relation: found.orderId });
                break;

            default: console.log("default - cancel order");

        }
    }
    // ====================================================================================================
    // =============================================== ADMIN ==============================================
    async acceptedOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Confirming) throw new BadRequestException("Order is in an unacceptable status.");
        found.status = ORDER_STATUS.Accepted;
        await found.save();
    }

    async deliveringOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Accepted) throw new BadRequestException("Order is in non-shipping status.");
        found.status = ORDER_STATUS.Delivering;
        await found.save();
    }

    async confirmDeliveredOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Delivering && found.status !== ORDER_STATUS.Successful)
            throw new BadRequestException("Order is in a status where delivery cannot be confirmed.");
        if (found.status === ORDER_STATUS.Delivering) found.status = ORDER_STATUS.DeliveredSuccessfully;
        found.isDelivered = true;
        found.isPaid = true;
        await found.save();
    }

    async confirmReturnOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Return) throw new BadRequestException("Order is in a status where the return cannot be confirmed.");
        found.status = ORDER_STATUS.ReturnSuccessfully;
        await found.save();
    }
    // =============================================== ADMIN ==============================================
    // ====================================================================================================

    // DELETE ===============================================
    async deleteAll_Spec() {
        await this.orderAddressService.deletetAll();
        return await this.orderModel.deleteMany();
    }

    // =============================================== VNPAY ===============================================
    generatePaymentUrl(paymentUrlDto: PaymentUrlDto): string {
        const params = {
            vnp_TxnRef: paymentUrlDto.orderId,
            vnp_IpAddr: "1.1.1.1",
            vnp_Amount: paymentUrlDto.total * 24 * 1000,
            vnp_OrderInfo: 'Payment for order ' + paymentUrlDto.orderId,
            vnp_OrderType: 'billpayment',
            vnp_ReturnUrl: process.env.VNP_RETURNURL,
        };

        return this.vnpay.buildPaymentUrl(params);
    }

    validatePaymentCallback(query: any) {
        return this.vnpay.verifyIpnCall({ ...query });
    }

    async confirmPaid(orderId: string) {
        const result = await this.orderModel.findOneAndUpdate(
            { orderId: orderId },
            { $set: { isPaid: true } }
        );

        if (!result) throw new NotFoundException("Order not found.");
    }
    // =============================================== VNPAY ===============================================


    // =============================================== SPECIAL ===============================================
    async convertDeliveryToOrder(dlvAddId: Types.ObjectId): Promise<Types.ObjectId> {
        const deliveryAddress = await this.deliveryAddressService.getById(dlvAddId);
        const orderAddress = await this.orderAddressService.create({
            receiver: deliveryAddress.receiver,
            phone: deliveryAddress.phone,
            province: deliveryAddress.province,
            districts: deliveryAddress.districts,
            wards: deliveryAddress.wards,
            specific: deliveryAddress.specific,
        });

        return orderAddress._id;
    }

    async checkedUserPurchasedProduct(userId: Types.ObjectId, proId: Types.ObjectId): Promise<boolean> {
        const found = await this.orderModel.find({
            user: userId,
            "items.product": proId,
        });
        if (!found) return false;
        return true;
    }

    async handleResponseGetList(handleResponseGetListDto: HandleResponseGetListDto): Promise<PaginationRes> {
        const { listOrders, pageSize, pageNumber } = handleResponseGetListDto;

        const pages: number = Math.ceil(listOrders.length / pageSize);
        const final = listOrders.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const result: PaginationRes = { total: listOrders.length, pages: pages, data: final }

        return result;
    }

    @Cron(CronExpression.EVERY_HOUR)
    // @Cron(CronExpression.EVERY_10_SECONDS) // test
    async cancelOrderExpirePayment() {
        const listOrderPayment = await this.orderModel.find({
            paymentMethod: ORDER_PAYMENT_METHOD.VNPAY,
            status: ORDER_STATUS.Confirming,
            isPaid: false,
        }).select("createdAt");
        console.log("loading...");

        const currentTime = new Date();
        const maxAgePayment = 5 * 60 * 60 * 1000; // 5 hour
        // const maxAgePayment = 1000; // test
        for (const order of listOrderPayment) {
            const createdAt = new Date(order.createdAt);
            if (currentTime.getTime() - createdAt.getTime() > maxAgePayment) {
                await this.cancelOrder(order._id, CANCEL_ORDER_TYPE.DUE_TO_EXPIRATION);
            }
        }
    }
}
