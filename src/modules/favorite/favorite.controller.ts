import { Types } from 'mongoose';
import { CreateFavoriteDto } from './dto';
import { FavoriteService } from './favorite.service';
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { AuthGuard } from '@nestjs/passport';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';

@Controller('favorites')
@UseInterceptors(TransformResponseInterceptor)
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) { }

    // =============================================== CREATE ===============================================
    @Post()
    async create(@Body() createFavoriteDto: CreateFavoriteDto) {
        await this.favoriteService.create(createFavoriteDto);
        return { message: "Create Favorite succeed." }
    }

    // ================================================ READ ================================================
    @Get("find/by-user/:userId")
    async getByUser(@Param("userId", new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.favoriteService.getByUser(userId);
        return { message: "Get Favorites Of User succeed.", result }
    }

    // =============================================== UPDATE ===============================================
    // =============================================== DELETE ===============================================
    @UseGuards(AuthGuard('jwt-refresh'))
    @Delete("un-favorite/:proId")
    async unFavorite(@Param("proId", new ValidateObjectIdPipe()) proId: Types.ObjectId, @Req() req) {
        await this.favoriteService.unFavorite(req.user.userId, proId);
        return { message: "Un-Favorites succeed." }
    }
}
