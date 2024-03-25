import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthsModule } from './auths/auths.module';
import { UsersModule } from './users/users.module';
import { CartsModule } from './carts/carts.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { OrdersModule } from './orders/orders.module';
import { MulterModule } from '@nestjs/platform-express';
import { CouponsModule } from './coupons/coupons.module';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { CommentsModule } from './comments/comments.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FavoritesModule } from './favorites/favorites.module';
import { CategoriesModule } from './categories/categories.module';
import { OrderAddressModule } from './orderaddress/orderaddress.module';
import { DeliveryAddressModule } from './deliveryaddress/deliveryaddress.module';

@Module({
  imports: [
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
    AuthsModule,
    UsersModule,
    CartsModule,
    OrdersModule,
    CouponsModule,
    ProductsModule,
    VariantsModule,
    CommentsModule,
    FavoritesModule,
    CategoriesModule,
    OrderAddressModule,
    DeliveryAddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
