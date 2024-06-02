import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { DeliveryAddressService } from './delivery-address.service';
import { DeliveryAddressController } from './delivery-address.controller';
import { DeliveryAddress, DeliveryAddressSchema } from 'src/schemas/deliveryAddress.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DeliveryAddress.name, schema: DeliveryAddressSchema },
        ]),
        UserModule,
    ],
    providers: [DeliveryAddressService],
    controllers: [DeliveryAddressController],
    exports: [DeliveryAddressService],
})
export class DeliveryAddressModule { }
