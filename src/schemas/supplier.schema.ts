import { SchemaTypes, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { BillingInfomation } from "src/constants/schema.type";
import { BILLING_METHOD } from "src/constants/schema.enum";

@Schema({ timestamps: true })
export class Supplier {
    @Prop({ required: true })
    supplier_name: string;

    @Prop({ required: true })
    contacter_name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: false })
    address: string;

    @Prop({
        type: {
            method: { type: String, enum: BILLING_METHOD, required: true },
            bank: { type: String, required: false },
            bank_account: { type: String, required: false },
        }
    })
    billing_infomation: BillingInfomation;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);