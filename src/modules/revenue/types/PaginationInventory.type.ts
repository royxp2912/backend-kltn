import { Types } from "mongoose";

type Inventory = {
    product: Types.ObjectId;
    totalInventory: number;
    sold: number;
}

export type PaginationInventory = {
    pages: number;
    data: Inventory[];
}