import { HttpModule } from '@nestjs/axios';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartModule } from '../cart/cart.module';
import { forwardRef, Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { CouponModule } from '../coupon/coupon.module';
import { VariantModule } from '../variant/variant.module';
import { ProductModule } from '../product/product.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { NotificationModule } from '../notification/notification.module';
import { OrderAddressModule } from '../order-address/order-address.module';
import { DeliveryAddressModule } from '../delivery-address/delivery-address.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    HttpModule,
    CartModule,
    CouponModule,
    VariantModule,
    forwardRef(() => ProductModule),
    OrderAddressModule,
    NotificationModule,
    DeliveryAddressModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule { }
