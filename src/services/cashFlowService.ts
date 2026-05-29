import type {
  CashFlowFilterParams,
  CashFlowItemResponse,
  CashFlowListResponse,
  CashFlowListResult,
  CashFlowPayload,
  KasHarian,
} from '@/@types/kas-harian.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, mapLaravelPaginationMeta, type LaravelApiResponse } from '@/lib/api/response';

const BASE_PATH = '/wapi/finance/cash-flow';

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};

const normalizeCashFlow = (payload: Partial<KasHarian>): KasHarian => ({
  id: toNumber(payload.id),
  uuid: payload.uuid,
  company_id: toNumber(payload.company_id),
  cash_id: toNumber(payload.cash_id),
  account_id: payload.account_id == null ? null : toNumber(payload.account_id),
  unit_transaction_billing_history_id:
    payload.unit_transaction_billing_history_id == null ? null : toNumber(payload.unit_transaction_billing_history_id),
  code: payload.code ?? '-',
  date: payload.date ?? '',
  note: payload.note ?? '',
  debet: toNumber(payload.debet),
  credit: toNumber(payload.credit),
  created_at: payload.created_at ?? '',
  updated_at: payload.updated_at ?? '',
  cash: {
    id: toNumber(payload.cash?.id),
    uuid: payload.cash?.uuid,
    code: payload.cash?.code ?? '-',
    description: payload.cash?.description ?? '-',
    type: payload.cash?.type ?? '-',
  },
  account: payload.account
    ? {
        id: toNumber(payload.account.id),
        uuid: payload.account.uuid,
        code: payload.account.code ?? '-',
        name: payload.account.name ?? '-',
        description: payload.account.description ?? null,
      }
    : null,
  company: {
    id: toNumber(payload.company?.id),
    uuid: payload.company?.uuid,
    name: payload.company?.name ?? '-',
  },
  finance_billing: payload.finance_billing
    ? {
        id: toNumber(payload.finance_billing.id),
        uuid: payload.finance_billing.uuid,
        cash_flow_id: toNumber(payload.finance_billing.cash_flow_id),
        unit_transaction_billing_id: toNumber(payload.finance_billing.unit_transaction_billing_id),
        last_payment_at: payload.finance_billing.last_payment_at ?? '',
        grand_total: toNumber(payload.finance_billing.grand_total),
        is_valid: toBoolean(payload.finance_billing.is_valid),
        created_at: payload.finance_billing.created_at ?? '',
        updated_at: payload.finance_billing.updated_at ?? '',
        finance_billing_items: (payload.finance_billing.finance_billing_items ?? []).map((item) => ({
          id: toNumber(item.id),
          finance_billing_id: toNumber(item.finance_billing_id),
          bca_payment_amount: toNumber(item.bca_payment_amount),
          bca_payment_usd_amount: toNumber(item.bca_payment_usd_amount),
          cash_payment_amount: toNumber(item.cash_payment_amount),
          payment_proof: item.payment_proof ?? null,
          payment_at: item.payment_at ?? '',
          note: item.note ?? '',
          created_at: item.created_at ?? '',
          updated_at: item.updated_at ?? '',
        })),
      }
    : null,
});

const toSuccessPayload = <T>(payload: { status: boolean; message?: string; errors: Record<string, string[]> | null; data: T }) =>
  ({
    ...payload,
    errors: payload.errors ?? undefined,
  }) as unknown as LaravelApiResponse<T>;

const buildCashFlowFormData = (payload: CashFlowPayload) => {
  const formData = new FormData();
  formData.append('company_id', String(payload.company_id));
  formData.append('cash_id', String(payload.cash_id));
  formData.append('account_id', String(payload.account_id));
  formData.append('date', payload.date);
  formData.append('note', payload.note);
  formData.append('transaction_category', payload.transaction_category);
  if ((payload.debet ?? 0) > 0) {
    formData.append('debet', String(payload.debet));
  }
  if ((payload.credit ?? 0) > 0) {
    formData.append('credit', String(payload.credit));
  }
  if (payload.payment_proof) {
    formData.append('payment_proof', payload.payment_proof);
  }
  return formData;
};

export async function fetchCashFlow(params: CashFlowFilterParams = {}): Promise<CashFlowListResult> {
  const response = await apiClient.get<CashFlowListResponse>(BASE_PATH, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      company_id: params.company_id || undefined,
      search: params.search || undefined,
      code: params.code || params.search || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
    },
  });

  const payload = ensureSuccess(toSuccessPayload(response.data));

  return {
    data: (payload.data ?? []).map((item) => normalizeCashFlow(item)),
    meta: mapLaravelPaginationMeta(payload),
    hasNextPage: Boolean(payload.next_page_url),
  };
}

export async function fetchCashFlowDetail(id: number | string) {
  const response = await apiClient.get<CashFlowItemResponse>(`${BASE_PATH}/${id}`);
  const payload = ensureSuccess(toSuccessPayload(response.data));
  return normalizeCashFlow(payload);
}

export async function createCashFlow(payload: CashFlowPayload) {
  const response = await apiClient.post<CashFlowItemResponse>(BASE_PATH, buildCashFlowFormData(payload));
  const item = ensureSuccess(toSuccessPayload(response.data));
  return normalizeCashFlow(item);
}

export async function updateCashFlow(id: number | string, payload: CashFlowPayload) {
  const formData = buildCashFlowFormData(payload);
  formData.append('_method', 'PUT');
  const response = await apiClient.post<CashFlowItemResponse>(`${BASE_PATH}/${id}`, formData);
  const item = ensureSuccess(toSuccessPayload(response.data));
  return normalizeCashFlow(item);
}

export async function deleteCashFlow(id: number | string) {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
