import { Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilController } from './util.controller';
import { UtilWard, UtilWardSchema } from 'src/schemas/utilWard.schema';
import { UtilBank, UtilBankSchema } from 'src/schemas/utilBank.schema';
import { UtilProvince, UtilProvinceSchema } from 'src/schemas/utilProvince.schema';
import { UtilDistrict, UtilDistrictSchema } from 'src/schemas/utilDistrict.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UtilWard.name, schema: UtilWardSchema },
      { name: UtilBank.name, schema: UtilBankSchema },
      { name: UtilDistrict.name, schema: UtilDistrictSchema },
      { name: UtilProvince.name, schema: UtilProvinceSchema },
    ])
  ],
  controllers: [UtilController],
  providers: [UtilService],
})
export class UtilModule { }
