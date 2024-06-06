import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "util_provinces", timestamps: true })
export class UtilProvince {
    @Prop({ unique: true, required: true })
    provinceId: string;

    @Prop({ required: true })
    province_name: string;

    @Prop({ required: true })
    province_type: string;
}

export const UtilProvinceSchema = SchemaFactory.createForClass(UtilProvince);