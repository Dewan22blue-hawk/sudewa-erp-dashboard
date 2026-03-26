import { UnitBilling, UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

type UnitBillingApiModel = {
  id?: string | number;
  company_id?: string | number;
  unit_transaction_id?: string | number;
  bca_payment?: string | number;
  cash_payment?: string | number;
  bca_payment_2?: string | number;
  payment_date?: string;
  is_paid?: boolean | number | string;
  created_at?: string;
  updated_at?: string;
};

const basePath = '/wapi/transaction/unit-transaction-billing';
const legacyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-billing';

const toNumber = (value: string | number | undefined): number => Number(value ?? 0);
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

const mapBilling = (item: UnitBillingApiModel): UnitBilling => ({
  id: String(item.id ?? ''),
  company_id: String(item.company_id ?? ''),
  unit_transaction_id: String(item.unit_transaction_id ?? ''),
  bca_payment: toNumber(item.bca_payment),
  cash_payment: toNumber(item.cash_payment),
  bca_payment_2: toNumber(item.bca_payment_2),
  payment_date: item.payment_date ?? '',
  is_paid: toBool(item.is_paid),
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const toFormData = (payload: UpsertUnitBillingPayload, asUpdate = false): FormData => {
  const form = new FormData();
  form.append('company_id', String(payload.company_id));
  form.append('unit_transaction_id', String(payload.unit_transaction_id));
  form.append('bca_payment', String(payload.bca_payment ?? 0));
  form.append('cash_payment', String(payload.cash_payment ?? 0));
  form.append('bca_payment_2', String(payload.bca_payment_2 ?? 0));
  form.append('payment_date', payload.payment_date);
  form.append('is_paid', payload.is_paid ? '1' : '0');
  if (asUpdate) form.append('_method', 'PUT');
  return form;
};

export const unitBillingService = {
  async getBillings(unitTransactionId: string): Promise<UnitBilling[]> {
    const response = await withPathFallback(
      () =>
        apiClient.get<LaravelApiResponse<any>>(basePath, {
          params: {
            unit_transaction_id: unitTransactionId,
          },
        }),
      () =>
        apiClient.get<LaravelApiResponse<any>>(legacyBasePath, {
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
      () => apiClient.get<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`),
      () => apiClient.get<LaravelApiResponse<UnitBillingApiModel>>(`${legacyBasePath}/${id}`),
    );
    const payload = ensureSuccess(response.data);
    const data = ((payload as any)?.data ? (payload as any).data : payload) as UnitBillingApiModel;
    return mapBilling(data);
  },

  async createBilling(payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(basePath, toFormData(payload)),
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(legacyBasePath, toFormData(payload)),
    );
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },

  async updateBilling(id: string, payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`, toFormData(payload, true)),
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${legacyBasePath}/${id}`, toFormData(payload, true)),
    );
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },
};
