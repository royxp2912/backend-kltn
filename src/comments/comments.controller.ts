import { Types } from 'mongoose';
import { CommentsService } from './comments.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateCommentDto, PaginationProductDto, UpdateCommentDto } from './dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
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
        await this.commentsService.create(createCommentDto);
        return { message: "Create Comment succeed." }
    }

    // READ =================================================
    @Get("find/by-product")
    async getByProduct(@Query() paginationProductDto: PaginationProductDto) {
        const result = await this.commentsService.getByProduct(paginationProductDto);
        return { message: "Create Comment succeed.", result: result.data, pages: result.pages }
    }

    // UPDATE ===============================================
    @Patch()
    async update(@Body() updateCommentDto: UpdateCommentDto) {
        await this.commentsService.update(updateCommentDto);
        return { message: "Update Comment succeed." }
    }

    @Patch("update-like/increase/:cmtId")
    async increaseLike(@Param('cmtId', new ValidateObjectIdPipe()) cmtId: Types.ObjectId) {
        await this.commentsService.increaseLike(cmtId);
        return { message: "Increase Like Comment succeed." }
    }

    @Patch("update-like/reduce/:cmtId")
    async reduceLike(@Param('cmtId', new ValidateObjectIdPipe()) cmtId: Types.ObjectId) {
        await this.commentsService.reduceLike(cmtId);
        return { message: "Reduce Like Comment succeed." }
    }

    // DELETE ===============================================
    @Delete(":cmtId")
    async deleteById(@Param('cmtId', new ValidateObjectIdPipe()) cmtId: Types.ObjectId) {
        await this.commentsService.deleteById(cmtId);
        return { message: "Delete Comment succeed." }
    }

    @Delete("by-product/:proId")
    async deleteByProduct(@Param('proId', new ValidateObjectIdPipe()) proId: Types.ObjectId) {
        await this.commentsService.deleteByProduct(proId);
        return { message: "Delete Comment Of Product succeed." }
    }

    @Delete("by-user/:userId")
    async deleteByUser(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.commentsService.deleteByUser(userId);
        return { message: "Delete Comment Of User succeed." }
    }

    @Delete()
    async deleteAll() {
        await this.commentsService.deleteAll();
        return { message: "Delete All Comment succeed." }
    }
}
