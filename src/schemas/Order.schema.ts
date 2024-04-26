import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { DetailProductInOrder } from "src/constants/schema.type";
import { ORDER_PAYMENT_METHOD, ORDER_STATUS } from "src/constants/schema.enum";

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true, unique: true })
    orderId: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'OrderDelivery', required: true })
    deliveryAddress: Types.ObjectId;

    @Prop([
        {
            product: { type: SchemaTypes.ObjectId, ref: "Product", require: true, },
            image: { type: String, require: true, },
            name: { type: String, require: true, },
            color: { type: String, require: true, },
            hex: { type: String, require: true, },
            size: { type: String, require: true, },
            quantity: { type: Number, require: true, },
            price: { type: Number, require: true, },
        },
    ])
    items: DetailProductInOrder[];

    @Prop({ type: Number, default: 0 })
    total: number;

    @Prop({ type: String, enum: ORDER_PAYMENT_METHOD, default: ORDER_PAYMENT_METHOD.COD })
    paymentMethod: ORDER_PAYMENT_METHOD;

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

    @Prop({ type: Boolean, default: false })
    isDelivered: boolean;

    @Prop({ type: String, enum: ORDER_STATUS, default: ORDER_STATUS.Confirming })
    status: ORDER_STATUS;

    @Prop({ default: 0 })
    discountAmount: number;

    @Prop()
    createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);