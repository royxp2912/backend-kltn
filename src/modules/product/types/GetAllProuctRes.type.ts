import { Product } from "src/schemas/product.schema";

export type GetAllProductRes = {
    pages: number;
    data: Product[];
}