import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VariantsModule } from 'src/variants/variants.module';
import { Comment, CommentSchema } from 'src/schemas/Comment.schema';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { Category, CategorySchema } from 'src/schemas/Category.schema';
import { CommentsModule } from 'src/comments/comments.module';
import { FavoritesModule } from 'src/favorites/favorites.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    VariantsModule,
    CommentsModule,
    FavoritesModule,
    CloudinaryModule,
    CategoriesModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule { }
