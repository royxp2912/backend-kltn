import { GetAllProductRes } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { SORT } from 'src/constants/dto..enum';
import { Model, Types, Document } from 'mongoose';
import { QuantityOfBrand } from 'src/users/types';
import { Product } from 'src/schemas/Product.schema';
import { Category } from 'src/schemas/Category.schema';
import { CommentsService } from 'src/comments/comments.service';
import { VariantsService } from 'src/variants/variants.service';
import { CategoriesService } from 'src/categories/categories.service';
import { PRODUCT_BRAND, PRODUCT_STATUS } from 'src/constants/schema.enum';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateProductDto, GetAllProductDto, GetByCategoryDto, GetByStatusDto, HandleResponseFavoriteDto, HandleResponseGetListDto,
    PaginationKeywordSortDto, UpdateProductDto
} from './dto';
import { FavoritesService } from 'src/favorites/favorites.service';

@Injectable()
export class ProductsService {
    constructor(
        private readonly variantsService: VariantsService,
        private readonly commentsService: CommentsService,
        private readonly categoryService: CategoriesService,
        private readonly favoritesService: FavoritesService,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        // @Inject(forwardRef(() => CommentsService)) private readonly commentsService: CommentsService,
    ) { }

    // CREATE ========================================
    async create(createProductDto: CreateProductDto): Promise<void> {
        const newProduct = new this.productModel(createProductDto);
        await newProduct.save();
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
        if (sort === SORT.pASC) found.sort((a, b) => a.price - b.price);
        if (sort === SORT.pDESC) found.sort((a, b) => b.price - a.price);
        if (sort === SORT.rASC) found.sort((a, b) => a.rating - b.rating);
        if (sort === SORT.rDESC) found.sort((a, b) => b.rating - a.rating);

        let final = [];
        let semiFinal = found;
        if (brand) semiFinal = found.filter(item => item.brand === brand);
        if (color) {
            for (const product of semiFinal) {
                if (await this.variantsService.checkedColorInProduct(product._id, color)) final.push(product);
            }
        } else { final = semiFinal }

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

        const images = await this.variantsService.getListImageByProduct(proId);
        const variants = await this.variantsService.getListColorAndSize(proId);
        const randomVariant = await this.variantsService.randomVarByProduct(proId);
        const reviews = await this.commentsService.totalReviewOfProduct(proId);
        let isFavorite = false;
        if (userId) isFavorite = await this.favoritesService.checkProductIsFavorite(userId, proId);
        return { ...result, images, variants, randomVariant, reviews, isFavorite };
    }

    async getByCategory(getByCategoryDto: GetByCategoryDto): Promise<GetAllProductRes> {
        const user = getByCategoryDto.user;
        const cateId = getByCategoryDto.category;
        await this.categoryService.getById(cateId);

        const pageSize = getByCategoryDto.pageSize || 1;
        const pageNumber = getByCategoryDto.pageNumber || 1;
        const found = await this.productModel.find({ category: cateId })
            .sort({ createdAt: -1 })
            .populate({ path: "category", select: "name" })
            .select('-__v -createdAt -updatedAt');

        return await this.handleResponseGetList({ user, listProducts: found, pageSize, pageNumber });
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
        const found = await this.favoritesService.getByUser(user);

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
        const urlImg = await this.variantsService.getOneImageOfProduct(proId);
        const avaiQuantity = await this.variantsService.getAvailableQuantityOfProduct(proId);
        let isFavorite = false;
        if (userId) isFavorite = await this.favoritesService.checkProductIsFavorite(userId, proId);

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
            const urlImg = await this.variantsService.getOneImageOfProduct(product._id);
            const avaiQuantity = await this.variantsService.getAvailableQuantityOfProduct(product._id);
            const result = { ...found, image: urlImg, available: avaiQuantity, isFavorite: true };
            final.push(result);
        }
        const result: GetAllProductRes = { pages: pages, data: final }

        return result;
    }
}
