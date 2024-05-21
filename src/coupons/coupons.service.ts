import { Model, Types } from 'mongoose';
import { PaginationRes, PaginationResUser } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from 'src/schemas/Coupon.schema';
import { UserCoupon } from 'src/schemas/UserCoupon.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateCouponDto, HandleResponseGetAllDto, HandleResponseGetListByUserDto, PaginationDto,
    PaginationUserDto, PaginationUserValidDto, UpdateCouponDto
} from './dto';

@Injectable()
export class CouponsService {

    constructor(
        // private readonly cartsService: CartsService,
        @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
        @InjectModel(UserCoupon.name) private readonly userCouponModel: Model<UserCoupon>,
    ) { }

    // =============================================== CREATE ===============================================
    async create(createCouponDto: CreateCouponDto) {
        const newCoupon = new this.couponModel(createCouponDto);
        await newCoupon.save();
    }

    // async createUserCoupon(createUserCouponDto: CreateUserCouponReviewDto) {
    //     const detailCounpon = await this.getById(createUserCouponDto.coupon);
    //     const startDate = createUserCouponDto.startDate;
    //     const endDate = new Date(startDate);
    //     endDate.setDate(startDate.getDate() + detailCounpon.validityDuration);
    //     const newUserCoupon = new this.userCouponModel({ ...createUserCouponDto, endDate });
    //     await newUserCoupon.save();
    // }

    async createUserCouponReview(userId: Types.ObjectId) {
        const detailCounpon = await this.getCouponReview();
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + detailCounpon.validityDuration);
        const newUserCoupon = new this.userCouponModel({ user: userId, coupon: detailCounpon._id, startDate, endDate });
        await newUserCoupon.save();
    }

    async createUserCouponReviewPrime(userId: Types.ObjectId) {
        const detailCounpon = await this.getCouponReviewPrime();
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + detailCounpon.validityDuration);
        const newUserCoupon = new this.userCouponModel({ user: userId, coupon: detailCounpon._id, startDate, endDate });
        await newUserCoupon.save();
    }

    // ================================================ READ ================================================
    async getById(couponId: Types.ObjectId) {
        const result = await this.couponModel.findById(couponId).select("-__v -createdAt -updatedAt -status").lean();
        if (!result) throw new NotFoundException("Coupon not found.");
        return result;
    }

    async getAll(paginationDto: PaginationDto): Promise<PaginationRes> {
        const pageSize = paginationDto.pageSize || 1;
        const pageNumber = paginationDto.pageNumber || 1;
        const found = await this.couponModel.find({}).select("-__v -createdAt -updatedAt");
        return await this.handleResponseGetAll({ listCoupons: found, pageSize, pageNumber });
    }

    async getListOfValidCouponsForUser(paginationUserValidDto: PaginationUserValidDto) {
        const today = new Date();
        const userId = paginationUserValidDto.user;
        const amount = paginationUserValidDto.amount;
        const pageSize = paginationUserValidDto.pageSize || 1;
        const pageNumber = paginationUserValidDto.pageNumber || 1;
        const foundListCoupons = await this.userCouponModel.find({ user: userId, endDate: { $gt: today } });
        const result = [];
        for (const item of foundListCoupons) {
            const found = await this.getById(item.coupon);
            if (found.minAmount > amount) continue;
            result.push({ ...found, _id: item._id, startDate: item.startDate, endDate: item.endDate })
        }

        const recommendCoupons = await this.getRecommendCoupon(paginationUserValidDto);

        const pages: number = Math.ceil(result.length / pageSize);
        const semiFinal = result.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const finalResult = { pages: pages, data: { validCoupons: semiFinal, recommendCoupons } };
        return finalResult;
    }

    async getRecommendCoupon(paginationUserValidDto: PaginationUserValidDto) {
        const today = new Date();
        const userId = paginationUserValidDto.user;
        const amount = paginationUserValidDto.amount;

        const foundListCoupons = await this.userCouponModel.find({ user: userId, endDate: { $gt: today } });
        const result = [];
        for (const item of foundListCoupons) {
            const found = await this.getById(item.coupon);
            const priceDifference = found.minAmount - amount;
            if (priceDifference > 100 || priceDifference <= 0 || isNaN(priceDifference)) continue;
            result.push({
                ...found, _id: item._id,
                startDate: item.startDate,
                endDate: item.endDate,
                recommend: `You just need to increase the order value by ${priceDifference}$ to be able to use this coupon.`
            })
        }
        return result;
    }

    async getListCouponsOfUser(paginationUserDto: PaginationUserDto) {
        const userId = paginationUserDto.user;
        const pageSize = paginationUserDto.pageSize || 1;
        const pageNumber = paginationUserDto.pageNumber || 1;

        const found = await this.userCouponModel.find({ user: userId });
        return await this.handleResponseGetListByUser({ listCoupons: found, pageSize, pageNumber });
    }

    async getCouponReview() {
        const result = await this.couponModel.findOne({ code: "COUPONREVIEW1" });
        if (!result) throw new NotFoundException("Coupon not found.");
        return result;
    }

    async getCouponReviewPrime() {
        const result = await this.couponModel.findOne({ code: "COUPONREVIEW2" });
        if (!result) throw new NotFoundException("Coupon not found.");
        return result;
    }

    // =============================================== UPDATE ===============================================
    async update(updateCouponDto: UpdateCouponDto): Promise<void> {
        const { coupon, ...others } = updateCouponDto;
        const updated = await this.couponModel.findByIdAndUpdate(coupon, { $set: others });
        if (!updated) throw new NotFoundException("Coupon not found.");
    }

    // =============================================== DELETE ===============================================
    async deleteByUserACoupon(userCouponId: Types.ObjectId): Promise<void> {
        await this.userCouponModel.findByIdAndDelete(userCouponId);
    }

    // =============================================== SPECIAL ==============================================
    async handleResponseGetAll(handleResponseGetAllDto: HandleResponseGetAllDto): Promise<PaginationRes> {
        const { listCoupons, pageSize, pageNumber } = handleResponseGetAllDto;

        const pages: number = Math.ceil(listCoupons.length / pageSize);
        const final = listCoupons.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const result: PaginationRes = { pages: pages, data: final }

        return result;
    } // ADMIN ==============================================================================================

    async handleResponseGetListByUser(handleResponseGetListByUserDto: HandleResponseGetListByUserDto): Promise<PaginationResUser> {
        const { listCoupons, pageSize, pageNumber } = handleResponseGetListByUserDto;

        const pages: number = Math.ceil(listCoupons.length / pageSize);
        const semiFinal = listCoupons.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const final = [];
        for (const item of semiFinal) {
            const found = await this.getById(item.coupon);
            final.push({ ...found, _id: item._id, startDate: item.startDate, endDate: item.endDate });
        }
        const result: PaginationResUser = { pages: pages, data: final }

        return result;
    } // USER ==============================================================================================
}
