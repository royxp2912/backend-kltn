import { SchemaTypes, Types } from "mongoose";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { ReceiptVariant } from "src/constants/schema.type";

@Schema({ collection: 'detail_good_receipts', timestamps: true })
export class DetailGoodReceipt {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'GoodReceipt', required: true })
    receipt: Types.ObjectId;

    @Prop({ required: true })
    name_product: string;

    @Prop({ required: true })
    color: VARIANT_COLOR;

    @Prop([
        {
            size: { type: String, required: true },
            quantity: { type: Number, required: true },
        }
    ])
    receipt_variant: ReceiptVariant[];

    @Prop({ required: true })
    unit_price: number;

    @Prop({ required: true })
    total_quantity: number;

    @Prop({ required: true })
    total_price: number;

    // @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    // name_product: Types.ObjectId;

    // @Prop({ required: true })
    // size: string;

    // @Prop({ required: true })
    // quantity: number;
}

export const DetailGoodReceiptSchema = SchemaFactory.createForClass(DetailGoodReceipt);