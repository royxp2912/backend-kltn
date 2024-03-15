import { SchemaTypes, Types } from "mongoose";
import { AUTH_TOKENS } from "src/constants/schema.enum";
import { AuthListTokens } from "src/constants/schema.type";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Auth {

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop([
        {
            value: { type: String, required: true },
            status: { type: String, enum: AUTH_TOKENS, default: AUTH_TOKENS.Active },
        },
    ])
    listTokens: AuthListTokens[];
}

export const AuthSchema = SchemaFactory.createForClass(Auth);