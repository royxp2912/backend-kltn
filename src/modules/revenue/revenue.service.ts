import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Order } from 'src/schemas/order.schema';
import mongoose, { Model, Types } from 'mongoose';
import { Variant } from 'src/schemas/vriant.schema';
import { Product } from 'src/schemas/product.schema';
import { PaginationInventory, TopProductInfo, TopUserInfo } from './types';
import { Category } from 'src/schemas/category.schema';
import { ProductService } from '../product/product.service';
import { DAY_WEEK, TYPE_REVENUE } from 'src/constants/dto..enum';
import { PRODUCT_BRAND, SYNTAX_MONTH } from 'src/constants/schema.enum';
import { StartEndOfDay, StartEndOfMonth, StartEndOfMonthAgo, StartEndOfWeek } from './dateUtils';
import { DetailMonthDto, DetailYearDto, DetailYearEachBrandDto, DetailYearEachCategoryDto, PaginationInventoryDto, RevenueMonthDto } from './dto';
import { DetailVariant } from 'src/schemas/detailVariant.schema';

@Injectable()
export class RevenueService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(Variant.name) private readonly variantModel: Model<Variant>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(DetailVariant.name) private readonly detailVariantModel: Model<DetailVariant>,
        private readonly productService: ProductService,
    ) { }


    // ============================================= ##################### =======================================
    // ================================================= INVENTORY ===============================================
    // ============================================= ##################### =======================================
    async detailInventory(paginationInventoryDto: PaginationInventoryDto) {
        const pageSize = paginationInventoryDto.pageSize || 6;
        const pageNumber = paginationInventoryDto.pageNumber || 1;

        const listProducts = await this.productModel.find({}).select("_id name");
        const detailNumberOfProductSoldOneMonthAgo = await this.getDetailNumberOfProductSoldOneMonthAgo();
        const result = [];
        for (const product of listProducts) {
            const totalInventoryOfProduct = await this.getTotalInventoryOfProduct(product._id);
            const numberOfSold = detailNumberOfProductSoldOneMonthAgo[product._id as any] || 0;
            result.push({ product: product._id, name: product.name, totalInventory: totalInventoryOfProduct, sold: numberOfSold });
        }

        result.sort((a, b) => b.totalInventory - a.totalInventory);
        const pages: number = Math.ceil(result.length / pageSize);
        const semiFinal = result.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const final: PaginationInventory = { pages, data: semiFinal };

        return final;
    }

    async getDetailNumberOfProductSoldOneMonthAgo() {
        const today = new Date();
        const time = StartEndOfMonthAgo(today.getDate(), today.getMonth(), today.getFullYear());
        const startDay = time.start;
        const endDay = time.end;

        const listProduct = await this.orderModel.find({
            createdAt: {
                $gte: startDay,
                $lte: endDay,
            },
        }).select('items.product items.quantity');

        const soldList = listProduct.flatMap((cur) => cur.items.map((item) => { return { product: item.product, sold: item.quantity } }));

        const productSoldMap = {}
        soldList.forEach(item => {
            if (productSoldMap[item.product as any]) {
                productSoldMap[item.product as any] += item.sold;
            } else {
                productSoldMap[item.product as any] = item.sold;
            }
        });
        return productSoldMap;
    }

    async getTotalInventoryOfProduct(proId: Types.ObjectId) {
        const listVars = await this.variantModel.find({ product: proId }).select("_id");
        let totalInventory = 0;
        for (const variant of listVars) {
            const listQuantity = await this.detailVariantModel.find({ variant: variant._id });
            const total = listQuantity.reduce((acc, cur) => acc + cur.quantity, 0);
            totalInventory += total;
        }

        return totalInventory;
    }

    // ========================================= API - REVENUE - YEAR =========================================
    async detailRevenueOfYear(detailYearDto: DetailYearDto) {
        const { year } = detailYearDto;

        let details = [];
        let first = 0;
        while (first < 12) {
            let revenueOfMonth = await this.revenueOfMonth(first + 1, year);
            details.push({ month: SYNTAX_MONTH[first], total: revenueOfMonth });

            first += 1;
        }

        return details;
    }

    // ========================================= API - REVENUE - YEAR - EACH BRAND - CATE =========================================
    async detailTotalProductOfBrandOfYear(detailYearEachBrandDto: DetailYearEachBrandDto) {
        const { brand, year } = detailYearEachBrandDto;

        let details = [];
        let first = 0;
        while (first < 12) {
            let revenueOfMonth = await this.totalProductOfBrandOfMonth(brand, first + 1, year);
            details.push({ month: SYNTAX_MONTH[first], total: revenueOfMonth });

            first += 1;
        }

        return details;
    }

    async detailTotalProductOfCategoryOfYear(detailYearEachCategoryDto: DetailYearEachCategoryDto) {
        const { category, year } = detailYearEachCategoryDto;
        const cateId = await this.categoryModel.findOne({ name: { $regex: category, $options: 'i' } });
        console.log("id: ", cateId._id);

        let details = [];
        let first = 0;
        while (first < 12) {
            let revenueOfMonth = await this.totalProductOfCategoryOfMonth(cateId._id, first + 1, year);
            details.push({ month: SYNTAX_MONTH[first], total: revenueOfMonth });

            first += 1;
        }

        return details;
    }

    async totalProductOfBrandOfMonth(brand: PRODUCT_BRAND, month: number, year: number) {
        const time = StartEndOfMonth(month, year);
        const endOfMonth = time.end;
        const startOfMonth = time.start;

        let quantitySold = 0;
        const listProducts = await this.listProductSoldOfTime(startOfMonth, endOfMonth);
        for (const product of listProducts) {
            const found = await this.productModel.findById(product.product).select("brand");
            if (found.brand === brand) quantitySold += product.sold;
        }

        return quantitySold;
    }

    async totalProductOfCategoryOfMonth(category: Types.ObjectId, month: number, year: number) {
        const time = StartEndOfMonth(month, year);
        const endOfMonth = time.end;
        const startOfMonth = time.start;

        let quantitySold = 0;
        const listProducts = await this.listProductSoldOfTime(startOfMonth, endOfMonth);
        for (const product of listProducts) {
            const found = await this.productModel.findById(product.product).select("category");
            if (found.category.equals(category)) quantitySold += product.sold;
        }

        return quantitySold;
    }

    // ========================================= API =========================================
    async hotProductMonthAgo() {
        const today = new Date();
        const time = StartEndOfMonthAgo(today.getDate(), today.getMonth(), today.getFullYear());
        const startDay = time.start;
        const endDay = time.end;

        const listSold = await this.listProductSoldOfTime(startDay, endDay);
        listSold.sort((a, b) => b.sold - a.sold);
        const handleList = await Promise.all(listSold.map(item => this.productService.fillInfoOneProduct(item.product, null)));
        if (handleList.length > 8) handleList.length = 8;
        return handleList;
    }

    async topProductThisMonth() {
        const today = new Date();
        const time = StartEndOfMonth(today.getMonth() + 1, today.getFullYear());
        const firstOfMonth = time.start;
        const firstOfNextMonth = time.end;

        const listSold = await this.listProductSoldOfTime(firstOfMonth, firstOfNextMonth);
        listSold.sort((a, b) => b.sold - a.sold);
        const handleList = await Promise.all(listSold.map(item => this.fillInfoTopProduct(item.product, item.sold)));

        if (listSold.length < 5) {
            for (let i = listSold.length; i < 5; i++) {
                const nullObject = { id: null, name: "", image: "", sold: 0 };
                handleList.push(nullObject);
            }
        }
        handleList.length = 5;

        return handleList;
    }

    async topUserThisMonth() {
        const today = new Date();
        const time = StartEndOfMonth(today.getMonth() + 1, today.getFullYear());
        const firstOfMonth = time.start;
        const firstOfNextMonth = time.end;

        const listBuy = await this.listUserBuyOfTime(firstOfMonth, firstOfNextMonth);
        listBuy.sort((a, b) => b.spent - a.spent);
        const handleList = await Promise.all(listBuy.map(item => this.fillInfoTopUser(item.user, item.spent)));

        if (listBuy.length < 5) {
            for (let i = listBuy.length; i < 5; i++) {
                const nullObject = { id: null, name: "", image: "", spent: 0 };
                handleList.push(nullObject);
            }
        }
        handleList.length = 5;

        return handleList;
    }

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

    async fillInfoTopProduct(proId: Types.ObjectId, sold: number): Promise<TopProductInfo> {
        const infoProduct = await this.productModel.findById(proId);
        const imgUrl = await this.variantModel.findOne({ product: proId });

        return {
            id: proId,
            name: infoProduct.name,
            image: imgUrl.image,
            sold: sold,
        };
    }

    async fillInfoTopUser(userId: Types.ObjectId, spent: number): Promise<TopUserInfo> {
        const info = await this.userModel.findById(userId);

        return {
            id: userId,
            name: info.fullName,
            image: info.avatar,
            spent: spent,
        };
    }

    async listProductSoldOfTime(start: Date, end: Date) {
        const listProduct = await this.orderModel.find({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }).select('items.product items.quantity');

        const soldList = listProduct.flatMap((cur) => cur.items.map((item) => { return { product: item.product, sold: item.quantity } }));

        const productSoldMap = {}
        soldList.forEach(item => {
            if (productSoldMap[item.product as any]) {
                productSoldMap[item.product as any] += item.sold;
            } else {
                productSoldMap[item.product as any] = item.sold;
            }
        });

        const result = Object.keys(productSoldMap).map(product => {
            return { product: new mongoose.Types.ObjectId(product), sold: productSoldMap[product] as number };
        });

        return result;
    }

    async listUserBuyOfTime(start: Date, end: Date) {
        const listUser = await this.orderModel.find({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }).select('user total');

        const buyList = listUser.map((item) => { return { user: item.user, spent: item.total } });
        const buyMap = {}
        buyList.forEach(item => {
            if (buyMap[item.user as any]) {
                buyMap[item.user as any] += item.spent;
            } else {
                buyMap[item.user as any] = item.spent;
            }
        });

        const result = Object.keys(buyMap).map(user => {
            return { user: new mongoose.Types.ObjectId(user), spent: buyMap[user] as number };
        });

        return result;
    }

    // ======================================== REVENUE - EACH BRAND - CATEGORY ========================================
    async statisticalRevenueEachBrandOfMonth(revenueMonthDto: RevenueMonthDto) {
        const { month, year } = revenueMonthDto;
        const time = StartEndOfMonth(month, year);
        const start = time.start;
        const end = time.end;

        const listProductsSold = await this.listProductSoldOfTime(start, end);

        const listBrands = Object.values(PRODUCT_BRAND).reduce((acc, cur) => {
            acc[cur] = 0;
            return acc;
        }, {});
        for (const product of listProductsSold) {
            const info = await this.productModel.findById(product.product).select("brand");
            listBrands[info.brand] += product.sold;
        }

        const result = Object.keys(listBrands).map(brand => {
            return { brand: brand, sold: listBrands[brand] as number };
        });

        return result;
    }

    async statisticalRevenueEachCategoryOfMonth(revenueMonthDto: RevenueMonthDto) {
        const { month, year } = revenueMonthDto;
        const time = StartEndOfMonth(month, year);
        const start = time.start;
        const end = time.end;

        const listProductsSold = await this.listProductSoldOfTime(start, end);

        const foundCategories = await this.categoryModel.find({}).select("name");
        const listCategories = foundCategories.reduce((acc, cur) => {
            acc[cur._id as any] = { name: cur.name, sold: 0 };
            return acc;
        }, {})
        for (const product of listProductsSold) {
            const info = await this.productModel.findById(product.product).select("category");
            listCategories[info.category as any].sold += product.sold;
        }

        const result = Object.keys(listCategories).map(category => {
            return { category: listCategories[category].name, sold: listCategories[category].sold as number };
        });

        return result;
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