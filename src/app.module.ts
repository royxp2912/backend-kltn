import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CouponModule } from './modules/coupon/coupon.module';
import { VariantModule } from './modules/variant/variant.module';
import { CommentModule } from './modules/comment/comment.module';
import { RevenueModule } from './modules/revenue/revenue.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { GoodReceiptModule } from './modules/good-receipt/good-receipt.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderAddressModule } from './modules/order-address/order-address.module';
import { DeliveryAddressModule } from './modules/delivery-address/delivery-address.module';
import { UtilModule } from './modules/util/util.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_ONL')
      })
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: false,
          auth: {
            user: configService.get<string>('GMAIL_USER'),
            pass: configService.get<string>('GMAIL_PASS'),
          }
        }
      })
    }),
    MulterModule.register({
      dest: './kltn',
    }),
    UtilModule,
    AuthModule,
    UserModule,
    CartModule,
    OrderModule,
    CouponModule,
    RevenueModule,
    ProductModule,
    VariantModule,
    CommentModule,
    FavoriteModule,
    CategoryModule,
    OrderAddressModule,
    NotificationModule,
    GoodReceiptModule,
    DeliveryAddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
