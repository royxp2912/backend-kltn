import { Supplier } from "src/schemas/supplier.schema";

export type PaginationAllSupplier = {
    pages: number;
    data: Supplier[];
}