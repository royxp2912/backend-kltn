import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from './comment.service';
import { UserModule } from '../user/user.module';
import { CouponModule } from '../coupon/coupon.module';
import { CommentController } from './comment.controller';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Comment, CommentSchema } from 'src/schemas/comment.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    UserModule,
    CouponModule,
    CloudinaryModule,
    NotificationModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule { }
