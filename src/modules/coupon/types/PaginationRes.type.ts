import { Coupon } from "src/schemas/coupon.schema";

export type PaginationRes = {
    pages: number;
    data: Coupon[];
}