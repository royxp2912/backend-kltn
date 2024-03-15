import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { DEFAULT_AVATAR } from "src/constants/schema.constant";
import { USER_ROLES, USER_STATUS, USER_GENDER } from "src/constants/schema.enum";

@Schema({ timestamps: true })
export class User {
    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ default: DEFAULT_AVATAR })
    avatar: string;

    @Prop({ type: String, enum: USER_GENDER, required: true })
    gender: string;

    @Prop({ required: true })
    birthDay: Date;

    @Prop({})
    phone: string;

    @Prop({ default: 0 })
    spent: number;

    @Prop({ type: String, enum: USER_ROLES, default: USER_ROLES.User })
    role: USER_ROLES;

    @Prop({ type: String, enum: USER_STATUS, default: USER_STATUS.Active })
    status: USER_STATUS;
}
export const UserSchema = SchemaFactory.createForClass(User);