import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "user_coupons", timestamps: true })
export class UserCoupon {
    @Prop({ type: SchemaTypes.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, required: true })
    coupon: Types.ObjectId;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date, required: true })
    endDate: Date;

    @Prop({ type: Boolean, default: false })
    isExpire: boolean;
}

export const UserCouponSchema = SchemaFactory.createForClass(UserCoupon);