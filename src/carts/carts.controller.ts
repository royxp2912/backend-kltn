import { Types } from 'mongoose';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/AddToCart.dto';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { AddWithoutVariantDto, RemoveFromCartDto, UpdateVariantCartDto } from './dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

@Controller('carts')
export class CartsController {
    constructor(
        private readonly cartsService: CartsService,) { }

    // POST ===============================================
    @Post("addToCart")
    async addToCart(@Body() addToCartDto: AddToCartDto) {
        await this.cartsService.addToCart(addToCartDto);

        return { message: "Add Product To Cart Of User Succeed" };
    }

    @Post("addToCart/withoutVariant")
    async addToCartWithoutVariant(@Body() addWithoutVariantDto: AddWithoutVariantDto) {
        await this.cartsService.addToCartWithoutVar(addWithoutVariantDto);

        return { message: "Add Product To Cart Of User Succeed" };
    }

    // PATCH - PUT ========================================
    @Patch("updateVariant")
    async updateVariantInCart(@Body() updateVariantCartDto: UpdateVariantCartDto) {
        await this.cartsService.updateVariantInCart(updateVariantCartDto);

        return { message: "Update Variant Product In Cart Of User Succeed" };
    }

    // GET ================================================
    @Get("user/:userId")
    async getById(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.cartsService.getByUser(userId);

        return { message: "Get Cart Of User Succeed", result, total: result.items.length };
    }
    // DELETE =============================================
    @Delete("removeFromCart")
    async removeFromCart(@Query() removeFromCartDto: RemoveFromCartDto) {
        await this.cartsService.removeFromCart(removeFromCartDto);

        return { message: "Remove Product To Cart Of User Succeed" };
    }

}
