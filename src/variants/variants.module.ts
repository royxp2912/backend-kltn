import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { Variant, VariantSchema } from 'src/schemas/Variant.schema';
import { DetailVariant, DetailVariantSchema } from 'src/schemas/DetailVariant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Variant.name, schema: VariantSchema },
      { name: Product.name, schema: ProductSchema },
      { name: DetailVariant.name, schema: DetailVariantSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [VariantsService],
  controllers: [VariantsController],
  exports: [VariantsService],
})
export class VariantsModule { }
