import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { OrderModule } from '../order/order.module';
import { ProductController } from './product.controller';
import { VariantModule } from '../variant/variant.module';
import { CommentModule } from '../comment/comment.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { CategoryModule } from '../category/category.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Comment, CommentSchema } from 'src/schemas/comment.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    VariantModule,
    CommentModule,
    FavoriteModule,
    CategoryModule,
    CloudinaryModule,
    forwardRef(() => OrderModule),
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule { }
