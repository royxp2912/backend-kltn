import { COUPON_STATUS, COUPON_TYPE } from "src/constants/schema.enum";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Coupon {
    @Prop({ type: String, unique: true, required: true })
    code: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true })
    value: number;

    @Prop({ type: String, enum: COUPON_TYPE, default: COUPON_TYPE.price })
    type: COUPON_TYPE;

    @Prop({ type: Number, required: false })
    maxDiscount: number;

    @Prop({ type: Number, required: false })
    minAmount: number;

    @Prop({ type: Number, required: true })
    validityDuration: number;

    @Prop({ type: String, enum: COUPON_STATUS, default: COUPON_STATUS.Active })
    status: COUPON_STATUS;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);