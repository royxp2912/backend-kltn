import * as path from 'path';
import * as firebase from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from 'src/schemas/Notification.schema';
import { Model, Types } from 'mongoose';
import { NotificationToken } from 'src/schemas/NotificationToken.schema';
import { NOTI_TOKEN_STATUS, NOTI_TYPE } from 'src/constants/schema.enum';
import { AcptPushDto, CreateNotiDto, PaginationUserDto, SendPushDto } from './dto';
import { PaginationUserRes } from './types';
import { renderOrderCancelDueToAdmin, renderOrderCancelDueToExpiration, renderOrderCancelDueToUser, renderOrderSucceed } from './renderMessageNoti';

firebase.initializeApp({
    credential: firebase.credential.cert(
        path.join(__dirname, '..', '..', 'push-notifications-key.json'),
    ),
});

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        @InjectModel(NotificationToken.name) private readonly notificationTokenModel: Model<NotificationToken>,
    ) { }

    async createNotification(createNotiDto: CreateNotiDto) {
        const { type } = createNotiDto;
        switch (type) {
            case NOTI_TYPE.ORDER_SUCCEED:
                createNotiDto.title = "ORDER SUCCEED"
                createNotiDto.body = renderOrderSucceed(createNotiDto.relation);
                break;

            case NOTI_TYPE.ORDER_CANCELLED_BY_USER:
                createNotiDto.title = "ORDER CANCELLED"
                createNotiDto.body = renderOrderCancelDueToUser(createNotiDto.relation);
                break;

            case NOTI_TYPE.ORDER_CANCELLED_BY_ADMIN:
                createNotiDto.title = "ORDER CANCELLED"
                createNotiDto.body = renderOrderCancelDueToAdmin(createNotiDto.relation);
                break;

            case NOTI_TYPE.ORDER_CANCELLED_DUE_TO_EXPIRATION:
                createNotiDto.title = "ORDER CANCELLED"
                createNotiDto.body = renderOrderCancelDueToExpiration(createNotiDto.relation);
                break;

            default: console.log("default");

        }
        const newNoti = new this.notificationModel(createNotiDto);
        await newNoti.save();
    }

    async getNotificationOfUser(paginationUserDto: PaginationUserDto): Promise<PaginationUserRes> {
        const userId = paginationUserDto.user;
        const pageSize = paginationUserDto.pageSize || 5;
        const pageNumber = paginationUserDto.pageNumber || 1;
        const found = await this.notificationModel.find({ user: userId })
            .sort({ createAt: -1 })
            .select("-__v -user -updatedAt");

        const pages: number = Math.ceil(found.length / pageSize);
        const final = found.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const result: PaginationUserRes = { pages: pages, data: final }
        return result;
    }

    //  --- PLUS
    async sendPush(sendPushDto: SendPushDto): Promise<void> {
        const { user, title, body } = sendPushDto;
        try {
            const token = await this.notificationTokenModel.findOne({ user, status: NOTI_TOKEN_STATUS.ACTIVE });
            const newNotification = new this.notificationModel(sendPushDto);
            await newNotification.save();

            if (token) {
                await firebase
                    .messaging()
                    .send({
                        notification: { title, body },
                        token: token.noti_token,
                        android: { priority: 'high' },
                    })
                    .catch((error: any) => {
                        console.error(error);
                    });
            }
        } catch (error) {
            return error;
        }
    }

    async acptPushNotification(acptPushDto: AcptPushDto): Promise<void> {
        const { user, token } = acptPushDto;
        await this.notificationTokenModel.updateMany(
            { user },
            { $set: { status: NOTI_TOKEN_STATUS.INACTIVE } }
        )

        const newToken = new this.notificationTokenModel({ user, noti_token: token });
        await newToken.save();
    }

    async disablePushNotification(userId: Types.ObjectId): Promise<void> {
        await this.notificationTokenModel.updateMany(
            { user: userId },
            { $set: { status: NOTI_TOKEN_STATUS.INACTIVE } }
        )
    }

    // --- DELETE
    async deleteAll() {
        await this.notificationModel.deleteMany({});
    }
}
