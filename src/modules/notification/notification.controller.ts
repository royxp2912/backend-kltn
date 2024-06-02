import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { Types } from 'mongoose';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { TransformResponseInterceptor } from 'src/utils/interceptors/response.interceptor';
import { AcptPushDto, CreateNotiDto, PaginationUserDto, SendPushDto } from './dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseInterceptors(TransformResponseInterceptor)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get("find/by-user")
    async getNotificationOfUser(@Query() paginationUserDto: PaginationUserDto) {
        const result = await this.notificationService.getNotificationOfUser(paginationUserDto);
        return { message: "Get notification of user succeed.", result: result.data, pages: result.pages }
    }

    @Delete()
    async deleteAll() {
        await this.notificationService.deleteAll();
        return { message: "Delete all notification succeed." }
    }

    // special === DON'T USE
    @Post("send")
    async sendNotification(@Body() sendPushDto: SendPushDto) {
        const result = await this.notificationService.sendPush(sendPushDto);
        return { message: "Send notification succeed." }
    }

    @Post("accept-push")
    async acceptPush(@Body() acptPushDto: AcptPushDto) {
        await this.notificationService.acptPushNotification(acptPushDto);
        return { message: "Accept push notification succeed." }
    }

    @Patch("disable-push/:userId")
    async disaplePush(@Param("userId", new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.notificationService.disablePushNotification(userId);
        return { message: "Disable push notification succeed." }
    }

    // special === DON'T USE
    @Post("test")
    async tesst(@Body() createNotiDto: CreateNotiDto) {
        await this.notificationService.createNotification(createNotiDto);
        return { message: "create notification succeed." }
    }
}
