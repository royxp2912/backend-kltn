import { SchemaTypes, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { PRODUCT_BRAND, PRODUCT_STATUS } from "src/constants/schema.enum";

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    name: string;

    // @Prop({ required: true })
    // images: string[];

    @Prop({ required: true })
    desc: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Category', required: true })
    category: Types.ObjectId;

    @Prop({ type: String, enum: PRODUCT_BRAND, required: true })
    brand: PRODUCT_BRAND;

    @Prop({ required: true })
    price: number;

    @Prop({ default: 0, min: 0, max: 5 })
    rating: number;

    @Prop({ default: 0 })
    sold: number;

    @Prop({ type: String, enum: PRODUCT_STATUS, default: PRODUCT_STATUS.Active })
    status: PRODUCT_STATUS;

    @Prop({ type: Boolean, default: true })
    isStock: boolean;
}
export const ProductSchema = SchemaFactory.createForClass(Product);