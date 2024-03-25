import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesService } from './favorites.service';
import { User, UserSchema } from 'src/schemas/User.schema';
import { FavoritesController } from './favorites.controller';
import { Product, ProductSchema } from 'src/schemas/Product.schema';
import { Favorite, FavoriteSchema } from 'src/schemas/Favorite.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule { }
