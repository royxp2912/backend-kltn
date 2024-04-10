import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, CreateUserCouponReviewDto, PaginationDto, PaginationUserDto, PaginationUserValidDto, UpdateCouponDto } from './dto';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    // =============================================== CREATE ===============================================
    @Post()
    async create(@Body() createCouponDto: CreateCouponDto) {
        await this.couponsService.create(createCouponDto);
        return { message: "Create Coupon succeed." }
    }

    // ================================================ READ ================================================
    @Get(":couponId")
    async getById(@Param('couponId', new ValidateObjectIdPipe()) couponId: Types.ObjectId) {
        const result = await this.couponsService.getById(couponId);
        return { message: "Get Coupon succeed.", result }
    }

    @Get()
    async getAll(@Query() paginationDto: PaginationDto) {
        const result = await this.couponsService.getAll(paginationDto);
        return { message: "Get All Coupon succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-user/valid")
    async getListOfValidCouponForUser(@Query() paginationUserValidDto: PaginationUserValidDto) {
        const result = await this.couponsService.getListOfValidCouponsForUser(paginationUserValidDto);
        console.log("paginationUserValidDto: ", paginationUserValidDto.amount);

        return { message: "Get List Coupon Of User succeed.", result: result.data, pages: result.pages }
    }

    @Get("find/by-user")
    async getListCouponOfUser(@Query() paginationUserDto: PaginationUserDto) {
        const result = await this.couponsService.getListCouponsOfUser(paginationUserDto);
        return { message: "Get List Coupon Of User succeed.", result: result.data, pages: result.pages }
    }

    // =============================================== UPDATE ===============================================
    @Put()
    async update(@Body() updateCouponDto: UpdateCouponDto) {
        await this.couponsService.update(updateCouponDto);
        return { message: "Update Coupon succeed." }
    }

    // =============================================== DELETE ===============================================

    // =============================================== SPECIAL ==============================================
    @Post("list")
    async createUserCoupon(@Body("userId") userId: Types.ObjectId) {
        await this.couponsService.createUserCouponReviewPrime(userId);
        return { message: "Create User Coupon succeed." }
    }
}
