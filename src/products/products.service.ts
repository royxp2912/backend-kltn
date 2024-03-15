import { Model, Types } from 'mongoose';
import { GetAllProductRes } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { QuantityOfBrand } from 'src/users/types';
import { Product } from 'src/schemas/Product.schema';
import { CategoriesService } from 'src/categories/categories.service';
import { PRODUCT_BRAND, PRODUCT_STATUS } from 'src/constants/schema.enum';
import { CreateProductDto, GetAllProductDto, GetByCategoryDto, GetByStatusDto } from './dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { VariantsService } from 'src/variants/variants.service';

@Injectable()
export class ProductsService {
    constructor(
        private readonly variantsService: VariantsService,
        private readonly categoryService: CategoriesService,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
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

    // READ ========================================
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
        const result = await this.productModel.findById(proId);
        if (!result) throw new NotFoundException("Product not found.");
        return result;
    }

    async getByCategory(getByCategoryDto: GetByCategoryDto): Promise<GetAllProductRes> {
        const cateId = getByCategoryDto.category;
        await this.categoryService.getById(cateId);

        const pageSize = getByCategoryDto.pageSize || 1;
        const pageNumber = getByCategoryDto.pageNumber || 1;
        const found = await this.productModel.find({ category: cateId })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .select('-__v -createdAt -updatedAt');
        const pages: number = Math.ceil(found.length / pageSize);
        const result: GetAllProductRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getByStatus(getByStatusDto: GetByStatusDto): Promise<GetAllProductRes> {
        const pageSize = getByStatusDto.pageSize || 1;
        const pageNumber = getByStatusDto.pageNumber || 1;
        const found = await this.productModel.find({ status: getByStatusDto.status })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .select('-__v -createdAt -updatedAt');
        const pages: number = Math.ceil(found.length / pageSize);
        const result: GetAllProductRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getAll(getAllProductDto: GetAllProductDto): Promise<GetAllProductRes> {
        const pageSize = getAllProductDto.pageSize || 1;
        const pageNumber = getAllProductDto.pageNumber || 1;
        const found = await this.productModel.find()
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .select('-__v -createdAt -updatedAt');
        const pages: number = Math.ceil(found.length / pageSize);
        const result: GetAllProductRes = {
            pages: pages,
            data: found,
        }
        return result;
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
}
