import { Model, Types } from 'mongoose';
import { PaginationRes } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from 'src/schemas/Comment.schema';
import { Order } from 'src/schemas/Order.schema';
import { Product } from 'src/schemas/Product.schema';
import { UsersService } from 'src/users/users.service';
// import { OrdersService } from 'src/orders/orders.service';
import { CouponsService } from 'src/coupons/coupons.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateCommentDto, PaginationProductDto, UpdateCommentDto } from './dto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ORDER_STATUS } from 'src/constants/schema.enum';

@Injectable()
export class CommentsService {
    constructor(
        private readonly usersService: UsersService,
        private readonly couponsService: CouponsService,
        private readonly notificationsService: NotificationsService,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
    ) { }

    // CREATE ===============================================
    async create(createCommentDto: CreateCommentDto): Promise<void> {
        const { commentator, product } = createCommentDto;
        await this.usersService.getById(commentator);
        const productExist = await this.checkProductExist(product);
        await this.checkCommentExist(commentator, product);
        const isPurchased = await this.checkedUserPurchasedProduct(commentator, product);
        if (!isPurchased) throw new BadRequestException("Need to purchase the product to be able to rate the product.");

        if (isPurchased.status !== ORDER_STATUS.DeliveredSuccessfully && isPurchased.status !== ORDER_STATUS.Successful) {
            throw new BadRequestException("The order has not been successfully delivered so cannot comment..");
        }

        const newCmt = new this.commentModel(createCommentDto);
        await newCmt.save();
        await this.updateAvgRatingProduct(product);
        if (!createCommentDto.images) {
            await this.couponsService.createUserCouponReview(commentator);
        } else {
            await this.couponsService.createUserCouponReviewPrime(commentator);
        }

        // await this.notificationsService.sendPush({ user: commentator, title: "New Coupon!!!", body: `You have just successfully commented on product '${productExist.name}' and received a coupon. Try accessing the application to see details.` });
    }

    // READ =================================================
    async getByProduct(paginationProductDto: PaginationProductDto) {
        const proId = paginationProductDto.product;
        const pageSize = paginationProductDto.pageSize || 1;
        const pageNumber = paginationProductDto.pageNumber || 1;
        await this.checkProductExist(proId);

        const found = await this.commentModel.find({ product: proId })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .populate({ path: 'commentator', select: 'fullName avatar' })
            .select("-__v -createdAt -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: PaginationRes = { pages: pages, data: found };
        return result;
    }

    async checkCommentExist(userId: Types.ObjectId, proId: Types.ObjectId): Promise<void> {
        const found = await this.commentModel.findOne({ commentator: userId, product: proId });
        if (found) throw new ConflictException("User have commented on this product.");
    }

    // UPDATE ===============================================
    async update(updateCommentDto: UpdateCommentDto): Promise<void> {
        const { comment, ...others } = updateCommentDto;
        const found = await this.commentModel.findByIdAndUpdate(comment, { $set: others });
        if (!found) throw new NotFoundException("Comment not found.");
        await this.updateAvgRatingProduct(found.product);
    }

    async increaseLike(cmtId: Types.ObjectId): Promise<void> {
        const found = await this.commentModel.findByIdAndUpdate(cmtId, { $inc: { like: 1 } });
        if (!found) throw new NotFoundException("Comment not found.");
    }

    async reduceLike(cmtId: Types.ObjectId): Promise<void> {
        const found = await this.commentModel.findById(cmtId);
        if (!found) throw new NotFoundException("Comment not found.");
        if (found.like > 0) {
            found.like -= 1;
            await found.save();
        }
    }

    async updateAvgRatingProduct(proId: Types.ObjectId): Promise<void> {
        const listRating = await this.specGetByProduct(proId);
        const sumRating = listRating.reduce((arc, cur) => arc + cur.rating, 0);
        const length = listRating.length || 1;
        const avgRating = (sumRating / length).toFixed(1);
        await this.productModel.findByIdAndUpdate(proId, { $set: { rating: avgRating } });
    }

    // DELETE ===============================================
    async deleteById(cmtId: Types.ObjectId): Promise<void> {
        const result = await this.commentModel.findByIdAndDelete(cmtId);
        if (!result) throw new NotFoundException("Comment not found.");
        await this.updateAvgRatingProduct(result.product);
    }

    async deleteByProduct(proId: Types.ObjectId): Promise<void> {
        await this.commentModel.deleteMany({ product: proId });
        await this.updateAvgRatingProduct(proId);
    }

    async deleteByUser(userId: Types.ObjectId): Promise<void> {
        await this.commentModel.deleteMany({ commentator: userId });
        const result = await this.commentModel.find({ commentator: userId });
        await Promise.all(result.map(item => this.updateAvgRatingProduct(item.product)));
    }

    async deleteAll(): Promise<void> {
        await this.commentModel.deleteMany();
        const result = await this.commentModel.find();
        await Promise.all(result.map(item => this.updateAvgRatingProduct(item.product)));
    }

    // =============================================== SPECIAL ===============================================
    async specGetByProduct(proId: Types.ObjectId) {
        return await this.commentModel.find({ product: proId });
    }

    async totalReviewOfProduct(proId: Types.ObjectId): Promise<number> {
        const result = await this.commentModel.find({ product: proId })
        return result.length;
    }

    async checkProductExist(proId: Types.ObjectId) {
        const result = await this.productModel.findById(proId);
        if (!result) throw new NotFoundException("Product not found.");
        return result;
    }

    async checkedUserPurchasedProduct(userId: Types.ObjectId, proId: Types.ObjectId) {
        const found = await this.orderModel.findOne({
            user: userId,
            "items.product": proId,
        });
        if (!found) return false;
        return found;
    }
}
