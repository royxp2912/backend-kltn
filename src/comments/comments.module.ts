import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { CommentsController } from './comments.controller';
import { ProductsModule } from 'src/products/products.module';
import { Order, OrderSchema } from 'src/schemas/Order.schema';
import { Comment, CommentSchema } from 'src/schemas/Comment.schema';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    UsersModule,
    CloudinaryModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule { }
