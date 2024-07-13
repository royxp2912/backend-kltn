import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { GoodReceiptService } from './good-receipt.service';
import { GoodReceiptController } from './good-receipt.controller';
import { Supplier, SupplierSchema } from 'src/schemas/supplier.schema';
import { GoodReceipt, GoodReceiptSchema } from 'src/schemas/goodReceipt.schema';
import { DetailGoodReceipt, DetailGoodReceiptSchema } from 'src/schemas/detailGoodReceipt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: GoodReceipt.name, schema: GoodReceiptSchema },
      { name: DetailGoodReceipt.name, schema: DetailGoodReceiptSchema },
    ])
  ],
  controllers: [GoodReceiptController],
  providers: [GoodReceiptService]
})
export class GoodReceiptModule { }
