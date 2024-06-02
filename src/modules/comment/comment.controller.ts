import { Types } from 'mongoose';
import { CommentService } from './comment.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateCommentDto, PaginationProductDto, UpdateCommentDto } from './dto';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';

@Controller('comments')
@UseInterceptors(TransformResponseInterceptor)
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // CREATE ===============================================
    @Post()
    @UseInterceptors(FilesInterceptor("images"))
    async create(
        @UploadedFiles() images: Express.Multer.File[],
        @Body() createCommentDto: CreateCommentDto,
    ) {
        if (images) {
            const resultUpload = await this.cloudinaryService.uploadMultipleFile(images);
            createCommentDto.images = resultUpload;
        }
        await this.commentService.create(createCommentDto);
        return { message: "Create Comment succeed." }
    }

    // READ =================================================
    @Get("find/by-product")
    async getByProduct(@Query() paginationProductDto: PaginationProductDto) {
        const result = await this.commentService.getByProduct(paginationProductDto);
        return { message: "Create Comment succeed.", result: result.data, pages: result.pages, total: result.total }
    }

    // UPDATE ===============================================
    @Patch()
    async update(@Body() updateCommentDto: UpdateCommentDto) {
        await this.commentService.update(updateCommentDto);
        return { message: "Update Comment succeed." }
    }

    @Patch("update-like/increase/:cmtId")
    async increaseLike(@Param('cmtId', new ValidateObjectIdPipe()) cmtId: Types.ObjectId) {
        await this.commentService.increaseLike(cmtId);
        return { message: "Increase Like Comment succeed." }
    }

    @Patch("update-like/reduce/:cmtId")
    async reduceLike(@Param('cmtId', new ValidateObjectIdPipe()) cmtId: Types.ObjectId) {
        await this.commentService.reduceLike(cmtId);
        return { message: "Reduce Like Comment succeed." }
    }

    // DELETE ===============================================
    @Delete(":cmtId")
    async deleteById(@Param('cmtId', new ValidateObjectIdPipe()) cmtId: Types.ObjectId) {
        await this.commentService.deleteById(cmtId);
        return { message: "Delete Comment succeed." }
    }

    @Delete("by-product/:proId")
    async deleteByProduct(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        await this.commentService.deleteByProduct(proId);
        return { message: "Delete Comment Of Product succeed." }
    }

    @Delete("by-user/:userId")
    async deleteByUser(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.commentService.deleteByUser(userId);
        return { message: "Delete Comment Of User succeed." }
    }

    @Delete()
    async deleteAll() {
        await this.commentService.deleteAll();
        return { message: "Delete All Comment succeed." }
    }
}
