import { DetailMonthDto } from './dto';
import { RevenueService } from './revenue.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('revenue')
export class RevenueController {
    constructor(private readonly revenueService: RevenueService) { }

    // ========================================= READ =========================================
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

    // ======================================== TESST ========================================
    @Get("test")
    test() {
        const result = this.revenueService.test();
        return { result }
    }
}
