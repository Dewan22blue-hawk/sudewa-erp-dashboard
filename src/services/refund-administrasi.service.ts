import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';
import { UnitTransactionRefundListResponse, CreateRefundPayload, CreateRefundPaymentPayload, UnitTransactionRefund, UpdateRefundPayload, UpdateRefundPaymentPayload } from '@/@types/refund.type';
import type { UnitTransactionItemDetail } from '@/@types/unit-transaction.types';

const BASE_PATH = '/wapi/transaction/unit-transaction/unit-transaction-refund';
const PAYMENT_PATH = '/wapi/transaction/unit-transaction/unit-transaction-refund-payment';
const ITEM_DETAIL_PATH = '/wapi/transaction/unit-transaction/unit-transaction-item-detail';
const TRANSACTION_PATH = '/wapi/transaction/unit-transaction/unit-transaction';

const toString = (value: unknown) => String(value ?? '');
const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapItemDetail = (item: any): UnitTransactionItemDetail => ({
  id: toString(item.id),
  unit_transaction_item_id: toString(item.unit_transaction_item_id),
  unit_type_name: item.unit_type_name ?? item.unit_type?.name ?? '-',
  price: item.price !== undefined ? toNumber(item.price) : undefined,
  color: item.color ?? '-',
  machine_number: item.machine_number ?? '-',
  chassis_number: item.chassis_number ?? '-',
  in_stock: item.in_stock === true || item.in_stock === 1 || item.in_stock === '1',
  status: item.status ? String(item.status) : '',
  created_at: item.created_at ?? '',
});

const mapRefund = (item: any): UnitTransactionRefund => ({
  id: toString(item.id),
  code: item.code || '-',
  unit_transaction_id: toString(item.unit_transaction_id),
  refund_date: item.refund_date || '',
  refund_amount: toNumber(item.refund_amount),
  note: item.note || '',
  status: item.status || 'waiting',
  created_at: item.created_at || '',
  items: Array.isArray(item.items) ? item.items.map(mapItemDetail) : [],
      payments: Array.isArray(item.payments)
    ? item.payments.map((payment: any) => ({
        id: toString(payment.id),
        unit_transaction_refund_id: toString(payment.unit_transaction_refund_id),
        cash_id: payment.cash_id ? toString(payment.cash_id) : undefined,
        amount: toNumber(payment.amount),
        payment_date: payment.payment_date || '',
        created_at: payment.created_at || '',
        note: payment.note || payment.description || '',
      }))
    : [],
  transaction: item.transaction
    ? {
        id: item.transaction.id ? toString(item.transaction.id) : undefined,
        code: item.transaction.code || undefined,
        type: item.transaction.type || undefined,
        person: item.transaction.person
          ? {
              id: item.transaction.person.id ? toString(item.transaction.person.id) : undefined,
              name: item.transaction.person.name || '-',
            }
          : null,
      }
    : null,
});

export const refundAdministrasiService = {
  /**
   * GET Unit Transaction Refund List
   */
  async getRefundList(params: { page?: number; per_page?: number; search?: string } = {}): Promise<UnitTransactionRefundListResponse> {
    const response = await apiClient.get<LaravelApiResponse<any>>(BASE_PATH, {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
      }
    });
    const payload = ensureSuccess(response.data);
    
    // Mapping from Laravel paginated format to our expected format
    const data = (payload?.data || []).map(mapRefund);

    return {
      data,
      meta: {
        currentPage: payload?.current_page ?? 1,
        perPage: payload?.per_page ?? 10,
        total: payload?.total ?? 0,
        lastPage: payload?.last_page ?? 1,
      }
    };
  },

  /**
   * POST Create New Refund
   */
  async createRefund(payload: CreateRefundPayload): Promise<UnitTransactionRefund> {
    const formData = new FormData();
    formData.append('unit_transaction_id', payload.unit_transaction_id);
    formData.append('refund_date', payload.refund_date);
    formData.append('refund_amount', String(payload.refund_amount));
    if (payload.note) {
      formData.append('note', payload.note);
    }
    
    payload.unit_transaction_item_detail_ids.forEach(id => {
      formData.append('unit_transaction_item_detail_ids[]', id);
    });

    const response = await apiClient.post<LaravelApiResponse<any>>(BASE_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    const result = ensureSuccess(response.data);
    return mapRefund(result);
  },

  async updateRefund(id: string, payload: UpdateRefundPayload): Promise<UnitTransactionRefund> {
    const body = new URLSearchParams();
    if (payload.refund_date) body.append('refund_date', payload.refund_date);
    if (payload.refund_amount !== undefined) body.append('refund_amount', String(payload.refund_amount));
    if (payload.note !== undefined) body.append('note', payload.note);

    const response = await apiClient.put<LaravelApiResponse<any>>(`${BASE_PATH}/${id}`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = ensureSuccess(response.data);
    return mapRefund(result);
  },

  async deleteRefund(id: string): Promise<void> {
    const response = await apiClient.delete<LaravelApiResponse<any>>(`${BASE_PATH}/${id}`);
    ensureSuccess(response.data);
  },

  /**
   * POST Create Refund Payment (Cicilan)
   */
  async createRefundPayment(payload: CreateRefundPaymentPayload): Promise<void> {
    const body = new URLSearchParams();
    body.append('unit_transaction_refund_id', payload.unit_transaction_refund_id);
    body.append('amount', String(payload.amount));
    body.append('payment_date', payload.payment_date);
    if (payload.note) {
      body.append('note', payload.note);
    }

    const response = await apiClient.post<LaravelApiResponse<any>>(PAYMENT_PATH, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    ensureSuccess(response.data);
  },

  async updateRefundPayment(id: string, payload: UpdateRefundPaymentPayload): Promise<void> {
    const body = new URLSearchParams();
    if (payload.amount !== undefined) body.append('amount', String(payload.amount));
    if (payload.payment_date) body.append('payment_date', payload.payment_date);
    if (payload.note !== undefined) body.append('note', payload.note);

    const response = await apiClient.put<LaravelApiResponse<any>>(`${PAYMENT_PATH}/${id}`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    ensureSuccess(response.data);
  },

  async deleteRefundPayment(id: string): Promise<void> {
    const response = await apiClient.delete<LaravelApiResponse<any>>(`${PAYMENT_PATH}/${id}`);
    ensureSuccess(response.data);
  },

  /**
   * GET Unit Transaction Item Detail (for multi-select)
   */
  async getTransactionItemDetails(params: { page?: number; per_page?: number; search?: string } = {}) {
    const response = await apiClient.get<LaravelApiResponse<any>>(ITEM_DETAIL_PATH, {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 100, // as requested
        search: params.search || undefined,
      }
    });
    
    const payload = ensureSuccess(response.data);

    return {
      ...payload,
      data: Array.isArray(payload?.data) ? payload.data.map(mapItemDetail) : [],
    };
  },

  /**
   * GET Detail Transaction
   */
  async getTransactionDetail(id: string) {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${TRANSACTION_PATH}/${id}`);
    const payload = ensureSuccess(response.data);
    return payload;
  }
};
