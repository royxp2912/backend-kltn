import { RECEIPT_STATUS } from "src/constants/schema.enum";
import { DetailGoodReceipt } from "src/schemas/detailGoodReceipt.schema";

export type DetailReceipt = {
    receiptId: string;
    supplier: string;
    confirmer: string;
    confirmation_date: string;
    updater: string;
    update_date: string;
    status: RECEIPT_STATUS;
    total_receipt: number;
    notes?: string,
    details: DetailGoodReceipt[],
}