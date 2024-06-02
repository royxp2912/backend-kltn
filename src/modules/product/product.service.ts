import { GetAllProductRes } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { SORT } from 'src/constants/dto..enum';
import { Model, Types, Document } from 'mongoose';
import { QuantityOfBrand } from '../user/types';
import { Product } from 'src/schemas/product.schema';
import { Category } from 'src/schemas/category.schema';
import { OrderService } from '../order/order.service';
import { CommentService } from '../comment/comment.service';
import { VariantService } from '../variant/variant.service';
import { FavoriteService } from '../favorite/favorite.service';
import { CategoryService } from '../category/category.service';
import { PRODUCT_BRAND, PRODUCT_STATUS, VARIANT_COLOR } from 'src/constants/schema.enum';
import { OPTION_PRICE_MANAGEMENT, PART_PRICE_MANAGEMENT, TYPE_PRICE_MANAGEMENT } from './constants';
import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateProductDto, GetAllProductDto, GetByCategoryDto, GetByStatusDto, HandleResponseFavoriteDto, HandleResponseGetListDto,
    PaginationKeywordSortDto, PriceManagementDto, UpdatePriceDto, UpdateProductDto
} from './dto';

@Injectable()
export class ProductService {
    constructor(
        private readonly variantService: VariantService,
        private readonly commentService: CommentService,
        private readonly categoryService: CategoryService,
        private readonly favoriteService: FavoriteService,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @Inject(forwardRef(() => OrderService)) private readonly orderService: OrderService,
    ) { }

    // CREATE ========================================
    async create(createProductDto: CreateProductDto) {
        const newProduct = new this.productModel(createProductDto);
        return await newProduct.save();
    }

    // UPDATE ========================================
    async updateSold(proId: Types.ObjectId, sold: number): Promise<void> {
        const found = await this.productModel.findByIdAndUpdate(proId, { $inc: { sold: sold } });
        if (!found) throw new NotFoundException("Product not found.");
    }

    async updateStock(proId: Types.ObjectId, isStock: boolean): Promise<void> {
        const found = await this.productModel.findByIdAndUpdate(proId, { $set: { isStock: isStock } });
        if (!found) throw new NotFoundException("Product not found.");
    }

    async lock(proId: Types.ObjectId): Promise<void> {
        const found = await this.getById(proId);
        if (found.status === PRODUCT_STATUS.Locked) throw new ConflictException("Product is already locked.");

        found.status = PRODUCT_STATUS.Locked;
        await found.save();
    }

    async hide(proId: Types.ObjectId): Promise<void> {
        const found = await this.getById(proId);
        if (found.status === PRODUCT_STATUS.Hide) throw new ConflictException("Product is already hidden.");

        found.status = PRODUCT_STATUS.Hide;
        await found.save();
    }

    async unLockOrHide(proId: Types.ObjectId): Promise<void> {
        const found = await this.getById(proId);
        if (found.status === PRODUCT_STATUS.Active) throw new ConflictException("Product is already active.");

        found.status = PRODUCT_STATUS.Active;
        await found.save();
    }

    async update(updateProductDto: UpdateProductDto): Promise<void> {
        const { product, ...others } = updateProductDto;
        const updated = await this.productModel.findByIdAndUpdate(product, { $set: others });
        if (!updated) throw new NotFoundException("Product not found.");
    }

