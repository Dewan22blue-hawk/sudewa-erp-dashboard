import { apiClient } from '@/lib/api/client';

export interface SalesTransactionParams {
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
    person_id?: number;
    search?: string;
    sort_order?: 'asc' | 'desc';
}

export interface SalesTransactionItem {
    id: number;
    code: string;
    created_at: string;
    person: { id: number; name: string };
    unit_transaction_items: Array<{
        unit_type: { name: string };
        qty_total: number;
        price: number;
        bbn_price: number;
        expedition_fee: number;
        other_fee: number;
        hpp_total_price: number;
        dpp_total_price: number;
        ppn_total_price: number;
    }>;
    transaction_bruto_total: number;
    transaction_dpp_total: number;
    transaction_ppn_total: number;
    transaction_bbn_total: number;
    transaction_other_fee: number;
}

export interface SalesTransactionResponse {
    current_page: number;
    data: SalesTransactionItem[];
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export const getLaporanPenjualan = async (
    params: SalesTransactionParams
): Promise<SalesTransactionResponse> => {
    const response = await apiClient.get('/wapi/transaction/unit-transaction/unit-transaction', {
        params: {
            type: 'sales',
            is_paid: true,
            sort_order: 'desc',
            ...params,
        },
    });
    return response.data.data;
};

export const getCustomers = async () => {
    const response = await apiClient.get('/wapi/master-data/customer', {
        params: { per_page: 1000 },
    });
    return response.data.data;
};

export const getUnitTypes = async () => {
    const response = await apiClient.get('/wapi/master-data/unit-type', {
        params: { sort_by: 'created_at', sort_order: 'asc' },
    });
    return response.data.data;
};