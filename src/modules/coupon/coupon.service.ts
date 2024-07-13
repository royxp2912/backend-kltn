import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Coupon } from 'src/schemas/coupon.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaginationRes, PaginationResUser } from './types';
import { UserCoupon } from 'src/schemas/userCoupon.schema';
import { COUPON_STATUS, USER_COUPON_STATUS } from 'src/constants/schema.enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    AddCouponTopUserDto,
    CreateCouponDto, HandleResponseGetAllDto, HandleResponseGetListByUserDto, PaginationDto,
    PaginationUserDto, PaginationUserStatusDto, PaginationUserValidDto, UpdateCouponDto
} from './dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CouponService {

    constructor(
        // private readonly cartsService: CartsService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
        @InjectModel(UserCoupon.name) private readonly userCouponModel: Model<UserCoupon>,
    ) { }

    // =============================================== SPECIAL ===============================================
    async addCouponToTopUser(addCouponTopUserDto: AddCouponTopUserDto) {
        await this.addCouponToTop1(addCouponTopUserDto.first);
        await this.addCouponToTop2(addCouponTopUserDto.second);
        await this.addCouponToTop3(addCouponTopUserDto.third);
    }

    async addCouponToTop1(userId?: Types.ObjectId) {
        if (!(await this.checkUserExist(userId))) return;

        const detailCounponTop1 = await this.couponModel.findOne({ code: "TOP1USER" });
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + detailCounponTop1.validityDuration);
        const newUserCoupon = new this.userCouponModel({ user: userId, coupon: detailCounponTop1._id, startDate, endDate });
        await newUserCoupon.save();
    }

    async addCouponToTop2(userId?: Types.ObjectId) {
        if (!(await this.checkUserExist(userId))) return;
        const detailCounponTop1 = await this.couponModel.findOne({ code: "TOP2USER" });
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + detailCounponTop1.validityDuration);
        const newUserCoupon = new this.userCouponModel({ user: userId, coupon: detailCounponTop1._id, startDate, endDate });
        await newUserCoupon.save();
    }

    async addCouponToTop3(userId?: Types.ObjectId) {
        if (!(await this.checkUserExist(userId))) return;
        const detailCounponTop1 = await this.couponModel.findOne({ code: "TOP3USER" });
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + detailCounponTop1.validityDuration);
        const newUserCoupon = new this.userCouponModel({ user: userId, coupon: detailCounponTop1._id, startDate, endDate });
        await newUserCoupon.save();
    }

    async checkUserExist(userId?: Types.ObjectId) {
        if (!userId) return false;
        const found = await this.userModel.findById(userId);
        if (!found) throw new NotFoundException("User not found.");
        return true;
    }

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
    async getByStatus(paginationUserStatusDto: PaginationUserStatusDto) {
        const { user, status } = paginationUserStatusDto;
        const pageSize = paginationUserStatusDto.pageSize || 1;
        const pageNumber = paginationUserStatusDto.pageNumber || 1;
        let result: (Document<unknown, {}, UserCoupon> & UserCoupon & { _id: Types.ObjectId })[];
        if (status === USER_COUPON_STATUS.EXPIRED) {
            result = await this.userCouponModel.find({ user: user, isExpire: true });
        } else {
            result = await this.userCouponModel.find({ user: user, isExpire: false });
        }
        return await this.fillInfoListCoupon(result, pageSize, pageNumber);
    }

    async fillInfoListCoupon(listCoupons: (Document<unknown, {}, UserCoupon> & UserCoupon & { _id: Types.ObjectId })[], pageSize: number, pageNumber: number) {
        const pages: number = Math.ceil(listCoupons.length / pageSize);
        const semiFinal = listCoupons.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        const result = [];
        for (const item of listCoupons) {
            const found = await this.getById(item.coupon);
            result.push({ ...found, _id: item._id, startDate: item.startDate, endDate: item.endDate, isExpire: item.isExpire })
        }

        const finalResult = { pages: pages, data: result, total: listCoupons.length };

        return finalResult;
    }

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
        const result = await this.couponModel.findOne({ code: "REVIEW01" });
        if (!result) throw new NotFoundException("Coupon not found.");
        return result;
    }

    async getCouponReviewPrime() {
        const result = await this.couponModel.findOne({ code: "REVIEWVIP1" });
        if (!result) throw new NotFoundException("Coupon not found.");
        return result;
    }

    // =============================================== UPDATE ===============================================
    async update(updateCouponDto: UpdateCouponDto): Promise<void> {
        const { coupon, ...others } = updateCouponDto;
        const updated = await this.couponModel.findByIdAndUpdate(coupon, { $set: others });
        if (!updated) throw new NotFoundException("Coupon not found.");
    }

    async lockCoupon(couponId: Types.ObjectId): Promise<void> {
        const founded = await this.couponModel.findById(couponId);
        if (!founded) throw new NotFoundException("Coupon not found.");
        if (founded.status !== COUPON_STATUS.Active) throw new BadRequestException("Coupon locked.");
        founded.status = COUPON_STATUS.Locked;
        await founded.save();
    }

    async unlockCoupon(couponId: Types.ObjectId): Promise<void> {
        const founded = await this.couponModel.findById(couponId);
        if (!founded) throw new NotFoundException("Coupon not found.");
        if (founded.status !== COUPON_STATUS.Locked) throw new BadRequestException("Coupon is active.");
        founded.status = COUPON_STATUS.Active;
        await founded.save();
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
            final.push({ ...found, _id: item._id, startDate: item.startDate, endDate: item.endDate, isExpire: item.isExpire });
        }
        const result: PaginationResUser = { pages: pages, data: final }

        return result;
    } // USER ==============================================================================================

    // Check hẹn giờ - thêm trạng thái expire coupon of user
    @Cron(CronExpression.EVERY_12_HOURS)
    async checkExpireCoupon() {
        console.log("loading - expire check - coupon...");
        const listCouponsNotExpire = await this.userCouponModel.find({ isExpire: false });

        const currentTime = new Date();
        for (const coupon of listCouponsNotExpire) {
            const expireDay = new Date(coupon.endDate);
            if (currentTime.getTime() > expireDay.getTime()) {
                await this.userCouponModel.findByIdAndUpdate(coupon._id, { isExpire: true });
            }
        }
    }
}
