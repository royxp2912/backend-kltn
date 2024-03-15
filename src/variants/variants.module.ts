import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { Variant, VariantSchema } from 'src/schemas/Variant.schema';
import { ImageVariant, ImageVariantSchema } from 'src/schemas/ImageVariant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Variant.name, schema: VariantSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ImageVariant.name, schema: ImageVariantSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [VariantsService],
  controllers: [VariantsController],
  exports: [VariantsService],
})
export class VariantsModule { }
