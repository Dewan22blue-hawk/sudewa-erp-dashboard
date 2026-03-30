import { UnitBilling, UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

type UnitBillingApiModel = {
  id?: string | number;
  company_id?: string | number;
  unit_transaction_id?: string | number;
  unitTransactionId?: string | number;
  bca_payment?: string | number;
  bca_payment_amount?: string | number;
  bca_payment_idr?: string | number;
  bca_payment_idr_amount?: string | number;
  cash_payment?: string | number;
  cash_payment_amount?: string | number;
  cash_amount?: string | number;
  bca_payment_2?: string | number;
  bca_payment_usd_amount?: string | number;
  bca_usd_payment?: string | number;
  usd_payment_amount?: string | number;
  total_paid?: string | number;
  total_payment?: string | number;
  paid_total?: string | number;
  payment_date?: string;
  payment_at?: string;
  date?: string;
  is_paid?: boolean | number | string;
  created_at?: string;
  updated_at?: string;
  data?: UnitBillingApiModel;
};

const basePath = '/wapi/transaction/unit-transaction-billing';
const legacyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-billing';

const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};

const shouldFallback = (error: any): boolean => {
  const statusCode = error?.statusCode ?? error?.response?.status;
  return statusCode === 404 || statusCode === 405 || statusCode === 500;
};

const withPathFallback = async <T>(primary: () => Promise<T>, legacy: () => Promise<T>): Promise<T> => {
  try {
    return await primary();
  } catch (error) {
    if (!shouldFallback(error)) throw error;
    return legacy();
  }
};

const unwrapBilling = (payload: any): UnitBillingApiModel => {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data as UnitBillingApiModel;
  }
  return payload as UnitBillingApiModel;
};

const pickNumber = (...values: unknown[]): number => {
  for (const value of values) {
    const normalized = Number(value ?? 0);
    if (Number.isFinite(normalized) && normalized > 0) return normalized;
  }
  return 0;
};

const mapBilling = (raw: UnitBillingApiModel): UnitBilling => {
  const item = unwrapBilling(raw);

  let bcaPayment = pickNumber(item.bca_payment, item.bca_payment_amount, item.bca_payment_idr, item.bca_payment_idr_amount);
  const cashPayment = pickNumber(item.cash_payment, item.cash_payment_amount, item.cash_amount);
  const bcaPayment2 = pickNumber(item.bca_payment_2, item.bca_payment_usd_amount, item.bca_usd_payment, item.usd_payment_amount);
  const totalPaid = pickNumber(item.total_paid, item.total_payment, item.paid_total);

  // Fallback for APIs that only return aggregate paid total without channel breakdown.
  if (bcaPayment === 0 && cashPayment === 0 && bcaPayment2 === 0 && totalPaid > 0) {
    bcaPayment = totalPaid;
  }

  return {
    id: String(item.id ?? ''),
    company_id: String(item.company_id ?? ''),
    unit_transaction_id: String(item.unit_transaction_id ?? item.unitTransactionId ?? ''),
    bca_payment: bcaPayment,
    cash_payment: cashPayment,
    bca_payment_2: bcaPayment2,
    payment_date: item.payment_date ?? item.payment_at ?? item.date ?? '',
    is_paid: toBool(item.is_paid),
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

const toFormData = (payload: UpsertUnitBillingPayload, asUpdate = false): FormData => {
  const bcaPayment = Number(payload.bca_payment ?? 0);
  const cashPayment = Number(payload.cash_payment ?? 0);
  const paymentDate = payload.payment_date;

  const form = new FormData();
  form.append('company_id', String(payload.company_id));
  form.append('unit_transaction_id', String(payload.unit_transaction_id));
  form.append('bca_payment', String(bcaPayment));
  form.append('cash_payment', String(cashPayment));
  form.append('bca_payment_2', String(payload.bca_payment_2 ?? 0));
  form.append('payment_date', paymentDate);
  form.append('is_paid', payload.is_paid ? '1' : '0');
  if (asUpdate) form.append('_method', 'PUT');
  return form;
};

export const unitBillingService = {
  async getBillings(unitTransactionId: string): Promise<UnitBilling[]> {
    const response = await withPathFallback(
      () =>
        apiClient.get<LaravelApiResponse<any>>(legacyBasePath, {
          params: {
            unit_transaction_id: unitTransactionId,
          },
        }),
      () =>
        apiClient.get<LaravelApiResponse<any>>(basePath, {
          params: {
            unit_transaction_id: unitTransactionId,
          },
        }),
    );

    const payload = ensureSuccess(response.data);

    if (Array.isArray(payload)) {
      return payload.map((item: UnitBillingApiModel) => mapBilling(item));
    }

    if (Array.isArray(payload?.data)) {
      return toPaginatedResult(payload, mapBilling).data;
    }

    if (Array.isArray(payload?.data?.data)) {
      return toPaginatedResult(payload.data, mapBilling).data;
    }

    return [];
  },

  async getBillingById(id: string): Promise<UnitBilling> {
    const response = await withPathFallback(
      () => apiClient.get<LaravelApiResponse<UnitBillingApiModel>>(`${legacyBasePath}/${id}`),
      () => apiClient.get<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`),
    );
    const payload = ensureSuccess(response.data);
    return mapBilling(payload as UnitBillingApiModel);
  },

  async createBilling(payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(legacyBasePath, toFormData(payload)),
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(basePath, toFormData(payload)),
    );
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },

  async updateBilling(id: string, payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${legacyBasePath}/${id}`, toFormData(payload, true)),
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`, toFormData(payload, true)),
    );
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },
};
