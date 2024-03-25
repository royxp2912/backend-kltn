import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { UsersModule } from 'src/users/users.module';
import { CouponsModule } from 'src/coupons/coupons.module';
import { CommentsController } from './comments.controller';
import { Order, OrderSchema } from 'src/schemas/Order.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Comment, CommentSchema } from 'src/schemas/Comment.schema';
import { Product, ProductSchema } from 'src/schemas/Product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    UsersModule,
    CouponsModule,
    CloudinaryModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule { }
