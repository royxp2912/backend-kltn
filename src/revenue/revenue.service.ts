import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DAY_WEEK, TYPE_REVENUE } from 'src/constants/dto..enum';
import { Order } from 'src/schemas/Order.schema';
import { Product } from 'src/schemas/Product.schema';
import { User } from 'src/schemas/User.schema';
import { StartEndOfDay, StartEndOfMonth, StartEndOfWeek } from './dateUtils';
import { DetailMonthDto } from './dto';
import { TypeAndPercent } from './types';

@Injectable()
export class RevenueService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(User.name) private readonly productModel: Model<User>,
    ) { }

    // ========================================= API =========================================

    // ################################## Detail ##################################
    async detailTotalProductSoldOfMonth(detailMonthDto: DetailMonthDto) {
        const { month, year } = detailMonthDto;
        const result = StartEndOfMonth(month, year);
        const firstOfMonth = result.start;
        const firstOfNextMonth = result.end;
        const endOfMonth = new Date(firstOfNextMonth.getFullYear(), firstOfNextMonth.getMonth(), firstOfNextMonth.getDate() - 1);

        let details = [];
        let today = firstOfMonth.getDate();
        let lastDay = endOfMonth.getDate();
        while (today <= lastDay) {
            let totalProductSoldToday = await this.totalProductSoldOfDay(today, month - 1, year);
            details.push({ date: today, total: totalProductSoldToday });
            today += 1;
        }

        return details;
    }

    async detailTotalOrderOfMonth(detailMonthDto: DetailMonthDto) {
        const { month, year } = detailMonthDto;
        const result = StartEndOfMonth(month, year);
        const firstOfMonth = result.start;
        const firstOfNextMonth = result.end;
        const endOfMonth = new Date(firstOfNextMonth.getFullYear(), firstOfNextMonth.getMonth(), firstOfNextMonth.getDate() - 1);

        let details = [];
        let today = firstOfMonth.getDate();
        let lastDay = endOfMonth.getDate();
        while (today <= lastDay) {
            let totalOrderToday = await this.totalOrderOfDay(today, month - 1, year);
            details.push({ date: today, total: totalOrderToday });
            today += 1;
        }

        return details;
    }

    async detailTotalOrderThisWeek() {
        const today = new Date();
        const result = StartEndOfWeek(today.getDate(), today.getMonth(), today.getFullYear());
        const fristOfWeek = result.start;

        let i = 0;
        let details = [];
        while (i < 7) {
            let totalOrderToday = await this.totalOrderOfDay(fristOfWeek.getDate(), fristOfWeek.getMonth(), fristOfWeek.getFullYear());
            details.push({ day: DAY_WEEK[i], total: totalOrderToday });
            fristOfWeek.setDate(fristOfWeek.getDate() + 1);
            i += 1;
        }

        return details;
    }

    async detailNewUserOfMonth(detailMonthDto: DetailMonthDto) {
        const { month, year } = detailMonthDto;
        const result = StartEndOfMonth(month, year);
        const firstOfMonth = result.start;
        const firstOfNextMonth = result.end;
        const endOfMonth = new Date(firstOfNextMonth.getFullYear(), firstOfNextMonth.getMonth(), firstOfNextMonth.getDate() - 1);

        let detailLogNewUser = [];
        let today = firstOfMonth.getDate();
        let lastDay = endOfMonth.getDate();
        while (today <= lastDay) {
            let newUserToday = await this.newUserOfDay(today, month - 1, year);
            detailLogNewUser.push({ date: today, total: newUserToday });
            today += 1;
        }

        return detailLogNewUser;
    }

    async detailRevenueOfMonth(detailMonthDto: DetailMonthDto) {
        const { month, year } = detailMonthDto;
        const result = StartEndOfMonth(month, year);
        const firstOfMonth = result.start;
        const firstOfNextMonth = result.end;
        const endOfMonth = new Date(firstOfNextMonth.getFullYear(), firstOfNextMonth.getMonth(), firstOfNextMonth.getDate() - 1);

        let detailRevenue = [];
        let today = firstOfMonth.getDate();
        let lastDay = endOfMonth.getDate();
        while (today <= lastDay) {
            let revToday = await this.revenueOfDay(today, month - 1, year);
            detailRevenue.push({ date: today, total: revToday });
            today += 1;
        }

        return detailRevenue;
    }

    async detailRevenueThisWeek() {
        const today = new Date();
        const result = StartEndOfWeek(today.getDate(), today.getMonth(), today.getFullYear());
        const fristOfWeek = result.start;

        let i = 0;
        let detailRevenue = [];
        while (i < 7) {
            let revToday = await this.revenueOfDay(fristOfWeek.getDate(), fristOfWeek.getMonth(), fristOfWeek.getFullYear());
            detailRevenue.push({ day: DAY_WEEK[i], total: revToday });
            fristOfWeek.setDate(fristOfWeek.getDate() + 1);
            i += 1;
        }

        return detailRevenue;
    }

    // ################################## Info ##################################
    async totalProductSoldThisMonth() {
        const today = new Date();
        const totalProductSoldThisMonth = await this.totalProductSoldOfMonth(today.getMonth() + 1, today.getFullYear());
        const totalProductSoldLastMonth = await this.totalProductSoldOfMonth(today.getMonth(), today.getFullYear());

        const type = this.fillType(totalProductSoldThisMonth, totalProductSoldLastMonth);
        const percent = this.fillPercent(totalProductSoldThisMonth, totalProductSoldLastMonth);
        return { total: totalProductSoldThisMonth, percent, type };
    }

    async totalProductSoldThisWeek() {
        const today = new Date();
        const totalProductSoldThisWeek = await this.totalProductSoldOfWeek(today.getDate(), today.getMonth(), today.getFullYear());
        const totalProductSoldLastWeek = await this.totalProductSoldOfWeek(today.getDate() - 7, today.getMonth(), today.getFullYear());

        const type = this.fillType(totalProductSoldThisWeek, totalProductSoldLastWeek);
        const percent = this.fillPercent(totalProductSoldThisWeek, totalProductSoldLastWeek);
        return { total: totalProductSoldThisWeek, percent, type };
    }

    async totalProductSoldToday() {
        const today = new Date();
        const totalProductSoldToday = await this.totalProductSoldOfDay(today.getDate(), today.getMonth(), today.getFullYear());
        const totalProductSoldYesterday = await this.totalProductSoldOfDay(today.getDate() - 1, today.getMonth(), today.getFullYear());

        const type = this.fillType(totalProductSoldToday, totalProductSoldYesterday);
        const percent = this.fillPercent(totalProductSoldToday, totalProductSoldYesterday);
        return { total: totalProductSoldToday, percent, type };
    }

    async newUserThisMonth() {
        const today = new Date();
        const newUserThisMonth = await this.newUserOfMonth(today.getMonth() + 1, today.getFullYear());
        const newUserLastMonth = await this.newUserOfMonth(today.getMonth(), today.getFullYear());

        const type = this.fillType(newUserThisMonth, newUserLastMonth);
        const percent = this.fillPercent(newUserThisMonth, newUserLastMonth);
        return { total: newUserThisMonth, percent, type };
    }

    async newUserThisWeek() {
        const today = new Date();
        const newUserThisWeek = await this.newUserOfWeek(today.getDate(), today.getMonth(), today.getFullYear());
        const newUserLastWeek = await this.newUserOfWeek(today.getDate() - 7, today.getMonth(), today.getFullYear());

        const type = this.fillType(newUserThisWeek, newUserLastWeek);
        const percent = this.fillPercent(newUserThisWeek, newUserLastWeek);
        return { total: newUserThisWeek, percent, type };
    }

    async newUserToday() {
        const today = new Date();
        const newUserToday = await this.newUserOfDay(today.getDate(), today.getMonth(), today.getFullYear());
        const newUserYesterday = await this.newUserOfDay(today.getDate() - 1, today.getMonth(), today.getFullYear());

        const type = this.fillType(newUserToday, newUserYesterday);
        const percent = this.fillPercent(newUserToday, newUserYesterday);
        return { total: newUserToday, percent, type };
    }

    async totalOrderThisMonth() {
        const today = new Date();
        const totalOrderThisMonth = await this.totalOrderOfMonth(today.getMonth() + 1, today.getFullYear());
        const totalOrderLastMonth = await this.totalOrderOfMonth(today.getMonth(), today.getFullYear());

        const type = this.fillType(totalOrderThisMonth, totalOrderLastMonth);
        const percent = this.fillPercent(totalOrderThisMonth, totalOrderLastMonth);
        return { total: totalOrderThisMonth, percent, type };
    }

    async totalOrderThisWeek() {
        const today = new Date();
        const totalOrderThisWeek = await this.totalOrderOfWeek(today.getDate(), today.getMonth(), today.getFullYear());
        const totalOrderLastWeek = await this.totalOrderOfWeek(today.getDate() - 7, today.getMonth(), today.getFullYear());

        const type = this.fillType(totalOrderThisWeek, totalOrderLastWeek);
        const percent = this.fillPercent(totalOrderThisWeek, totalOrderLastWeek);
        return { total: totalOrderThisWeek, percent, type };
    }

    async totalOrderToday() {
        const today = new Date();
        const totalOrderToday = await this.totalOrderOfDay(today.getDate(), today.getMonth(), today.getFullYear());
        const totalOrderYesterday = await this.totalOrderOfDay(today.getDate() - 1, today.getMonth(), today.getFullYear());

        const type = this.fillType(totalOrderToday, totalOrderYesterday);
        const percent = this.fillPercent(totalOrderToday, totalOrderYesterday);
        return { total: totalOrderToday, percent, type };
    }

    async revenueThisMonth() {
        const today = new Date();
        const revThisMonth = await this.revenueOfMonth(today.getMonth() + 1, today.getFullYear());
        const revLastMonth = await this.revenueOfMonth(today.getMonth(), today.getFullYear());

        const type = this.fillType(revThisMonth, revLastMonth);
        const percent = this.fillPercent(revThisMonth, revLastMonth);
        return { total: revThisMonth, percent, type };
    }

    async revenueThisWeek() {
        const today = new Date();
        const revThisWeek = await this.revenueOfWeek(today.getDate(), today.getMonth(), today.getFullYear());
        const revLastWeek = await this.revenueOfWeek(today.getDate() - 7, today.getMonth(), today.getFullYear());

        const type = this.fillType(revThisWeek, revLastWeek);
        const percent = this.fillPercent(revThisWeek, revLastWeek);
        return { total: revThisWeek, percent, type };
    }

    async revenueToday() {
        const today = new Date();
        const revToday = await this.revenueOfDay(today.getDate(), today.getMonth(), today.getFullYear());
        const revYesterday = await this.revenueOfDay(today.getDate() - 1, today.getMonth(), today.getFullYear());

        const type = this.fillType(revToday, revYesterday);
        const percent = this.fillPercent(revToday, revYesterday);
        return { total: revToday, percent, type };
    }

    // ========================================= READ =========================================

    // ######################################### TOTAL- PRODUCT SOLD #########################################
    async totalProductSoldOfMonth(month: number, year: number) {
        const result = StartEndOfMonth(month, year);
        const firstDayOfMonth = result.start;
        const firstDayOfNextMonth = result.end;

        const listOrder = await this.orderModel.find({ createdAt: { $gte: firstDayOfMonth, $lte: firstDayOfNextMonth } })
            .select("items.quantity");

        const listQty = listOrder.flatMap(cur => cur.items.map(item => item.quantity));
        const total = listQty.reduce((arc, cur) => arc + cur, 0);

        return total;
    }

    async totalProductSoldOfWeek(day: number, month: number, year: number) {
        const result = StartEndOfWeek(day, month, year);
        const firstDayOfWeek = result.start;
        const firstDayOfNextWeek = result.end;

        const listOrder = await this.orderModel.find({ createdAt: { $gte: firstDayOfWeek, $lte: firstDayOfNextWeek } })
            .select("items.quantity");

        const listQty = listOrder.flatMap(cur => cur.items.map(item => item.quantity));
        const total = listQty.reduce((arc, cur) => arc + cur, 0);

        return total;
    }

    async totalProductSoldOfDay(day: number, month: number, year: number) {
        const result = StartEndOfDay(day, month, year);
        const today = result.start;
        const tomorrow = result.end;

        const listOrder = await this.orderModel.find({ createdAt: { $gte: today, $lte: tomorrow } })
            .select("items.quantity");

        const listQty = listOrder.flatMap(cur => cur.items.map(item => item.quantity));
        const total = listQty.reduce((arc, cur) => arc + cur, 0);

        return total;
    }
    // ######################################### TOTAL- PRODUCT SOLD #########################################

    // ######################################### USERS #########################################
    async newUserOfMonth(month: number, year: number) {
        const result = StartEndOfMonth(month, year);
        const firstDayOfMonth = result.start;
        const firstDayOfNextMonth = result.end;

        const listTotal = await this.userModel.find({ createdAt: { $gte: firstDayOfMonth, $lte: firstDayOfNextMonth } });

        return listTotal.length;
    }

    async newUserOfWeek(day: number, month: number, year: number) {
        const result = StartEndOfWeek(day, month, year);
        const firstDayOfWeek = result.start;
        const firstDayOfNextWeek = result.end;

        const listTotal = await this.userModel.find({ createdAt: { $gte: firstDayOfWeek, $lte: firstDayOfNextWeek } });

        return listTotal.length;
    }

    async newUserOfDay(day: number, month: number, year: number) {
        const result = StartEndOfDay(day, month, year);
        const today = result.start;
        const tomorrow = result.end;

        const listTotal = await this.userModel.find({ createdAt: { $gte: today, $lte: tomorrow } });

        return listTotal.length;
    }
    // ######################################### USERS #########################################

    // ######################################### TOTAL - ORDER #########################################
    async totalOrderOfMonth(month: number, year: number) {
        const result = StartEndOfMonth(month, year);
        const firstDayOfMonth = result.start;
        const firstDayOfNextMonth = result.end;

        const listTotal = await this.orderModel.find({ createdAt: { $gte: firstDayOfMonth, $lte: firstDayOfNextMonth } });

        return listTotal.length;
    }

    async totalOrderOfWeek(day: number, month: number, year: number) {
        const result = StartEndOfWeek(day, month, year);
        const firstDayOfWeek = result.start;
        const firstDayOfNextWeek = result.end;

        const listTotal = await this.orderModel.find({ createdAt: { $gte: firstDayOfWeek, $lte: firstDayOfNextWeek } });

        return listTotal.length;
    }

    async totalOrderOfDay(day: number, month: number, year: number) {
        const result = StartEndOfDay(day, month, year);
        const today = result.start;
        const tomorrow = result.end;

        const listTotal = await this.orderModel.find({ createdAt: { $gte: today, $lte: tomorrow } });

        return listTotal.length;
    }
    // ######################################### TOTAL - ORDER  #########################################

    // ######################################### REVENUE #########################################
    async revenueOfMonth(month: number, year: number) {
        const result = StartEndOfMonth(month, year);
        const firstDayOfMonth = result.start;
        const firstDayOfNextMonth = result.end;

        const listTotal = await this.orderModel.find({ createdAt: { $gte: firstDayOfMonth, $lte: firstDayOfNextMonth } })
        const revOfMonth = listTotal.reduce((arc, order) => arc + order.total, 0);

        return revOfMonth;
    }

    async revenueOfWeek(day: number, month: number, year: number) {
        const result = StartEndOfWeek(day, month, year);
        const firstDayOfWeek = result.start;
        const firstDayOfNextWeek = result.end;

        const listTotal = await this.orderModel.find({ createdAt: { $gte: firstDayOfWeek, $lte: firstDayOfNextWeek } })
        const revOfWeek = listTotal.reduce((arc, order) => arc + order.total, 0);

        return revOfWeek;
    }

    async revenueOfDay(day: number, month: number, year: number) {
        const result = StartEndOfDay(day, month, year);
        const today = result.start;
        const tomorrow = result.end;

        const listTotal = await this.orderModel.find({ createdAt: { $gte: today, $lte: tomorrow } })
        const revOfDay = listTotal.reduce((arc, order) => arc + order.total, 0);

        return revOfDay;
    }
    // ######################################### REVENUE #########################################

    // ========================================= SPECIAL =========================================
    fillPercent(now: number, last: number): number {
        if (now === 0 && last === 0) return 0;
        if (now !== 0 && last === 0) return 100;
        return Number((((now - last) / last) * 100).toFixed(2));
    }

    fillType(now: number, last: number): TYPE_REVENUE {
        if (now < last) return TYPE_REVENUE.REDUCE;
        if (now > last) return TYPE_REVENUE.INCREASE;
        return TYPE_REVENUE.NOCHANGE
    }

    // ======================================== test ========================================
    test() {
        const day = new Date().getDate();
        console.log(day);
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        const result = StartEndOfDay(day, month, year);
        const result2 = StartEndOfWeek(day, month, year);
        const result3 = StartEndOfMonth(month, year);
        console.log([result, result2, result3]);

        return month;
    }
}
