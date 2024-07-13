import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderDelivery, OrderDeliverySchema } from 'src/schemas/orderAddress';
import { OrderAddressService } from './order-address.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderDelivery.name, schema: OrderDeliverySchema },
    ]),
  ],
  providers: [OrderAddressService],
  exports: [OrderAddressService]
})
export class OrderAddressModule { }
