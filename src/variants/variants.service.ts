import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from 'src/schemas/Variant.schema';
import { ListColorAndSize, VariantDetail } from './types';
import { DetailVariant } from 'src/schemas/DetailVariant.schema';
import { CreateImageVariantDto } from './dto/CreateImageVariant.dto';
import { VARIANT_COLOR, VARIANT_HEX } from 'src/constants/schema.enum';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    CreateDetailVariantDto, CreateListVariantDto, DetailVariantDto, GetVariantByInfoDto,
    IncreaseOrReduceDto, UpdateDetailVariantDto, UpdateImageVariantDto, UpdateListVariantDto, VariantDto,
} from './dto';
import { Product } from 'src/schemas/Product.schema';

@Injectable()
export class VariantsService {
    constructor(
        @InjectModel(Variant.name) private readonly variantModel: Model<Variant>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(DetailVariant.name) private readonly detailVariantModel: Model<DetailVariant>,
    ) { }

    // POST  ==============================================
    async createList(createListVariantDto: CreateListVariantDto): Promise<void> {
        const { product, color, ...others } = createListVariantDto;
        const detailsVariant: VariantDetail[] = JSON.parse(others.details);

        if (others.image) {
            await this.createVariant({ product: product, color: color, image: others.image });
        }
        if (detailsVariant) {
            const foundVar = await this.getVarByInfo(product, color);
            for (const variant of detailsVariant) {
                await this.create({ variant: foundVar._id, ...variant })
            }
        }
    } // done

    async create(createDetailVariantDto: CreateDetailVariantDto): Promise<void> {
        const found = await this.getDetailByVar(createDetailVariantDto.variant, createDetailVariantDto.size);
        if (found) {
            found.quantity += createDetailVariantDto.quantity;
            await found.save();
        } else {
            const result = new this.detailVariantModel({
                variant: createDetailVariantDto.variant,
                size: createDetailVariantDto.size,
                quantity: createDetailVariantDto.quantity
            });
            await result.save();
        }
    } // done

    // PATCH - PUT ========================================
    async increaseQuantity(increaseQuantityDto: IncreaseOrReduceDto): Promise<void> {
        const { product, color, size, quantity } = increaseQuantityDto;
        const foundVar = await this.getVarByInfo(product, color);
        const updated = await this.detailVariantModel.findOneAndUpdate(
            { variant: foundVar._id, size: size },
            { $inc: { quantity: quantity } },
        )
        if (!updated) throw new NotFoundException("Variant not found.")
    } // done - ch tesst

    async reduceQuantity(reduceQuantityDto: IncreaseOrReduceDto): Promise<void> {
        const { product, color, size, quantity } = reduceQuantityDto;
        const foundVar = await this.getVarByInfo(product, color);
        const updated = await this.detailVariantModel.findOneAndUpdate(
            { variant: foundVar._id, size: size },
            { $inc: { quantity: -quantity } },
        )
        if (!updated) throw new NotFoundException("Variant not found.")
    } // done - ch tesst

    async updateList(updateListVariantDto: UpdateListVariantDto): Promise<void> {
        const { product, color, ...others } = updateListVariantDto;
        if (others.image) {
            await this.updateVariant({ product: product, image: others.image, color: color });
        }
        if (others.details) {
            const foundVar = await this.getVarByInfo(product, color);
            const detailsVariant: VariantDetail[] = JSON.parse(others.details);
            for (const variant of detailsVariant) {
                await this.update({ variant: foundVar._id, ...variant })
            }
        }
    }

    async update(updateDetailVariantDto: UpdateDetailVariantDto): Promise<void> {
        const { variant, size, quantity } = updateDetailVariantDto;
        const updated = await this.detailVariantModel.findOneAndUpdate(
            { variant: variant, size: size },
            { $set: { quantity: quantity } },
        )
        if (!updated) await this.create({ variant, size, quantity });
    }

    // GET ================================================
    async getQuantityByDetail(detailVariantDto: DetailVariantDto) {
        const { product, color, size } = detailVariantDto;
        const foundVar = await this.getVarByInfo(product, color);
        if (!foundVar) throw new NotFoundException(`Currently, this product is not available in ${color}.`);

        const foundDetail = await this.detailVariantModel.findOne({
            variant: foundVar._id, size: size,
        }).select("size quantity");
        if (!foundDetail) throw new NotFoundException("Variant not found.");

        return { _id: foundDetail._id, color, hex: foundVar.hex, image: foundVar.image, size, quantity: foundDetail.quantity };
    } // check id có được sử dụng không

    async randomVarByProduct(proId: Types.ObjectId) {
        const foundVar = await this.variantModel.find({ product: proId });
        for (const variant of foundVar) {
            const result = await this.detailVariantModel.findOne({ variant: variant._id, quantity: { $gte: 1 } });
            if (result) return {
                color: variant.color,
                hex: variant.hex,
                image: variant.image,
                size: result.size,
                quantity: result.quantity
            };
        }
    } // done

    async randomVarWithQuantityOne(proId: Types.ObjectId) {
        const foundVar = await this.variantModel.find({ product: proId });
        for (const variant of foundVar) {
            const result = await this.detailVariantModel.findOne({
                variant: variant._id,
                quantity: { $gte: 1 },
            }).select("color size quantity -_id");
            if (result) return { color: variant.color, size: result.size, quantity: 1 };
        }
    } // done

    async getSizeByColorAndProduct(color: VARIANT_COLOR, proId: Types.ObjectId) {
        const foundVar = await this.getVarByInfo(proId, color);
        const result = await this.detailVariantModel.find({ variant: foundVar._id }).select("size quantity -_id");
        return result;
    } // done

    async getColorBySizeAndProduct(size: string, proId: Types.ObjectId) {
        const foundColors = await this.variantModel.find({ product: proId });
        const result = [];
        for (const item of foundColors) {
            const foundDetail = await this.checkSizeInColor(item._id, size);
            if (foundDetail) {
                result.push({ color: item.color, hex: item.hex, image: item.image, quantity: foundDetail.quantity });
            }
        }
        return result;
    } // done

    async getById(varId: Types.ObjectId) {
        const result = await this.variantModel.findById(varId);
        if (!result) throw new NotFoundException("Variant not found.");
        return result;
    } // never use

    async getListColorAndSize(proId: Types.ObjectId): Promise<ListColorAndSize> {
        const foundVar = await this.variantModel.find({ product: proId });
        const listColor = foundVar.map(item => { return { color: item.color, hex: item.hex, image: item.image } });

        const final = [];
        for (const item of foundVar) {
            const foundDetail = await this.detailVariantModel.find({ variant: item._id })
            const explain = foundDetail.map(item => item.size);
            final.push(...explain);
        }
        const listSize = [...new Set(final)];

        return { listColor: listColor, listSize: listSize }
    } // done

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
    } // done

    async checkedStockAll(proId: Types.ObjectId): Promise<boolean> {
        const foundVar = await this.variantModel.find({ product: proId });
        const result = await Promise.all(foundVar.map(item => this.detailVariantModel.find({ variant: item._id })));
        const isStock = result.flat().reduce((acc, cur) => acc + cur.quantity, 0);
        if (isStock === 0) return false;

        return true;
    } // done

    async checkedStockVariant(variantDto: VariantDto): Promise<boolean> {
        const { product, color, size, quantity } = variantDto;
        const foundVar = await this.getVarByInfo(product, color);
        if (!foundVar) throw new NotFoundException(`Currently, this product is not available in ${color}.`);
        const foundDetail = await this.detailVariantModel.findOne({ variant: foundVar._id, size: size });
        if (!foundDetail) throw new NotFoundException("Variant not found.");

        if (quantity > foundDetail.quantity) return false;

        return true;
    } // done

    async getDetailByVar(varId: Types.ObjectId, size: string) {
        const found = await this.detailVariantModel.findOne({ variant: varId, size: size })
        return found;
    } // done - ch test

    async getDetail(getVariantByInfoDto: GetVariantByInfoDto) {
        const foundVar = await this.getVarByInfo(getVariantByInfoDto.product, getVariantByInfoDto.color);
        if (!foundVar) throw new NotFoundException(`Currently, this product is not available in ${getVariantByInfoDto.color}.`);

        const foundDetail = await this.getDetailByVar(foundVar._id, getVariantByInfoDto.size);
        if (!foundDetail) throw new NotFoundException("Variant not found.");
        return {
            product: foundVar.product,
            color: foundVar.color,
            hex: foundVar.hex,
            size: foundDetail.size,
            quantity: foundDetail.quantity,
            image: foundVar.image,
        };
    } // done

    // DELETE =============================================
    async deleteById(varId: Types.ObjectId): Promise<void> {
        const result = await this.variantModel.findByIdAndDelete(varId);
        if (!result) throw new NotFoundException("Variant not found.");
    }

    async deleteAll(): Promise<void> {
        await this.variantModel.deleteMany({});
        await this.detailVariantModel.deleteMany({});
    }

    // ============================================= ##################### =============================================
    // ============================================= IMAGE VARIANT - COLOR =============================================
    // ============================================= ##################### =============================================

    // POST ====================================================
    async createVariant(createImageVariantDto: CreateImageVariantDto): Promise<void> {
        const found = await this.getVarByInfo(createImageVariantDto.product, createImageVariantDto.color);
        if (found) {
            found.image = createImageVariantDto.image;
            found.save();
        } else {
            const newImgVar = new this.variantModel({ ...createImageVariantDto, hex: VARIANT_HEX[createImageVariantDto.color] });
            await newImgVar.save();
        }
    }

    // UPDATE =============================================
    async updateVariant(updateImageVariantDto: UpdateImageVariantDto): Promise<void> {
        const { product, color, image } = updateImageVariantDto;
        const result = await this.variantModel.findOneAndUpdate(
            { product: product, color: color }
            , { $set: { image: image } });
        if (!result) throw new NotFoundException("Product not found");
    }

    // READ =====================================================
    async findProductByColor(color: VARIANT_COLOR) {
        const result = await this.variantModel.find({
            color: color,
        }).select("product -_id");

        return result.map(item => item.product);
    }

    async getVarByInfo(proId: Types.ObjectId, color: VARIANT_COLOR) {
        await this.checkProductExist(proId);
        const result = await this.variantModel.findOne({
            product: proId,
            color: color,
        });
        return result;
    } // done

    async getUrlByInfo(proId: Types.ObjectId, color: VARIANT_COLOR): Promise<string> {
        const result = await this.variantModel.findOne({
            product: proId,
            color: color,
        });
        return result.image;
    } // done

    async getListImageByProduct(proId: Types.ObjectId): Promise<string[]> {
        const result = await this.variantModel.find({ product: proId });
        return result.map(item => item.image);
    } // done

    // DELETE ==================================================

    // ============================================= SPECIAL =============================================
    async checkProductExist(proId: Types.ObjectId) {
        const found = await this.productModel.findById(proId);
        if (!found) throw new NotFoundException("Product not found.");
    }

    async checkSizeInColor(varId: Types.ObjectId, size: string) {
        const found = await this.detailVariantModel.findOne({ variant: varId, size: size });
        if (!found) return false;
        return found;
    }

    async getOneImageOfProduct(proId: Types.ObjectId): Promise<string> {
        const result = await this.variantModel.findOne({ product: proId });
        return result.image;
    }

    async getAvailableQuantityOfProduct(proId: Types.ObjectId): Promise<number> {
        const foundVar = await this.variantModel.find({ product: proId });
        const result = await Promise.all(foundVar.map(item => this.detailVariantModel.find({ variant: item._id })));
        const avaiQuantity = result.flat().reduce((acc, cur) => acc + cur.quantity, 0);

        return avaiQuantity;
    }
}
