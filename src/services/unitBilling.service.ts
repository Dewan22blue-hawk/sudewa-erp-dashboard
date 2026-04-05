<<<<<<< HEAD
import {
  CreateUnitBillingHistoryPayload,
  CreateUnitBillingPayloadV2,
  UnitBilling,
  UnitBillingHistory,
  UpsertUnitBillingPayload,
} from '@/@types/unit-billing.types';
=======
import { UnitBilling, UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

type UnitBillingApiModel = {
  id?: string | number;
  company_id?: string | number;
  unit_transaction_id?: string | number;
<<<<<<< HEAD
  unitTransactionId?: string | number;
  grand_total?: string | number;
  remaining_payment?: string | number;
  last_payment_at?: string;
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
  total_cash_payment?: string | number;
  total_bca_cash_payment?: string | number;
  total_bca_payment?: string | number;
  total_usd_payment?: string | number;
  payment_date?: string;
  payment_at?: string;
  date?: string;
  is_paid?: boolean | number | string;
  bca_payment_liability?: string | number;
  cash_payment_liability?: string | number;
  bca_payment_usd_liability?: string | number;
  created_at?: string;
  updated_at?: string;
  data?: UnitBillingApiModel;
};

type UnitBillingHistoryApiModel = {
  id?: string | number;
  unit_transaction_billing_id?: string | number;
  bca_payment_amount?: string | number;
  cash_payment_amount?: string | number;
  bca_payment_usd_amount?: string | number;
  payment_at?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
  unit_transaction_billing?: {
    id?: string | number;
    unit_transaction_id?: string | number;
  };
  data?: UnitBillingHistoryApiModel;
};

const basePath = '/wapi/transaction/unit-transaction/unit-transaction-billing';
const historyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-billing-history';

=======
  bca_payment?: string | number;
  bca_payment_amount?: string | number;
  cash_payment?: string | number;
  cash_payment_amount?: string | number;
  bca_payment_2?: string | number;
  bca_payment_usd_amount?: string | number;
  payment_date?: string;
  payment_at?: string;
  is_paid?: boolean | number | string;
  created_at?: string;
  updated_at?: string;
};

const basePath = '/wapi/transaction/unit-transaction-billing';
const legacyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-billing';

const toNumber = (value: string | number | undefined): number => Number(value ?? 0);
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};

<<<<<<< HEAD
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

const toSafeNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapBilling = (raw: UnitBillingApiModel): UnitBilling => {
  const item = unwrapBilling(raw);
  const isPaid = toBool(item.is_paid);

  let bcaPayment = pickNumber(item.bca_payment, item.bca_payment_amount, item.bca_payment_idr, item.bca_payment_idr_amount);
  const cashPayment = pickNumber(item.cash_payment, item.cash_payment_amount, item.cash_amount);
  const bcaPayment2 = pickNumber(item.bca_payment_2, item.bca_payment_usd_amount, item.bca_usd_payment, item.usd_payment_amount);
  const totalPaidFromComponents =
    toSafeNumber(item.total_cash_payment) +
    toSafeNumber(item.total_bca_cash_payment) +
    toSafeNumber(item.total_bca_payment) +
    toSafeNumber(item.total_usd_payment);
  const totalPaid = pickNumber(item.total_paid, item.paid_total, totalPaidFromComponents);
  const rawGrandTotal = toSafeNumber(item.grand_total);
  const rawRemaining = toSafeNumber(item.remaining_payment);
  const grandTotal = rawGrandTotal > 0 ? rawGrandTotal : totalPaid + rawRemaining;
  const computedRemaining = Math.max(0, grandTotal - totalPaid);
  const remainingPayment = rawRemaining > 0 ? rawRemaining : isPaid ? 0 : computedRemaining;

  if (bcaPayment === 0 && cashPayment === 0 && bcaPayment2 === 0 && totalPaid > 0) {
    bcaPayment = totalPaid;
  }

  return {
    id: String(item.id ?? ''),
    company_id: String(item.company_id ?? ''),
    unit_transaction_id: String(item.unit_transaction_id ?? item.unitTransactionId ?? ''),
    grand_total: grandTotal,
    total_paid: totalPaid,
    remaining_payment: remainingPayment,
    last_payment_at: item.last_payment_at,
    bca_payment: bcaPayment,
    cash_payment: cashPayment,
    bca_payment_2: bcaPayment2,
    bca_payment_liability: pickNumber(item.bca_payment_liability),
    cash_payment_liability: pickNumber(item.cash_payment_liability),
    bca_payment_usd_liability: pickNumber(item.bca_payment_usd_liability),
    payment_date: item.payment_date ?? item.payment_at ?? item.date ?? '',
    is_paid: isPaid,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

const unwrapBillingHistory = (payload: any): UnitBillingHistoryApiModel => {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data as UnitBillingHistoryApiModel;
  }
  return payload as UnitBillingHistoryApiModel;
};

const mapBillingHistory = (raw: UnitBillingHistoryApiModel): UnitBillingHistory => {
  const item = unwrapBillingHistory(raw);
  return {
    id: String(item.id ?? ''),
    unit_transaction_billing_id: String(item.unit_transaction_billing_id ?? item.unit_transaction_billing?.id ?? ''),
    unit_transaction_id: item.unit_transaction_billing?.unit_transaction_id ? String(item.unit_transaction_billing.unit_transaction_id) : undefined,
    bca_payment_amount: Number(item.bca_payment_amount ?? 0),
    cash_payment_amount: Number(item.cash_payment_amount ?? 0),
    bca_payment_usd_amount: Number(item.bca_payment_usd_amount ?? 0),
    payment_at: String(item.payment_at ?? ''),
    note: item.note,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

const extractHistoryRows = (payload: any): UnitBillingHistoryApiModel[] => {
  if (Array.isArray(payload)) return payload as UnitBillingHistoryApiModel[];
  if (Array.isArray(payload?.data)) return payload.data as UnitBillingHistoryApiModel[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as UnitBillingHistoryApiModel[];
  return [];
};

const toFormData = (payload: UpsertUnitBillingPayload, asUpdate = false): FormData => {
  const form = new FormData();
  form.append('company_id', String(payload.company_id));
  form.append('unit_transaction_id', String(payload.unit_transaction_id));
  form.append('bca_payment', String(Number(payload.bca_payment ?? 0)));
  form.append('cash_payment', String(Number(payload.cash_payment ?? 0)));
  form.append('bca_payment_2', String(Number(payload.bca_payment_2 ?? 0)));
  form.append('payment_date', payload.payment_date);
=======
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
  bca_payment: toNumber(item.bca_payment ?? item.bca_payment_amount),
  cash_payment: toNumber(item.cash_payment ?? item.cash_payment_amount),
  bca_payment_2: toNumber(item.bca_payment_2 ?? item.bca_payment_usd_amount),
  payment_date: item.payment_date ?? item.payment_at ?? '',
  is_paid: toBool(item.is_paid),
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const toFormData = (payload: UpsertUnitBillingPayload, asUpdate = false): FormData => {
  const bcaPayment = Number(payload.bca_payment ?? 0);
  const cashPayment = Number(payload.cash_payment ?? 0);
  const paymentDate = payload.payment_date;

  const form = new FormData();
  form.append('company_id', String(payload.company_id));
  form.append('unit_transaction_id', String(payload.unit_transaction_id));
  form.append('bca_payment', String(bcaPayment));
  form.append('cash_payment', String(cashPayment));
  // Compatibility fields for backends expecting the new payment contract.
  form.append('bca_payment_amount', String(bcaPayment));
  form.append('cash_payment_amount', String(cashPayment));
  form.append('bca_payment_2', String(payload.bca_payment_2 ?? 0));
  form.append('bca_payment_usd_amount', String(payload.bca_payment_2 ?? 0));
  form.append('payment_date', paymentDate);
  form.append('payment_at', paymentDate);
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
  form.append('is_paid', payload.is_paid ? '1' : '0');
  if (asUpdate) form.append('_method', 'PUT');
  return form;
};

export const unitBillingService = {
<<<<<<< HEAD
  async checkRightAmount(companyId: string, unitTransactionId: string): Promise<void> {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/check-right-amount`, {
      params: {
        company_id: companyId,
        unit_transaction_id: unitTransactionId,
      },
    });

    ensureSuccess(response.data);
  },

  async getCurrentBilling(unitTransactionId: string): Promise<UnitBilling | null> {
    const billings = await this.getBillings(unitTransactionId);
    if (billings.length === 0) return null;

    const sorted = [...billings].sort((a, b) => {
      const idA = Number(a.id ?? 0);
      const idB = Number(b.id ?? 0);
      if (idA !== idB) return idB - idA;

      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    const active = sorted.find((item) => {
      const grand = Number(item.grand_total ?? 0);
      const paid = Number(item.total_paid ?? 0);
      const remaining = Number(item.remaining_payment ?? Math.max(0, grand - paid));
      return !item.is_paid || remaining > 0;
    });

    return active ?? sorted[0] ?? null;
  },

  async getBillings(unitTransactionId: string): Promise<UnitBilling[]> {
    const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
      params: {
        unit_transaction_id: unitTransactionId,
      },
    });

    const payload = ensureSuccess(response.data);

    let mapped: UnitBilling[] = [];

    if (Array.isArray(payload)) {
      mapped = payload.map((item: UnitBillingApiModel) => mapBilling(item));
    } else if (Array.isArray(payload?.data)) {
      mapped = toPaginatedResult(payload, mapBilling).data;
    } else if (Array.isArray(payload?.data?.data)) {
      mapped = toPaginatedResult(payload.data, mapBilling).data;
    }

    return mapped.filter((item) => String(item.unit_transaction_id) === String(unitTransactionId));
  },

  async createBillingV2(payload: CreateUnitBillingPayloadV2): Promise<UnitBilling> {
    const form = new FormData();
    form.append('company_id', String(payload.company_id));
    form.append('unit_transaction_id', String(payload.unit_transaction_id));
    if (payload.is_paid !== undefined) {
      form.append('is_paid', payload.is_paid ? '1' : '0');
    }

    const response = await apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(basePath, form);
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },

  async getBillingHistory(unitTransactionBillingId?: string, unitTransactionId?: string): Promise<UnitBillingHistory[]> {
    const params = {
      unit_transaction_billing_id: unitTransactionBillingId || undefined,
      unit_transaction_id: unitTransactionId || undefined,
      per_page: 100,
      page: 1,
    };

    const firstResponse = await apiClient.get<LaravelApiResponse<any>>(historyBasePath, { params });
    const firstPayload = ensureSuccess(firstResponse.data);
    let rows = extractHistoryRows(firstPayload);

    const lastPage = Number(firstPayload?.last_page ?? firstPayload?.data?.last_page ?? 1);
    if (Number.isFinite(lastPage) && lastPage > 1) {
      const rest = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, idx) => idx + 2).map((page) =>
          apiClient
            .get<LaravelApiResponse<any>>(historyBasePath, { params: { ...params, page } })
            .then((res) => extractHistoryRows(ensureSuccess(res.data)))
            .catch(() => [] as UnitBillingHistoryApiModel[]),
        ),
      );
      rows = [...rows, ...rest.flat()];
    }

    const mapped = rows.map(mapBillingHistory);
    let filtered = mapped.filter((item) => {
      const byBilling = unitTransactionBillingId ? String(item.unit_transaction_billing_id) === String(unitTransactionBillingId) : false;
      const byTransaction = unitTransactionId ? String(item.unit_transaction_id ?? '') === String(unitTransactionId) : false;

      if (unitTransactionBillingId && unitTransactionId) return byBilling || byTransaction;
      if (unitTransactionBillingId) return byBilling;
      if (unitTransactionId) return byTransaction;
      return true;
    });

    // Fallback: some responses omit nested unit_transaction_billing, so infer by billing IDs under the same transaction.
    if (filtered.length === 0 && unitTransactionId) {
      const relatedBillingIds = new Set((await this.getBillings(unitTransactionId)).map((billing) => String(billing.id)));
      filtered = mapped.filter((item) => relatedBillingIds.has(String(item.unit_transaction_billing_id)));
    }

    return Array.from(new Map(filtered.map((item) => [item.id, item])).values()).sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  },

  async createBillingHistory(payload: CreateUnitBillingHistoryPayload): Promise<UnitBillingHistory> {
    const form = new FormData();
    const bcaPaymentAmount = Number(payload.bca_payment_amount ?? 0);
    const cashPaymentAmount = Number(payload.cash_payment_amount ?? 0);
    const bcaPaymentUsdAmount = Number(payload.bca_payment_usd_amount ?? 0);
    const totalPayment = bcaPaymentAmount + cashPaymentAmount + bcaPaymentUsdAmount;

    form.append('unit_transaction_billing_id', String(payload.unit_transaction_billing_id));
    form.append('bca_payment_amount', String(bcaPaymentAmount));
    form.append('cash_payment_amount', String(cashPaymentAmount));
    form.append('bca_payment_usd_amount', String(bcaPaymentUsdAmount));

    // Compatibility aliases for backend variants.
    form.append('bca_payment', String(bcaPaymentAmount));
    form.append('cash_payment', String(cashPaymentAmount));
    form.append('bca_payment_2', String(bcaPaymentUsdAmount));
    form.append('bca_usd_payment', String(bcaPaymentUsdAmount));

    form.append('payment', String(totalPayment));
    form.append('payment_amount', String(totalPayment));
    form.append('amount', String(totalPayment));
    form.append('total_payment', String(totalPayment));
    form.append('total_paid', String(totalPayment));
    form.append('paid_total', String(totalPayment));

    form.append('payment_at', payload.payment_at);
    form.append('payment_date', payload.payment_at);
    if (payload.note) form.append('note', payload.note);

    const response = await apiClient.post<LaravelApiResponse<UnitBillingHistoryApiModel>>(historyBasePath, form);
    const data = ensureSuccess(response.data);
    return mapBillingHistory(data as UnitBillingHistoryApiModel);
  },

  async getBillingById(id: string): Promise<UnitBilling> {
    const response = await apiClient.get<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`);
    const payload = ensureSuccess(response.data);
    return mapBilling(payload as UnitBillingApiModel);
  },

  async createBilling(payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
    const response = await apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(basePath, toFormData(payload));
=======
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
    const data = ((payload as any)?.data ? (payload as any).data : payload) as UnitBillingApiModel;
    return mapBilling(data);
  },

  async createBilling(payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(legacyBasePath, toFormData(payload)),
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(basePath, toFormData(payload)),
    );
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },

  async updateBilling(id: string, payload: UpsertUnitBillingPayload): Promise<UnitBilling> {
<<<<<<< HEAD
    const response = await apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`, toFormData(payload, true));
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },
};
=======
    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${legacyBasePath}/${id}`, toFormData(payload, true)),
      () => apiClient.post<LaravelApiResponse<UnitBillingApiModel>>(`${basePath}/${id}`, toFormData(payload, true)),
    );
    const data = ensureSuccess(response.data);
    return mapBilling(data as UnitBillingApiModel);
  },
};
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
