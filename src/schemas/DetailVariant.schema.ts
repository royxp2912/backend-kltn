import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class DetailVariant {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Variant', required: true })
    variant: Types.ObjectId;

    // @Prop({ required: true })
    // image: string;

    // @Prop({ required: true })
    // color: VARIANT_COLOR;

    // @Prop({ required: true })
    // hex: VARIANT_HEX;

    @Prop({ required: true })
    size: string;

    @Prop({ required: true })
    quantity: number;
}

export const DetailVariantSchema = SchemaFactory.createForClass(DetailVariant);