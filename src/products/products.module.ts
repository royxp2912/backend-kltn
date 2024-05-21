import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { OrdersModule } from 'src/orders/orders.module';
import { ProductsController } from './products.controller';
import { VariantsModule } from 'src/variants/variants.module';
import { CommentsModule } from 'src/comments/comments.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { Comment, CommentSchema } from 'src/schemas/Comment.schema';
import { Category, CategorySchema } from 'src/schemas/Category.schema';

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
    forwardRef(() => OrdersModule),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule { }
