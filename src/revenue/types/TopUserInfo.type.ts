import { Types } from "mongoose";

export type TopUserInfo = {
    id: Types.ObjectId | null;
    name: string;
    image: string;
    spent: number;
}