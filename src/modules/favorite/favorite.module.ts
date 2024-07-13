import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteService } from './favorite.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { FavoriteController } from './favorite.controller';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Favorite, FavoriteSchema } from 'src/schemas/favorite.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule { }
