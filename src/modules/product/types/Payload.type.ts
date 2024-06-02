import { Types } from "mongoose"
import { USER_ROLES } from "src/constants/schema.enum";

export type Payload = {
    userId: Types.ObjectId;
    role: USER_ROLES;
    iat: number;
    exp: number;
}