import { SchemaTypes, Types } from "mongoose";
import { AuthListTokens, DetailProductInCart } from "src/constants/schema.type";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Cart {

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

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
    items: DetailProductInCart[];

    @Prop({ type: Number, default: 0 })
    total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);