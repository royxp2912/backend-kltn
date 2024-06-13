import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { ProductModule } from '../product/product.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Variant, VariantSchema } from 'src/schemas/vriant.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { DetailVariant, DetailVariantSchema } from 'src/schemas/detailVariant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Category.name, schema: CategorySchema },
      { name: DetailVariant.name, schema: DetailVariantSchema },
    ]),
    ProductModule,
  ],
  controllers: [RevenueController],
  providers: [RevenueService]
})
export class RevenueModule { }
