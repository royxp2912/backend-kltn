import { Types } from "mongoose";
import { BILLING_METHOD, VARIANT_COLOR, VARIANT_HEX } from "./schema.enum";

export type AuthListTokens = {
    value: string;
    status: string;
}

export type DetailProductInCart = {
    product: Types.ObjectId,
    image: string,
    name: string,
    color: VARIANT_COLOR,
    hex: VARIANT_HEX,
    size: string,
    quantity: number,
    price: number,
}

export type DetailProductInOrder = {
    product: Types.ObjectId,
    image: string,
    name: string,
    color: VARIANT_COLOR,
    hex: VARIANT_HEX,
    size: string,
    quantity: number,
    price: number,
}

export type BillingInfomation = {
    method: BILLING_METHOD;
    bank?: string;
    bank_account?: string;
}

export type ReceiptVariant = {
    size: string;
    quantity: number;
}