import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "util_wards", timestamps: true })
export class UtilWard {
    @Prop({ unique: true, required: true })
    wardId: string;

    @Prop({ required: true })
    ward_name: string;

    @Prop({ required: true })
    ward_type: string;

    @Prop({ required: true })
    districtId: string;
}

export const UtilWardSchema = SchemaFactory.createForClass(UtilWard);