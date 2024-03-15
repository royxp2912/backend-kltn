import { SchemaTypes, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class DeliveryAddress {

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    receiver: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    province: string;

    @Prop({ required: true })
    districts: string;

    @Prop({ required: true })
    wards: string;

    @Prop({ required: true })
    specific: string;

    @Prop({ default: false })
    isDefault: boolean;
}

export const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddress);