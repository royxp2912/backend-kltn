import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { ValidateObjectIdPipe } from 'src/utils/customPipe/validateObjectId.pipe';
import { AcptPushDto, PaginationUserDto, SendPushDto } from './dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post("send")
    async sendNotification(@Body() sendPushDto: SendPushDto) {
        const result = await this.notificationsService.sendPush(sendPushDto);
        return { message: "Send notification succeed." }
    }

    @Post("accept-push")
    async acceptPush(@Body() acptPushDto: AcptPushDto) {
        await this.notificationsService.acptPushNotification(acptPushDto);
        return { message: "Accept push notification succeed." }
    }

    @Patch("disable-push/:userId")
    async disaplePush(@Param("userId", new ValidateObjectIdPipe()) userId: Types.ObjectId) {
        await this.notificationsService.disablePushNotification(userId);
        return { message: "Disable push notification succeed." }
    }

    @Get("find/by-user")
    async getNotificationOfUser(@Query() paginationUserDto: PaginationUserDto) {
        const result = await this.notificationsService.getNotificationOfUser(paginationUserDto);
        return { message: "Get notification of user succeed.", result: result.data, pages: result.pages }
    }
}
