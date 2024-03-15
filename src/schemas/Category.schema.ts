import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Category {

    @Prop({ unique: true, required: true })
    name: string;

    @Prop({ required: true })
    img: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);