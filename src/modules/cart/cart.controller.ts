import { Types } from 'mongoose';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/AddToCart.dto';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { AddWithoutVariantDto, RemoveFromCartDto, UpdateVariantCartDto } from './dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import { AuthGuard } from '@nestjs/passport';

@Controller('carts')
@UseInterceptors(TransformResponseInterceptor)
export class CartController {
    constructor(
        private readonly cartService: CartService,) { }

    // POST ===============================================
    @Post("addToCart")
    async addToCart(@Body() addToCartDto: AddToCartDto) {
        await this.cartService.addToCart(addToCartDto);

        return { message: "Add Product To Cart Of User Succeed" };
    }

    @Post("addToCart/withoutVariant")
    async addToCartWithoutVariant(@Body() addWithoutVariantDto: AddWithoutVariantDto) {
        await this.cartService.addToCartWithoutVar(addWithoutVariantDto);

        return { message: "Add Product To Cart Of User Succeed" };
    }

    // PATCH - PUT ========================================
    @Patch("updateVariant")
    async updateVariantInCart(@Body() updateVariantCartDto: UpdateVariantCartDto) {
        await this.cartService.updateVariantInCart(updateVariantCartDto);

        return { message: "Update Variant Product In Cart Of User Succeed" };
    }

    // GET ================================================
    // @UseGuards(AuthGuard('jwt'))
    @Get("user/:userId")
    async getById(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.cartService.getByUser(userId);

        return { message: "Get Cart Of User Succeed", result, total: result.items.length };
    }
    // DELETE =============================================
    @Delete("removeFromCart")
    async removeFromCart(@Query() removeFromCartDto: RemoveFromCartDto) {
        await this.cartService.removeFromCart(removeFromCartDto);

        return { message: "Remove Product To Cart Of User Succeed" };
    }

}
