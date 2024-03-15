import { Body, ConflictException, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Patch, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";
import { USER_STATUS } from "src/constants/schema.enum";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { ValidateObjectIdPipe } from "src/utils/customPipe/validateObjectId.pipe";
import { FindByKeywordDto, GetAllDto, GetByEmailDto, GetByStatusDto, UpdateEmailDto, UpdatePasswordDto, UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // PATCH - PUT ========================================
    @Patch("update-email")
    async updateEmail(@Body() updateEmailDto: UpdateEmailDto) {
        await this.usersService.updateEmail(updateEmailDto);
        return { message: "Update Email Succeed" }
    }

    @Patch("update-password")
    async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
        await this.usersService.updatePassword(updatePasswordDto);
        return { message: "Update Password Succeed" }
    }

    @Patch("upload-avatar")
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                    new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
                ]
            }),
        ) file: Express.Multer.File,
        @Body('user', new ValidateObjectIdPipe()) userId: Types.ObjectId) {

        const found = await this.usersService.getById(userId);
        const imgUrl = await (await this.cloudinaryService.uploadFile(file)).url;

        await this.usersService.updateAvatar(userId, imgUrl);
        if (found.avatar !== "https://res.cloudinary.com/dtfei3453/image/upload/v1697015386/shoeshop/avatar_default_kf1ko4.png") {
            await this.cloudinaryService.deleteImageOnCloud(found.avatar);
        }

        return { message: "Update Avatar User Succeed" };
    }

    @Patch()
    async update(@Body() updateUserDto: UpdateUserDto) {
        await this.usersService.update(updateUserDto);
        return { message: "Update User By Id Succeed" }
    }

    @Patch("lock/:userId")
    async lock(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.usersService.lock(userId);
        return { message: "Lock User Succeed" }
    }

    @Patch("unlock/:userId")
    async unLock(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.usersService.unLock(userId);
        return { message: "UnLock User Succeed" }
    }

    // GET ========================================
    @Get("find/by-email")
    async getByEmail(@Query() getByEmailDto: GetByEmailDto) {
        const result = await this.usersService.getByEmail(getByEmailDto);
        return { message: "Get User Succeed", result }
    }

    @Get(":userId")
    async getById(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.usersService.getById(userId);
        return { message: "Get User Succeed", result }
    }

    @Get("find/by-keyword")
    async getByKeyword(@Query() findByKeywordDto: FindByKeywordDto) {
        const result = await this.usersService.getByKeyword(findByKeywordDto);
        return {
            message: "Find Users By Keyword Succeed",
            result: result.data,
            pages: result.pages
        }
    }

    @Get("find/by-status")
    async getByStatus(@Query() getByStatusDto: GetByStatusDto) {
        const result = await this.usersService.getByStatus(getByStatusDto);
        return {
            message: "Get Users Succeed",
            result: result.data,
            pages: result.pages
        }
    }

    @Get("")
    async getAll(@Query() getAllDto: GetAllDto) {
        const result = await this.usersService.getAll(getAllDto);
        return {
            message: "Get All User Succeed",
            result: result.data,
            pages: result.pages
        }
    }

    // DELETE ========================================
    @Delete("")
    async deleteAll() {
        await this.usersService.deleteAll();
        return { message: "Delete All User Succeed" }
    }
}