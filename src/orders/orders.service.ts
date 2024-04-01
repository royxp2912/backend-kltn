import { Model, Types } from 'mongoose';
import { PaginationRes } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Order } from 'src/schemas/Order.schema';
import { CartsService } from 'src/carts/carts.service';
import { ORDER_STATUS } from 'src/constants/schema.enum';
import { ProductsService } from 'src/products/products.service';
import { VariantsService } from 'src/variants/variants.service';
import { OrderAddressService } from 'src/orderaddress/orderaddress.service';
import { DeliveryAddressService } from 'src/deliveryaddress/deliveryAddress.service';
import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateOrderDto, PaginationDto, PaginationKeywordDto, PaginationStatusDto, PaginationUserAStatusDto, PaginationUserDto
} from './dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CouponsService } from 'src/coupons/coupons.service';

@Injectable()
export class OrdersService {
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
    ) { }

    // CREATE ===============================================
    async create(createOrderDto: CreateOrderDto) {
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

        const newOrder = new this.orderModel({ ...others, deliveryAddress: orderAddress });
        newOrder.save();

        await Promise.all(newOrder.items.map(item => {
            this.cartsService.removeFromCart({ user: newOrder.user, product: item.product });
            this.variantsService.reduceQuantity({ product: item.product, color: item.color, size: item.size, quantity: item.quantity });
            this.productsService.updateSold(item.product, item.quantity);
        }))
        if (coupon) await this.couponsService.deleteByUserACoupon(coupon);

        await this.notificationsService.sendPush({ user: newOrder.user, title: "New Order!!!", body: `You just placed a new order! Try accessing the application to see details.` });
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
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: PaginationRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getById(orderId: Types.ObjectId) {
        const result = await this.orderModel.findById(orderId)
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
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: PaginationRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getByUser(paginationUserDto: PaginationUserDto) {
        const user = paginationUserDto.user;
        const pageSize = paginationUserDto.pageSize || 1;
        const pageNumber = paginationUserDto.pageNumber || 1;

        const userFound = await this.userModel.findById(user);
        if (!userFound) throw new BadGatewayException("User does not exist.");

        const found = await this.orderModel.find({ user })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: PaginationRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getByStatus(paginationStatusDto: PaginationStatusDto) {
        const status = paginationStatusDto.status;
        const pageSize = paginationStatusDto.pageSize || 1;
        const pageNumber = paginationStatusDto.pageNumber || 1;
        const found = await this.orderModel.find({ status })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: PaginationRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getAll(paginationDto: PaginationDto) {
        const pageSize = paginationDto.pageSize || 1;
        const pageNumber = paginationDto.pageNumber || 1;
        const found = await this.orderModel.find()
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .populate({ path: 'deliveryAddress', select: '-createdAt -updatedAt -__v' })
            .select("-__v -createdAt -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: PaginationRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    // UPDATE ===============================================

    // ====================================================================================================
    // =============================================== USER ===============================================
    async receivedOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.DeliveredSuccessfully) throw new BadRequestException("Order is in an unfulfillable status.");
        found.status = ORDER_STATUS.Successful;
        await found.save();
    }

    async returnOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Successful) throw new BadRequestException("Order is in non-returnable status.");
        found.status = ORDER_STATUS.Return;
        await found.save();
    }
    // =============================================== USER ===============================================
    // ====================================================================================================
    async cancelOrder(orderId: Types.ObjectId): Promise<void> {
        const found = await this.getById(orderId);
        if (found.status !== ORDER_STATUS.Confirming) throw new BadRequestException("Order is in non-cancelable status.");
        found.status = ORDER_STATUS.Cancel;
        await found.save();
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
        if (found.status !== ORDER_STATUS.Delivering) throw new BadRequestException("Order is in a status where delivery cannot be confirmed.");
        found.status = ORDER_STATUS.DeliveredSuccessfully;
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
}