    // READ ========================================
    async findByKeywordASort(paginationKeywordSortDto: PaginationKeywordSortDto): Promise<GetAllProductRes> {
        const user = paginationKeywordSortDto.user;
        const sort = paginationKeywordSortDto.sort;
        const color = paginationKeywordSortDto.color;
        const brand = paginationKeywordSortDto.brand;
        const keyword = paginationKeywordSortDto.keyword;
        const pageSize = paginationKeywordSortDto.pageSize || 1;
        const pageNumber = paginationKeywordSortDto.pageNumber || 1;

        const found = await this.productModel.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { desc: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } },
                { category: { $in: await this.categoryModel.find({ name: { $regex: keyword, $options: 'i' } }) } },
            ],
        }).select("_id price rating brand");

        const final = await this.allSort(found, brand, color, sort);

        return await this.handleResponseGetList({ user, listProducts: final, pageSize, pageNumber });
    }

    async getQuantityEachBrand(): Promise<QuantityOfBrand[]> {
        const result: QuantityOfBrand[] = [];

        for (const brand in PRODUCT_BRAND) {
            const brandValue = PRODUCT_BRAND[brand];
            const quantityOfBrand = await this.getQuantityOfBrand(brandValue);
            result.push(quantityOfBrand);
        }

        return result;
    }

    async getById(proId: Types.ObjectId) {
        const result = await this.productModel.findById(proId)
            .populate({ path: "category", select: "name" })
            .select("-__v -createdAt -updatedAt -status");
        if (!result) throw new NotFoundException("Product not found.");
        return result;
    }

    async getDetailProduct(proId: Types.ObjectId, userId?: Types.ObjectId) {
        const result = await this.productModel.findById(proId)
            .populate({ path: "category", select: "name" })
            .select("-__v -createdAt -updatedAt -status")
            .lean();
        if (!result) throw new NotFoundException("Product not found.");

        const images = await this.variantService.getListImageByProduct(proId);
        const variants = await this.variantService.getListColorAndSize(proId);
        const randomVariant = await this.variantService.randomVarByProduct(proId);
        const reviews = await this.commentService.totalReviewOfProduct(proId);
        let isFavorite = false;
        if (userId) isFavorite = await this.favoriteService.checkProductIsFavorite(userId, proId);
        return { ...result, images, variants, randomVariant, reviews, isFavorite };
    }

    async getDetailProductByAdmin(proId: Types.ObjectId) {
        const result = await this.productModel.findById(proId)
            .populate({ path: "category", select: "name" })
            .select("-__v -createdAt -updatedAt -status")
            .lean();
        if (!result) throw new NotFoundException("Product not found.");

        // const images = await this.variantService.getListImageByProduct(proId);
        // const variants = await this.variantService.getListColorAndSize(proId);
        // const randomVariant = await this.variantService.randomVarByProduct(proId);
        const reviews = await this.commentService.totalReviewOfProduct(proId);
        const listVariants = await this.variantService.getListVariantOfProduct(proId);

        return { ...result, reviews, listVariants };
    }

    async getByCategory(getByCategoryDto: GetByCategoryDto): Promise<GetAllProductRes> {
        const cateId = getByCategoryDto.category;
        const { user, sort, brand, color } = getByCategoryDto;
        await this.categoryService.getById(cateId);

        const pageSize = getByCategoryDto.pageSize || 1;
        const pageNumber = getByCategoryDto.pageNumber || 1;
        const found = await this.productModel.find({ category: cateId })
            .sort({ createdAt: -1 })
            .populate({ path: "category", select: "name" })
            .select('-__v -createdAt -updatedAt');

        const final = await this.allSort(found, brand, color, sort);

        return await this.handleResponseGetList({ user, listProducts: final, pageSize, pageNumber });
    }

    async getByStatus(getByStatusDto: GetByStatusDto): Promise<GetAllProductRes> {
        const pageSize = getByStatusDto.pageSize || 1;
        const pageNumber = getByStatusDto.pageNumber || 1;
        const found = await this.productModel.find({ status: getByStatusDto.status })
            .sort({ createdAt: -1 })
            .populate({ path: "category", select: "name" })
            .select('-__v -createdAt -updatedAt');

        return await this.handleResponseGetList({ listProducts: found, pageSize, pageNumber });
    }

    async getAll(getAllProductDto: GetAllProductDto): Promise<GetAllProductRes> {
        const user = getAllProductDto.user;
        const pageSize = getAllProductDto.pageSize || 1;
        const pageNumber = getAllProductDto.pageNumber || 1;
        const found = await this.productModel.find()
            .sort({ createdAt: -1 })
            .populate({ path: "category", select: "name" })
            .select('-__v -createdAt -updatedAt');

        return await this.handleResponseGetList({ user, listProducts: found, pageSize, pageNumber });
    }

    async getFavoriteList(getAllProductDto: GetAllProductDto): Promise<GetAllProductRes> {
        const user = getAllProductDto.user;
        const pageSize = getAllProductDto.pageSize || 1;
        const pageNumber = getAllProductDto.pageNumber || 1;
        const found = await this.favoriteService.getByUser(user);

        return await this.handleResponseGetFavorite({ user, listProducts: found, pageSize, pageNumber });
    }

    // not api - GET
    async getQuantityOfBrand(brand: PRODUCT_BRAND): Promise<QuantityOfBrand> {
        const result = await this.productModel.find({ brand: brand });
        return {
            brand: brand,
            quantity: result.length,
        };
    }

    // DELETE ========================================
    async deleteById(proId: Types.ObjectId): Promise<Product> {
        return
    }

    // ======================================== SPECIAL ========================================
    async handleResponseGetList(handleResponseGetListDto: HandleResponseGetListDto): Promise<GetAllProductRes> {
        const { listProducts, pageSize, pageNumber, user } = handleResponseGetListDto;

        const pages: number = Math.ceil(listProducts.length / pageSize);
        const semiFinal = listProducts.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const final = await this.fillInfoListProducts(user, semiFinal);
        const result: GetAllProductRes = { pages: pages, data: final }

        return result;
    }

    async fillInfoListProducts(userId: Types.ObjectId, listProducts: (Document<unknown, {}, Product> & Product & { _id: Types.ObjectId })[]) {
        const result = [];
        for (const product of listProducts) {
            const found = await this.fillInfoOneProduct(product._id, userId);
            result.push(found);
        }
        return result;
    }

    async fillInfoOneProduct(proId: Types.ObjectId, userId: Types.ObjectId) {
        const found = await this.productModel.findById(proId)
            .populate({ path: 'category', select: 'name' })
            .select("-__v -createdAt -updatedAt -status")
            .lean();
        const urlImg = await this.variantService.getOneImageOfProduct(proId);
        const avaiQuantity = await this.variantService.getAvailableQuantityOfProduct(proId);
        let isFavorite = false;
        if (userId) isFavorite = await this.favoriteService.checkProductIsFavorite(userId, proId);

        return { ...found, image: urlImg, available: avaiQuantity, isFavorite };
    }

    // async fillInfoListProductsByIds(listIds: (Types.ObjectId)[]) {
    //     const result = [];
    //     for (const product of listIds) {
    //         const found = await this.fillInfoOneProduct(product._id);
    //         result.push(found);
    //     }
    //     return result;
    // }

    async handleResponseGetFavorite(handleResponseFavoriteDto: HandleResponseFavoriteDto): Promise<GetAllProductRes> {
        const { listProducts, pageSize, pageNumber, user } = handleResponseFavoriteDto;

        const pages: number = Math.ceil(listProducts.length / pageSize);
        const semiFinal = listProducts.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        // const final = await this.fillInfoFavoriteList(user, semiFinal);
        const final = [];
        for (const product of semiFinal) {
            const found = await this.productModel.findById(product._id)
                .populate({ path: 'category', select: 'name' })
                .select("-__v -createdAt -updatedAt -status")
                .lean();
            const urlImg = await this.variantService.getOneImageOfProduct(product._id);
            const avaiQuantity = await this.variantService.getAvailableQuantityOfProduct(product._id);
            const result = { ...found, image: urlImg, available: avaiQuantity, isFavorite: true };
            final.push(result);
        }
        const result: GetAllProductRes = { pages: pages, data: final }

        return result;
    }

    // ======================================== PRICE MANAGEMENT ========================================
    async priceManagement(priceManagementDto: PriceManagementDto) {
        const { part, ...others } = priceManagementDto;

        const updateQuery = {};
        if (others.type === TYPE_PRICE_MANAGEMENT.PERCENT) {
            const changeValue = others.option === OPTION_PRICE_MANAGEMENT.INCREASE ? (1 + others.value / 100).toFixed(2) : (1 - others.value / 100).toFixed(2);
            updateQuery["$mul"] = { "price": changeValue }
        } else {
            const changeValue = others.option === OPTION_PRICE_MANAGEMENT.INCREASE ? others.value : - others.value;
            updateQuery["$inc"] = { "price": changeValue }
        }
        console.log("updateQuery: ", updateQuery);


        switch (part) {
            case PART_PRICE_MANAGEMENT.BRAND:
                await this.updatePriceOfBrand({ ...others, updateQuery });
                break;

            case PART_PRICE_MANAGEMENT.CATEGORY:
                await this.updatePriceOfCategory({ ...others, updateQuery });
                break;

            case PART_PRICE_MANAGEMENT.SELECTED:
                await this.updatePriceOfSelected({ ...others, updateQuery });
                break;

            default: await this.updatePriceAll({ updateQuery });
        }

    }

    async updatePriceOfBrand(updatePriceDto: UpdatePriceDto) {
        const { brand, updateQuery } = updatePriceDto;

        await this.productModel.updateMany({ brand: brand }, updateQuery);
    }

    async updatePriceOfCategory(updatePriceDto: UpdatePriceDto) {
        const { category, updateQuery } = updatePriceDto;

        // await this.productModel.updateMany({ category: category }, updateQuery);
        await this.productModel.updateMany({ category: category }, updateQuery);
        await this.productModel.aggregate([
            { $project: { price: { $round: ["$price", 2] } } }
        ])
    }

    async updatePriceOfSelected(updatePriceDto: UpdatePriceDto) {
        const { selected, updateQuery } = updatePriceDto;

        for (const product of selected) {
            await this.productModel.findByIdAndUpdate(product, updateQuery);
        }
    }

    async updatePriceAll(updatePriceDto: UpdatePriceDto) {
        const { updateQuery } = updatePriceDto;

        await this.productModel.updateMany({}, updateQuery);
    }

    // ======================================== HOT DEAL ========================================
    async allSort(listProducts: (Document<unknown, {}, Product> & Product & { _id: Types.ObjectId })[], brand?: PRODUCT_BRAND, color?: VARIANT_COLOR, sort?: SORT) {
        let final = [];
        let semiFinal = listProducts;
        if (brand) semiFinal = listProducts.filter(item => item.brand === brand);
        if (color) {
            for (const product of semiFinal) {
                if (await this.variantService.checkedColorInProduct(product._id, color)) final.push(product);
            }
        } else { final = semiFinal }

        if (sort === SORT.pASC) final.sort((a, b) => a.price - b.price);
        if (sort === SORT.pDESC) final.sort((a, b) => b.price - a.price);
        if (sort === SORT.rASC) final.sort((a, b) => a.rating - b.rating);
        if (sort === SORT.rDESC) final.sort((a, b) => b.rating - a.rating);
        if (sort === SORT.HOT) return await this.sortHotDeal(final);

        return final;
    }

    async sortHotDeal(listProducts: (Document<unknown, {}, Product> & Product & { _id: Types.ObjectId })[]) {
        const result = [];
        for (const product of listProducts) {
            const quantitySold = await this.orderService.getSoldOfProductInMonthAgo(product._id);
            result.push({ _id: product._id, quantitySold });
        }

        result.sort((a, b) => b.quantitySold - a.quantitySold);

        return result;
    }
}
