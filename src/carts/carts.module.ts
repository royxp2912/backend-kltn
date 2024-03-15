import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsController } from './carts.controller';
import { Cart, CartSchema } from 'src/schemas/Cart.schema';
import { User, UserSchema } from 'src/schemas/User.schema';
import { VariantsModule } from 'src/variants/variants.module';
import { Product, ProductSchema } from 'src/schemas/Product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    VariantsModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule { }
