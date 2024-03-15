import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryAddressService } from './deliveryAddress.service';
import { DeliveryAddressController } from './deliveryAddress.controller';
import { DeliveryAddress, DeliveryAddressSchema } from 'src/schemas/DeliveryAddress.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DeliveryAddress.name, schema: DeliveryAddressSchema },
        ]),
        UsersModule,
    ],
    providers: [DeliveryAddressService],
    controllers: [DeliveryAddressController],
    exports: [DeliveryAddressService],
})
export class DeliveryAddressModule { }
