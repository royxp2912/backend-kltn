import { Types } from "mongoose";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { ValidateObjectIdPipe } from "src/utils/customPipe/validateObjectId.pipe";
import { TransformResponseInterceptor } from "src/utils/interceptors/response.interceptor";
import { FindByKeywordDto, ForgotPasswordDto, GetAllDto, GetByEmailDto, GetByStatusDto, UpdateEmailDto, UpdatePasswordDto, UpdateUserDto } from "./dto";
import {
    Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Query, UploadedFile, UseInterceptors
} from "@nestjs/common";

@Controller('users')
@UseInterceptors(TransformResponseInterceptor)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // PATCH - PUT ========================================
    @Patch("update-email")
    async updateEmail(@Body() updateEmailDto: UpdateEmailDto) {
        await this.userService.updateEmail(updateEmailDto);
        return { message: "Update Email Succeed" }
    }

    @Patch("update-password")
    async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
        await this.userService.updatePassword(updatePasswordDto);
        return { message: "Update Password Succeed" }
    }

    @Patch("forgot-password")
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        await this.userService.forgotPassword(forgotPasswordDto);
        return { message: "Password recovery Succeed" }
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

        const found = await this.userService.getById(userId);
        const imgUrl = await (await this.cloudinaryService.uploadFile(file)).url;

        await this.userService.updateAvatar(userId, imgUrl);
        if (found.avatar !== "https://res.cloudinary.com/dtfei3453/image/upload/v1697015386/shoeshop/avatar_default_kf1ko4.png") {
            await this.cloudinaryService.deleteImageOnCloud(found.avatar);
        }

        return { message: "Update Avatar User Succeed" };
    }

    @Patch()
    async update(@Body() updateUserDto: UpdateUserDto) {
        await this.userService.update(updateUserDto);
        return { message: "Update User By Id Succeed" }
    }

    @Patch("lock/:userId")
    async lock(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.userService.lock(userId);
        return { message: "Lock User Succeed" }
    }

    @Patch("unlock/:userId")
    async unLock(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.userService.unLock(userId);
        return { message: "UnLock User Succeed" }
    }

    // GET ========================================
    @Get("find/role-admin")
    async getListAdmin() {
        const result = await this.userService.getListAdmin();
        return { message: "Get List Admin succeed", result }
    }

    @Get("find/by-email")
    async getByEmail(@Query() getByEmailDto: GetByEmailDto) {
        const result = await this.userService.getByEmail(getByEmailDto);
        return { message: "Get User Succeed", result }
    }

    @Get(":userId")
    async getById(@Param('userId', new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        const result = await this.userService.getById(userId);
        return { message: "Get User Succeed", result }
    }

    @Get("find/by-keyword")
    async getByKeyword(@Query() findByKeywordDto: FindByKeywordDto) {
        const result = await this.userService.getByKeyword(findByKeywordDto);
        return {
            message: "Find Users By Keyword Succeed",
            result: result.data,
            pages: result.pages
        }
    }

    @Get("find/by-status")
    async getByStatus(@Query() getByStatusDto: GetByStatusDto) {
        const result = await this.userService.getByStatus(getByStatusDto);
        return {
            message: "Get Users Succeed",
            result: result.data,
            pages: result.pages
        }
    }

    @Get("")
    async getAll(@Query() getAllDto: GetAllDto) {
        const result = await this.userService.getAll(getAllDto);
        return {
            message: "Get All User Succeed",
            result: result.data,
            pages: result.pages
        }
    }

    // DELETE ========================================
    @Delete("")
    async deleteAll() {
        await this.userService.deleteAll();
        return { message: "Delete All User Succeed" }
    }
}