import { Types } from 'mongoose';
import { CreateFavoriteDto } from './dto';
import { FavoritesService } from './favorites.service';
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    // =============================================== CREATE ===============================================
    @Post()
    async create(@Body() createFavoriteDto: CreateFavoriteDto) {
        await this.favoritesService.create(createFavoriteDto);
        return { message: "Create Favorite succeed." }
    }

    // ================================================ READ ================================================
    @Get("find/by-user/:userId")
    async getByUser(@Param("userId", new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.favoritesService.getByUser(userId);
        return { message: "Get Favorites Of User succeed.", result }
    }

    // =============================================== UPDATE ===============================================
    // =============================================== DELETE ===============================================
    @UseGuards(AuthGuard('jwt-refresh'))
    @Delete("un-favorite/:proId")
    async unFavorite(@Param("proId", new ValidateObjectIdPipe()) proId: Types.ObjectId, @Req() req) {
        await this.favoritesService.unFavorite(req.user.userId, proId);
        return { message: "Un-Favorites succeed." }
    }
}
