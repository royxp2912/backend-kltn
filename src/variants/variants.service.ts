import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from 'src/schemas/Variant.schema';
import { ListColorAndSize, VariantDetail } from './types';
import { ImageVariant } from 'src/schemas/ImageVariant.schema';
import { CreateImageVariantDto } from './dto/CreateImageVariant.dto';
import { VARIANT_COLOR, VARIANT_HEX } from 'src/constants/schema.enum';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    CreateListVariantDto, CreateVariantDto, DetailVariantDto, GetVariantByInfoDto,
    IncreaseOrReduceDto, UpdateImageVariantDto, UpdateListVariantDto, UpdateVariantDto, VariantDto,
} from './dto';
import { Product } from 'src/schemas/Product.schema';

@Injectable()
export class VariantsService {
    constructor(
        @InjectModel(Variant.name) private readonly variantModel: Model<Variant>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(ImageVariant.name) private readonly imageVariantModel: Model<ImageVariant>,
    ) { }

    // POST  ==============================================
    async createList(createListVariantDto: CreateListVariantDto): Promise<void> {
        const { product, color, ...others } = createListVariantDto;
        const detailsVariant: VariantDetail[] = JSON.parse(others.details);

        if (others.image) {
            await this.createImgVar({ product: product, color: color, image: others.image });
        }
        if (detailsVariant) {
            for (const variant of detailsVariant) {
                await this.create({ product: product, color: color, ...variant })
            }
        }
    }

    async create(createVariantDto: CreateVariantDto): Promise<void> {
        const infoVar: GetVariantByInfoDto = {
            product: createVariantDto.product,
            color: createVariantDto.color,
            size: createVariantDto.size,
        }
        const found = await this.getByInfo(infoVar);
        if (found) {
            found.quantity += createVariantDto.quantity;
            await found.save();
        } else {
            const result = new this.variantModel({ ...createVariantDto, hex: VARIANT_HEX[createVariantDto.color] });
            await result.save();
        }
    }

    // PATCH - PUT ========================================
    async increaseQuantity(increaseQuantityDto: IncreaseOrReduceDto): Promise<void> {
        const { product, color, size, quantity } = increaseQuantityDto;
        const updated = await this.variantModel.findOneAndUpdate(
            { product: product, color: color, size: size },
            { $inc: { quantity: quantity } },
        )
        if (!updated) throw new NotFoundException("Variant not found.")
    }

    async reduceQuantity(reduceQuantityDto: IncreaseOrReduceDto): Promise<void> {
        const { product, color, size, quantity } = reduceQuantityDto;
        const updated = await this.variantModel.findOneAndUpdate(
            { product: product, color: color, size: size },
            { $inc: { quantity: -quantity } },
        )
        if (!updated) throw new NotFoundException("Variant not found.")
    }

    async updateList(updateListVariantDto: UpdateListVariantDto): Promise<void> {
        const { product, color, ...others } = updateListVariantDto;
        if (others.image) {
            await this.updateImgVar({ product: product, image: others.image, color: color });
        }
        if (others.details) {
            const detailsVariant: VariantDetail[] = JSON.parse(others.details);
            for (const variant of detailsVariant) {
                await this.update({ product: product, color: color, ...variant })
            }
        }
    }

    async update(updateVariantDto: UpdateVariantDto): Promise<void> {
        const { product, color, size, quantity } = updateVariantDto;
        const updated = await this.variantModel.findOneAndUpdate(
            { product: product, color: color, size: size },
            { $set: { quantity: quantity } },
        )
        if (!updated) await this.create({ product, color, size, quantity });
    }

    // GET ================================================
    async getQuantityByDetail(detailVariantDto: DetailVariantDto) {
        const { product, color, size } = detailVariantDto;
        const result = await this.variantModel.findOne({
            product: product, color: color, size: size,
        }).select("color size quantity");
        if (!result) throw new NotFoundException("Variant not found.");

        const image = await this.getUrlByInfo(product, result.color);

        return { _id: result._id, color: result.color, hex: result.hex, image, size: result.size, quantity: result.quantity };
    }

    async randomVarByProduct(proId: Types.ObjectId) {
        const result = await this.variantModel.findOne({
            product: proId,
            quantity: { $gte: 1 },
        }).select("color size quantity -_id");

        // const image = await this.getUrlByInfo(proId, result.color);

        return { color: result.color, size: result.size, quantity: result.quantity };
    }

    async randomVarWithQuantityOne(proId: Types.ObjectId) {
        const result = await this.variantModel.findOne({
            product: proId,
            quantity: { $gte: 1 },
        }).select("color size -_id");

        return { color: result.color, size: result.size, quantity: 1 };
    }

    async getSizeByColorAndProduct(color: VARIANT_COLOR, proId: Types.ObjectId) {
        const result = await this.variantModel.find({
            product: proId,
            color: color,
        }).select("size quantity -_id");

        return result;
    }

    async getColorBySizeAndProduct(size: string, proId: Types.ObjectId) {
        const result = await this.variantModel.find({
            product: proId,
            size: size,
        }).select("color hex quantity -_id");

        return result;
    }

