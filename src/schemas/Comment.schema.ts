import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    commentator: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 0, max: 5 })
    rating: number;

    @Prop({ type: String })
    content: string;

    @Prop({ type: Number, default: 0 })
    like: number;

    @Prop()
    images: string[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);