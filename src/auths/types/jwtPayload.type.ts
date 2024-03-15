import { Types } from "mongoose";
import { USER_ROLES } from "src/constants/schema.enum";

export type JwtPayload = {
    userId: Types.ObjectId;
    role: USER_ROLES;
};