import { SchemaTypes, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "order_deliveries", timestamps: true })
export class OrderDelivery {
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
}

export const OrderDeliverySchema = SchemaFactory.createForClass(OrderDelivery);