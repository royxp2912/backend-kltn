import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from 'src/schemas/cart.schema';
import { User } from 'src/schemas/user.schema';
import { AddToCartDto } from './dto/AddToCart.dto';
import { Product } from 'src/schemas/product.schema';
import { VARIANT_HEX } from 'src/constants/schema.enum';
import { VariantService } from '../variant/variant.service';
import { DetailProductInCart } from 'src/constants/schema.type';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AddWithoutVariantDto, DetailVariantItemDto, RemoveFromCartDto, UpdateVariantCartDto } from './dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        private readonly variantService: VariantService,
    ) { }

    // POST ===============================================
    async create(userId: Types.ObjectId) {
        const newCart = new this.cartModel({ user: userId });
        await newCart.save();
    }

    async addToCartWithoutVar(addWithoutVariantDto: AddWithoutVariantDto): Promise<void> {
        const { user, product } = addWithoutVariantDto;
        const randomVariant = await this.variantService.randomVarWithQuantityOne(product);
        if (!randomVariant) throw new NotFoundException("The product does not have available variants yet.");
        await this.addToCart({ user, product, ...randomVariant });
    }

    async addToCart(addToCartDto: AddToCartDto): Promise<void> {
        const { user, ...others } = addToCartDto;
        const foundCart = await this.getByUser(user);
        const infoItem = await this.fillInfoItem(others);

        const isItemExist = await this.checkedItemExist(others.product, foundCart.items);

        const isStock = await this.variantService.checkedStockVariant({
            product: others.product, color: others.color, size: others.size, quantity: others.quantity,
        });
        if (!isStock) throw new BadRequestException("Product is out of stock.");

        if (isItemExist) {
            await this.cartModel.findOneAndUpdate(
                {
                    user: user,
                    items: { $elemMatch: { product: others.product } },
                },
                {
                    $set: { "items.$": infoItem },
                },
                { new: true },
            )
        } else {
            await this.cartModel.findByIdAndUpdate(
                foundCart._id,
                {
                    $push: { items: infoItem },
                },
                { new: true },
            )
        }

        await this.calcTotal(foundCart._id);
    }

    // PATCH - PUT ========================================
    async updateVariantInCart(updateVariantCartDto: UpdateVariantCartDto): Promise<void> {
        const { user, product, ...others } = updateVariantCartDto;
        await this.checkedItemInCart(user, product);

        const isStock = await this.variantService.checkedStockVariant({
            product: product, color: others.color, size: others.size, quantity: others.quantity,
        });
        if (!isStock) throw new BadRequestException("Product is out of stock.");

        const result = await this.cartModel.findOneAndUpdate(
            { user: user, "items.product": product },
            {
                $set:
                {
                    "items.$.size": others.size,
                    "items.$.color": others.color,
                    "items.$.hex": VARIANT_HEX[others.color],
                    "items.$.quantity": others.quantity,
                }
            },
            { new: true }
        );

        await this.calcTotal(result._id);
    }

    async checkedItemExist(proId: Types.ObjectId, items: DetailProductInCart[]): Promise<boolean> {
        const itemExist = items.filter(item => item.product.equals(proId));
        if (itemExist.length === 0) return false;
        return true;
    }

    async checkedItemInCart(userId: Types.ObjectId, proId: Types.ObjectId): Promise<void> {
        const isItemExist = await this.cartModel.findOne({
            user: userId,
            "items.product": proId,
        })
        if (!isItemExist) throw new BadRequestException("Product does not exist in the cart.");
    }

    // GET ================================================
    async calcTotal(cartId: Types.ObjectId) {
        const found = await this.cartModel.findById(cartId);
        if (!found) throw new NotFoundException("Cart not found.");
        const total = found.items.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
        await this.cartModel.findByIdAndUpdate(cartId, { $set: { total: total } });
    }

    async getByUser(userId: Types.ObjectId) {
        const found = await this.userModel.findById(userId);
        if (!found) throw new NotFoundException("User not found.");
        return await this.cartModel.findOne({ user: userId }).select("-__v -updatedAt -createdAt");
    }

    // DELETE =============================================
    async removeFromCart(removeFromCartDto: RemoveFromCartDto): Promise<void> {
        await this.checkedItemInCart(removeFromCartDto.user, removeFromCartDto.product);
        const result = await this.cartModel.findOneAndUpdate(
            { user: removeFromCartDto.user },
            {
                $pull: { items: { product: removeFromCartDto.product } }
            },
            { new: true }
        );

        await this.calcTotal(result._id);
    }

    // ============================================= SPECIAL =============================================
    async fillInfoItem(detailVariantItemDto: DetailVariantItemDto): Promise<DetailProductInCart> {
        const { product, ...others } = detailVariantItemDto;
        const foundProduct = await this.productModel.findById(product);
        if (!foundProduct) throw new NotFoundException("Product not found.");

        const itemImage = await this.variantService.getUrlByInfo(product, others.color);

        const itemInCart: DetailProductInCart = {
            product: foundProduct._id,
            image: itemImage,
            name: foundProduct.name,
            color: others.color,
            hex: VARIANT_HEX[others.color],
            size: others.size,
            quantity: others.quantity,
            price: foundProduct.price,
        }

        return itemInCart;
    }

}
