import { Types } from "mongoose";

export type TopProductInfo = {
    id: Types.ObjectId | null;
    name: string;
    image: string;
    sold: number;
}