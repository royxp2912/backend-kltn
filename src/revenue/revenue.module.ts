import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { User, UserSchema } from 'src/schemas/User.schema';
import { Order, OrderSchema } from 'src/schemas/Order.schema';
import { ProductsModule } from 'src/products/products.module';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { Variant, VariantSchema } from 'src/schemas/Variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
    ]),
    ProductsModule,
  ],
  controllers: [RevenueController],
  providers: [RevenueService]
})
export class RevenueModule { }
