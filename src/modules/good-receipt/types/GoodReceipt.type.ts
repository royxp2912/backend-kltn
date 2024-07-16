import { RECEIPT_STATUS } from "src/constants/schema.enum";

export type GoodReceiptType = {
    receiptId: string;
    supplier: string;
    confirmer: string;
    confirmation_date: string;
    total_receipt: number;
    notes?: string;
    status: RECEIPT_STATUS;
}