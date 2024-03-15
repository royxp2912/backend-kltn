import { SchemaTypes, Types } from "mongoose";
import { VARIANT_COLOR } from "src/constants/schema.enum";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class ImageVariant {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ required: true })
    color: VARIANT_COLOR;

    @Prop({ required: true })
    image: string;
}

export const ImageVariantSchema = SchemaFactory.createForClass(ImageVariant);