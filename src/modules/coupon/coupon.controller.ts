import { Types } from 'mongoose';
import { CouponService } from './coupon.service';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import { Body, Controller, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import {
    AddCouponTopUserDto,
    CreateCouponDto, PaginationDto, PaginationKeywordDto, PaginationUserDto, PaginationUserStatusDto,
    PaginationUserValidDto, UpdateCouponDto
} from './dto';

@Controller('coupons')
@UseInterceptors(TransformResponseInterceptor)
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    // =============================================== CREATE ===============================================
    @Post()
    async create(@Body() createCouponDto: CreateCouponDto) {
        await this.couponService.create(createCouponDto);
        return { message: "Create Coupon succeed." }
    }

    @Post("add/top-user")
    async addToTopUser(@Body() addTopUserDto: AddCouponTopUserDto) {
        await this.couponService.addCouponToTopUser(addTopUserDto);
        return { message: "Add Coupon to top user succeed." }
    }

    // ================================================ READ ================================================
    @Get(":couponId")
    async getById(@Param('couponId', new ValidateObjectIdPipe()) couponId: Types.ObjectId) {
        const result = await this.couponService.getById(couponId);
        return { message: "Get Coupon succeed.", result }
    }

    @Get("find/by-keyword")
    async findByKeyword(@Query() paginationKeywordDto: PaginationKeywordDto) {
        const result = await this.couponService.findByKeyword(paginationKeywordDto);
        return { message: "Find Coupon By Keyword succeed.", result: result.data, pages: result.pages }
    }

    @Get()
    async getAll(@Query() paginationDto: PaginationDto) {
        const result = await this.couponService.getAll(paginationDto);
        return { message: "Get All Coupon succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-user/valid")
    async getListOfValidCouponForUser(@Query() paginationUserValidDto: PaginationUserValidDto) {
        const result = await this.couponService.getListOfValidCouponsForUser(paginationUserValidDto);

        return { message: "Get List Coupon Of User succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-user/by-status")
    async getByStatus(@Query() paginationUserStatusDto: PaginationUserStatusDto) {
        const result = await this.couponService.getByStatus(paginationUserStatusDto);

        return { message: "Get List Coupon Of User By Status succeed.", result: result.data, pages: result.pages, total: result.total }
    }

    @Get("find/by-user")
    async getListCouponOfUser(@Query() paginationUserDto: PaginationUserDto) {
        const result = await this.couponService.getListCouponsOfUser(paginationUserDto);
        return { message: "Get List Coupon Of User succeed.", result: result.data, pages: result.pages }
    }

    // =============================================== UPDATE ===============================================
    @Put()
    async update(@Body() updateCouponDto: UpdateCouponDto) {
        await this.couponService.update(updateCouponDto);
        return { message: "Update Coupon succeed." }
    }

    @Put("lock/:couponId")
    async lock(@Param("couponId") couponId: Types.ObjectId) {
        await this.couponService.lockCoupon(couponId);
        return { message: "Lock Coupon succeed." }
    }

    @Put("unLock/:couponId")
    async unLock(@Param("couponId") couponId: Types.ObjectId) {
        await this.couponService.unlockCoupon(couponId);
        return { message: "Unlock Coupon succeed." }
    }

    // =============================================== DELETE ===============================================

    // =============================================== SPECIAL ==============================================
    @Post("list")
    async createUserCoupon(@Body("userId") userId: Types.ObjectId) {
        await this.couponService.createUserCouponReview(userId);
        return { message: "Create User Coupon succeed." }
    }


    @Get("test/api-test")
    async test(@Query() paginationUserValidDto: PaginationUserValidDto) {
        const result = await this.couponService.getRecommendCoupon(paginationUserValidDto);
        return { message: "Create User Coupon succeed.", result }
    }
}
