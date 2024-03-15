import { Order } from "src/schemas/Order.schema";

export type PaginationRes = {
    pages: number;
    data: Order[];
}