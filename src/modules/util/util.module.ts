import { Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilController } from './util.controller';
import { UtilWard, UtilWardSchema } from 'src/schemas/utilWard.schema';
import { UtilProvince, UtilProvinceSchema } from 'src/schemas/utilProvince.schema';
import { UtilDistrict, UtilDistrictSchema } from 'src/schemas/utilDistrict.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UtilWard.name, schema: UtilWardSchema },
      { name: UtilDistrict.name, schema: UtilDistrictSchema },
      { name: UtilProvince.name, schema: UtilProvinceSchema },
    ])
  ],
  controllers: [UtilController],
  providers: [UtilService],
})
export class UtilModule { }
