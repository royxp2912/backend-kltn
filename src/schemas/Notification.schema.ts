import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { NOTI_TYPE } from "src/constants/schema.enum";

@Schema({ timestamps: true })
export class Notification {

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    body: string;

    @Prop({ type: String, enum: NOTI_TYPE, default: NOTI_TYPE.OTHERS })
    type: NOTI_TYPE;

    @Prop({})
    relation: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);