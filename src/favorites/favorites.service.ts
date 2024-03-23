import { Model, Types } from 'mongoose';
import { CreateFavoriteDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Product } from 'src/schemas/Product.schema';
import { Favorite } from 'src/schemas/Favorite.schema';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
    ) { }

    // =============================================== CREATE ===============================================
    async create(createFavoriteDto: CreateFavoriteDto) {
        const { user, product } = createFavoriteDto;
        await this.checkUserExist(user);
        await this.checkProductExist(product);
        await this.checkFavoriteExist(user, product);
        const newFavorite = new this.favoriteModel(createFavoriteDto);
        await newFavorite.save();
    }

    // ================================================ READ ================================================
    async getByUser(userId: Types.ObjectId) {
        await this.checkUserExist(userId);
        const found = await this.favoriteModel.find({ user: userId });
        const result = found.map(item => item.product);
        return result;
    }

    async checkProductIsFavorite(userId: Types.ObjectId, proId: Types.ObjectId) {
        const found = await this.favoriteModel.findOne({ user: userId, product: proId });
        if (!found) return false;
        return true;
    }

    // =============================================== UPDATE ===============================================
    // =============================================== DELETE ===============================================
    async unFavorite(userId: Types.ObjectId, proId: Types.ObjectId) {
        await this.checkProductExist(proId);
        const found = await this.favoriteModel.findOneAndDelete({ user: userId, product: proId });
        if (!found) throw new NotFoundException("Product is not in the user's favorites list.");
    }

    // =============================================== SPECIAL ==============================================
    async checkUserExist(userId: Types.ObjectId) {
        const found = await this.userModel.findById(userId);
        if (!found) throw new NotFoundException("User not found.");
    }

    async checkProductExist(proId: Types.ObjectId) {
        const found = await this.productModel.findById(proId);
        if (!found) throw new NotFoundException("Product not found.");
    }

    async checkFavoriteExist(userId: Types.ObjectId, proId: Types.ObjectId) {
        const found = await this.favoriteModel.findOne({ user: userId, product: proId });
        if (found) throw new NotFoundException("Product is already on the user's favorite list.");
    }
}
