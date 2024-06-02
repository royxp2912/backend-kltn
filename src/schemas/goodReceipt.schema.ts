import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: 'good_receipts', timestamps: true })
export class GoodReceipt {
    @Prop({ unique: true, required: true })
    receiptId: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Supplier', required: true })
    supplier: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    confirmer: Types.ObjectId;

    @Prop({ required: true })
    confirmation_date: Date;

    @Prop({ required: true })
    total: number;

    @Prop({ required: false })
    notes: string;
}

export const GoodReceiptSchema = SchemaFactory.createForClass(GoodReceipt);