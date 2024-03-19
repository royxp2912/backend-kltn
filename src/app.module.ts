import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthsModule } from './auths/auths.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { DeliveryAddressModule } from './deliveryaddress/deliveryaddress.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { OrderAddressModule } from './orderaddress/orderaddress.module';
import { CommentsModule } from './comments/comments.module';

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
    ProductsModule,
    VariantsModule,
    CommentsModule,
    CategoriesModule,
    OrderAddressModule,
    DeliveryAddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