    async getById(varId: Types.ObjectId) {
        const result = await this.variantModel.findById(varId);
        if (!result) throw new NotFoundException("Variant not found.");
        return result;
    }

    async getListColorAndSize(proId: Types.ObjectId): Promise<ListColorAndSize> {
        const result = await this.variantModel.find({ product: proId });
        const listColor = [...new Set(result.map(item => item.color))];
        const listSize = [...new Set(result.map(item => item.size))];

        // get image of color
        const resultImg = await Promise.all(listColor.map(item => this.getImageByInfo(proId, item)));
        const final = resultImg.map(item => {
            return {
                color: item.color,
                hex: VARIANT_HEX[item.color],
                image: item.image,
            }
        });

        return { listColor: final, listSize: listSize }
    }

    async getVarsOfProduct(proId: Types.ObjectId): Promise<Variant[]> {
        // check product exist
        await this.checkProductExist(proId);
        return await this.variantModel.find({ product: proId }).select("-__v -createdAt -updatedAt");
    }

    async checkedColorInProduct(proId: Types.ObjectId, color: VARIANT_COLOR): Promise<boolean> {
        const result = await this.variantModel.findOne({
            product: proId,
            color: { $regex: new RegExp(`^${color}$`, 'i') },
        });
        if (!result) return false;

        return true;
    }

    async checkedStockAll(proId: Types.ObjectId): Promise<boolean> {
        const result: Variant[] = await this.variantModel.find({ product: proId });
        const isStock = result.reduce((acc, cur) => acc + cur.quantity, 0);
        if (isStock === 0) return false;

        return true;
    }

    async checkedStockVariant(variantDto: VariantDto): Promise<boolean> {
        const { product, color, size, quantity } = variantDto;
        const found = await this.getByInfo({ product, color, size });

        if (quantity > found.quantity) return false;

        return true;
    }

    async getByInfo(getVariantByInfoDto: GetVariantByInfoDto) {
        const result = await this.variantModel.findOne({
            product: getVariantByInfoDto.product,
            color: getVariantByInfoDto.color,
            size: getVariantByInfoDto.size,
        });
        return result;
    }

    async getDetail(getVariantByInfoDto: GetVariantByInfoDto) {
        const foundVar = await this.getByInfo(getVariantByInfoDto);
        const foundImg = await this.getUrlByInfo(getVariantByInfoDto.product, getVariantByInfoDto.color);
        return {
            _id: foundVar._id,
            product: foundVar.product,
            color: foundVar.color,
            hex: foundVar.hex,
            size: foundVar.size,
            quantity: foundVar.quantity,
            image: foundImg
        };
    }

    // DELETE =============================================
    async deleteById(varId: Types.ObjectId): Promise<void> {
        const result = await this.variantModel.findByIdAndDelete(varId);
        if (!result) throw new NotFoundException("Variant not found.");
    }

    async deleteAll(): Promise<void> {
        await this.variantModel.deleteMany({});
        await this.imageVariantModel.deleteMany({});
    }

    // ============================================= ##################### =============================================
    // ============================================= IMAGE VARIANT - COLOR =============================================
    // ============================================= ##################### =============================================

    // POST ====================================================
    async createImgVar(createImageVariantDto: CreateImageVariantDto): Promise<void> {
        const found = await this.getImageByInfo(createImageVariantDto.product, createImageVariantDto.color);
        if (found) {
            found.image = createImageVariantDto.image;
            found.save();
        } else {
            const newImgVar = new this.imageVariantModel(createImageVariantDto);
            await newImgVar.save();
        }
    }

    // PATCH - PUT =============================================
    async updateImgVar(updateImageVariantDto: UpdateImageVariantDto): Promise<void> {
        const { product, color, image } = updateImageVariantDto;
        const result = await this.imageVariantModel.findOneAndUpdate(
            { product: product, color: color }
            , { $set: { image: image } });
        if (!result) throw new NotFoundException("Product not found");
    }

    // GET =====================================================
    async findProductByColor(color: VARIANT_COLOR) {
        const result = await this.imageVariantModel.find({
            color: color,
        }).select("product -_id");

        return result.map(item => item.product);
    }

    async getImageByInfo(proId: Types.ObjectId, color: VARIANT_COLOR) {
        // check product exist
        await this.checkProductExist(proId);
        const result = await this.imageVariantModel.findOne({
            product: proId,
            color: color,
        });
        if (!result) throw new BadRequestException(`The current product does not have ${color} color.`);
        return result;
    }

    async getUrlByInfo(proId: Types.ObjectId, color: VARIANT_COLOR): Promise<string> {
        const result = await this.imageVariantModel.findOne({
            product: proId,
            color: color,
        });
        return result.image;
    }

    async getListImageByProduct(proId: Types.ObjectId): Promise<string[]> {
        const result = await this.imageVariantModel.find({ product: proId });
        return result.map(item => item.image);
    }

    // DELETE ==================================================

    // ============================================= SPECIAL =============================================
    async checkProductExist(proId: Types.ObjectId) {
        const found = await this.productModel.findById(proId);
        if (!found) throw new NotFoundException("Product not found.");
    }
}
