import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { User, UserSchema } from 'src/schemas/User.schema';
import { Order, OrderSchema } from 'src/schemas/Order.schema';
import { Product, ProductSchema } from 'src/schemas/Product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ])
  ],
  controllers: [RevenueController],
  providers: [RevenueService]
})
export class RevenueModule { }
