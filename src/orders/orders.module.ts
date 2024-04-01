import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsModule } from 'src/carts/carts.module';
import { OrdersController } from './orders.controller';
import { User, UserSchema } from 'src/schemas/User.schema';
import { Order, OrderSchema } from 'src/schemas/Order.schema';
import { VariantsModule } from 'src/variants/variants.module';
import { ProductsModule } from 'src/products/products.module';
import { OrderAddressModule } from 'src/orderaddress/orderaddress.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { DeliveryAddressModule } from 'src/deliveryaddress/deliveryaddress.module';
import { CouponsModule } from 'src/coupons/coupons.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    CouponsModule,
    CartsModule,
    VariantsModule,
    ProductsModule,
    OrderAddressModule,
    NotificationsModule,
    DeliveryAddressModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule { }
