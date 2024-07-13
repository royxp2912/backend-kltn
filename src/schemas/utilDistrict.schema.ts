import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "util_districts", timestamps: true })
export class UtilDistrict {
    @Prop({ unique: true, required: true })
    districtId: string;

    @Prop({ required: true })
    district_name: string;

    @Prop({ required: true })
    district_type: string;

    @Prop({ required: true })
    provinceId: string;
}

export const UtilDistrictSchema = SchemaFactory.createForClass(UtilDistrict);