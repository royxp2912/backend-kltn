import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "util_banks", timestamps: true })
export class UtilBank {
    @Prop({ unique: true, required: true })
    bank_code: string;

    @Prop({ unique: true, required: true })
    bank_name: string;

    @Prop({ unique: true, required: true })
    bank_full_name: string;
}

export const UtilBankSchema = SchemaFactory.createForClass(UtilBank);