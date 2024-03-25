import { Coupon } from "src/schemas/Coupon.schema";

export type PaginationRes = {
    pages: number;
    data: Coupon[];
}