import { SchemaTypes, Types } from "mongoose";
import { VARIANT_COLOR, VARIANT_HEX } from "src/constants/schema.enum";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Variant {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    // @Prop({ required: true })
    // image: string;

    @Prop({ required: true })
    color: VARIANT_COLOR;

    @Prop({ required: true })
    hex: VARIANT_HEX;

    @Prop({ required: true })
    size: string;

    @Prop({ required: true })
    quantity: number;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);