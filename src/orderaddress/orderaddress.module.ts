import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderDelivery, OrderDeliverySchema } from 'src/schemas/OrderAddress';
import { OrderAddressService } from './orderaddress.service';

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
