import { Order } from "src/schemas/order.schema";

export type PaginationRes = {
    pages: number;
    data: Order[];
    total: number;
}