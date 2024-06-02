import { DetailGoodReceipt } from "src/schemas/detailGoodReceipt.schema";

export type DetailReceipt = {
    receiptId: string;
    supplier: string;
    confirmer: string;
    confirmation_date: string;
    total_receipt: number;
    notes?: string,
    details: DetailGoodReceipt[],
}