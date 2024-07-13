export type GoodReceiptType = {
    receiptId: string;
    supplier: string;
    confirmer: string;
    confirmation_date: string;
    total_receipt: number;
    notes?: string,
}