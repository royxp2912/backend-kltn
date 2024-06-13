import { StartEndOfMonth } from './dateUtils';
import { RevenueService } from './revenue.service';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import {
    DetailMonthDto, DetailYearDto, DetailYearEachBrandDto, DetailYearEachCategoryDto, PaginationInventoryDto, RevenueMonthDto
} from './dto';
import { Types } from 'mongoose';

@Controller('revenue')
@UseInterceptors(TransformResponseInterceptor)
export class RevenueController {
    constructor(private readonly revenueService: RevenueService) { }

    // ========================================= READ =========================================
    @Get("inventory")
    async getListInventory(@Query() paginationInventoryDto: PaginationInventoryDto) {
        const result = await this.revenueService.detailInventory(paginationInventoryDto);
        return { message: "Get Hot Products succeed.", result: result.data, pages: result.pages, total: result.data.length }
    } // inventory

    @Get("products/hot")
    async hotProductsMonthAgo() {
        const result = await this.revenueService.hotProductMonthAgo();
        return { message: "Get Hot Products succeed.", result, total: result.length }
    }

    @Get("products/top")
    async topProductsThisMonth() {
        const result = await this.revenueService.topProductThisMonth();
        return { message: "Get Top Products This Month succeed.", result, total: result.length }
    }

    @Get("users/top")
    async topUsersThisMonth() {
        const result = await this.revenueService.topUserThisMonth();
        return { message: "Get Top Users This Month succeed.", result, total: result.length }
    }

    @Get("products/detail/by-month")
    async detailTotalProductSoldOfMonth(@Query() detailMonthDto: DetailMonthDto) {
        const result = await this.revenueService.detailTotalProductSoldOfMonth(detailMonthDto);
        return { message: "Get Detail Total Product Sold Of Month succeed.", result }
    }

    @Get("orders/detail/by-month")
    async detailTotalOrderOfMonth(@Query() detailMonthDto: DetailMonthDto) {
        const result = await this.revenueService.detailTotalOrderOfMonth(detailMonthDto);
        return { message: "Get Detail Total Order Of Month succeed.", result }
    }

    @Get("orders/detail/this-week")
    async detailTotalOrderThisWeek() {
        const result = await this.revenueService.detailTotalOrderThisWeek();
        return { message: "Get Detail Total Order This Week succeed.", result }
    }

    @Get("users/detail/by-month")
    async detailLogNewUserOfMonth(@Query() detailMonthDto: DetailMonthDto) {
        const result = await this.revenueService.detailNewUserOfMonth(detailMonthDto);
        return { message: "Get Detail New User Of Month succeed.", result }
    }

    @Get("detail/by-month")
    async detailRevenueOfMonth(@Query() detailMonthDto: DetailMonthDto) {
        const result = await this.revenueService.detailRevenueOfMonth(detailMonthDto);
        return { message: "Get Detail Revenue Of Month succeed.", result }
    }

    @Get("detail/this-week")
    async detailRevenueThisWeek() {
        const result = await this.revenueService.detailRevenueThisWeek();
        return { message: "Get Detail Revenue This Week succeed.", result }
    }

    @Get("products/this-month")
    async totalProductSoldThisMonth() {
        const result = await this.revenueService.totalProductSoldThisMonth();
        return { message: "Get Total Product Sold This Month succeed.", result }
    }

    @Get("products/this-week")
    async totalProductSoldThisWeek() {
        const result = await this.revenueService.totalProductSoldThisWeek();
        return { message: "Get Total Product Sold This Week succeed.", result }
    }

    @Get("products/today")
    async totalProductSoldToday() {
        const result = await this.revenueService.totalProductSoldToday();
        return { message: "Get Total Product Sold Today succeed.", result }
    }

    @Get("users/this-month")
    async newUserThisMonth() {
        const result = await this.revenueService.newUserThisMonth();
        return { message: "Get New User This Month succeed.", result }
    }

    @Get("users/this-week")
    async newUserThisWeek() {
        const result = await this.revenueService.newUserThisWeek();
        return { message: "Get New User This Week succeed.", result }
    }

    @Get("users/today")
    async newUserToday() {
        const result = await this.revenueService.newUserToday();
        return { message: "Get New User Today succeed.", result }
    }

    @Get("orders/this-month")
    async totalOrderThisMonth() {
        const result = await this.revenueService.totalOrderThisMonth();
        return { message: "Get Total Order This Month succeed.", result }
    }

    @Get("orders/this-week")
    async totalOrderThisWeek() {
        const result = await this.revenueService.totalOrderThisWeek();
        return { message: "Get Total Order This Week succeed.", result }
    }

    @Get("orders/today")
    async totalOrderToday() {
        const result = await this.revenueService.totalOrderToday();
        return { message: "Get Total Order Today succeed.", result }
    }

    @Get("this-month")
    async revenueThisMonth() {
        const result = await this.revenueService.revenueThisMonth();
        return { message: "Get Revenue This Month succeed.", result }
    }

    @Get("this-week")
    async revenueThisWeek() {
        const result = await this.revenueService.revenueThisWeek();
        return { message: "Get Revenue This Week succeed.", result }
    }

    @Get("today")
    async revenueToday() {
        const result = await this.revenueService.revenueToday();
        return { message: "Get Revenue Today succeed.", result }
    }

    // ======================================== BRAND - CATEGORY ========================================
    @Get("brand/this-month")
    async revenueEachBrandThisMonth(@Query() revenueMonthDto: RevenueMonthDto) {
        const result = await this.revenueService.statisticalRevenueEachBrandOfMonth(revenueMonthDto);
        return { message: "Get Revenue Each Brand This Month succeed.", result }
    }

    @Get("category/this-month")
    async revenueEachCategoryThisMonth(@Query() revenueMonthDto: RevenueMonthDto) {
        const result = await this.revenueService.statisticalRevenueEachCategoryOfMonth(revenueMonthDto);
        return { message: "Get Revenue Each Category This Month succeed.", result }
    }

    @Get("detail/category/by-year")
    async detailTotalProductOfCategoryOfYear(@Query() detailYearEachCategoryDto: DetailYearEachCategoryDto) {
        const result = await this.revenueService.detailTotalProductOfCategoryOfYear(detailYearEachCategoryDto);
        return { message: "Get Detail Revenue Of Category By Year succeed.", result }
    }

    @Get("detail/brand/by-year")
    async detailTotalProductOfBrandOfYear(@Query() detailYearEachBrandDto: DetailYearEachBrandDto) {
        const result = await this.revenueService.detailTotalProductOfBrandOfYear(detailYearEachBrandDto);
        return { message: "Get Detail Revenue Of Brand By Year succeed.", result }
    }

    // ======================================== REVENUE - YEAR ========================================
    @Get("detail/by-year")
    async detailRevenueOfYear(@Query() detailYearDto: DetailYearDto) {
        const result = await this.revenueService.detailRevenueOfYear(detailYearDto);
        return { message: "Get Detail Revenue Of Year succeed.", result }
    }

    // ======================================== TESST ========================================
    @Get("test")
    async test(@Query("product") product: Types.ObjectId) {
        const today = new Date();
        const time = StartEndOfMonth(today.getMonth() + 1, today.getFullYear());
        const firstOfMonth = time.start;
        const firstOfNextMonth = time.end;
        const result = await this.revenueService.getDetailNumberOfProductSoldOneMonthAgo();
        return { message: "abc", result }
    }
}
