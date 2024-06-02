import { SchemaTypes, Types } from "mongoose";
import { NOTI_TOKEN_STATUS } from "src/constants/schema.enum";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: 'notificatio_tokens', timestamps: true })
export class NotificationToken {

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: String, required: true })
    noti_token: string;


    @Prop({ type: String, enum: NOTI_TOKEN_STATUS, default: NOTI_TOKEN_STATUS.ACTIVE })
    status: NOTI_TOKEN_STATUS;
}

export const NotificationTokenSchema = SchemaFactory.createForClass(NotificationToken);