export interface LiabilityListItem {
    id: number;
    code: string;
    date: string;
    supplier_name: string;
    grand_total: number;
    total_paid: number;
    remaining_payment: number;
    paid_percentage: number;
}

export interface LiabilityListMeta {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number | null;
    to: number | null;
}

export interface LiabilityListResult {
    data: LiabilityListItem[];
    meta: LiabilityListMeta;
}

export interface LiabilityPaymentHistory {
    id: number;
    cash_payment_amount: number;
    bca_payment_amount: number;
    bca_payment_usd_amount: number;
    payment_at: string;
    note: string;
    payment_proof: string | null;
    created_at: string;
}

export interface LiabilityUnitItem {
    id: number;
    qty_total: number;
    price: number;
    unit_type: {
        name: string;
        unit_model: string;
    };
}

export interface LiabilityDetail {
    id: number;
    code: string;
    date: string;
    person: {
        id: number;
        name: string;
    };
    billing_summary: {
        grand_total: number;
        total_paid: number;
        remaining_payment: number;
        is_paid: boolean;
        paid_percentage: number;
    };
    unit_transaction_billing: {
        id: number;
        unit_transaction_billing_histories: LiabilityPaymentHistory[];
    };
    unit_transaction_items: LiabilityUnitItem[];
}

export interface CreateLiabilityPaymentPayload {
    unit_transaction_billing_id: number;
    cash_payment_amount?: number | string;
    bca_payment_amount?: number | string;
    bca_payment_usd_amount?: number | string;
    payment_at?: string;
    note?: string;
    payment_proof?: File | null;
}

export type PembayaranHutang = LiabilityListItem;
export type PembayaranHutangDetail = LiabilityDetail;
