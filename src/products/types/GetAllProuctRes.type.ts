import { Product } from "src/schemas/Product.schema";

export type GetAllProductRes = {
    pages: number;
    data: Product[];
}