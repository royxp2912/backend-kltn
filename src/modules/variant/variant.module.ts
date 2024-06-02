import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Variant, VariantSchema } from 'src/schemas/vriant.schema';
import { DetailVariant, DetailVariantSchema } from 'src/schemas/detailVariant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Variant.name, schema: VariantSchema },
      { name: Product.name, schema: ProductSchema },
      { name: DetailVariant.name, schema: DetailVariantSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [VariantService],
  controllers: [VariantController],
  exports: [VariantService],
})
export class VariantModule { }
