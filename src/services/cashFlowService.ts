import type { CashFlowFilterParams, CashFlowItemResponse, CashFlowListResponse, CashFlowListResult, CashFlowPayload, KasHarian } from '@/@types/kas-harian.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, mapLaravelPaginationMeta, type LaravelApiResponse } from '@/lib/api/response';

const BASE_PATH = '/wapi/finance/cash-flow';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeCashFlow = (payload: Partial<KasHarian>): KasHarian => ({
  id: toNumber(payload.id),
  code: payload.code ?? '-',
  date: payload.date ?? '',
  note: payload.note ?? '',
  debet: toNumber(payload.debet),
  credit: toNumber(payload.credit),
  cash: {
    id: toNumber(payload.cash?.id),
    description: payload.cash?.description ?? '-',
    type: payload.cash?.type ?? '-',
  },
  company: {
    id: toNumber(payload.company?.id),
    name: payload.company?.name ?? '-',
  },
});

const toSuccessPayload = <T>(payload: { status: boolean; message?: string; errors: Record<string, string[]> | null; data: T }) =>
  ({
    ...payload,
    errors: payload.errors ?? undefined,
  }) as unknown as LaravelApiResponse<T>;

export async function fetchCashFlow(params: CashFlowFilterParams = {}): Promise<CashFlowListResult> {
  const response = await apiClient.get<CashFlowListResponse>(BASE_PATH, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      code: params.code || undefined,
      supplier: params.supplier || undefined,
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

export async function createCashFlow(payload: CashFlowPayload) {
  const formData = new FormData();
  formData.append('company_id', String(payload.company_id));
  formData.append('cash_id', String(payload.cash_id));
  formData.append('date', payload.date);
  formData.append('note', payload.note);
  formData.append('debet', String(payload.debet));
  formData.append('credit', String(payload.credit));

  const response = await apiClient.post<CashFlowItemResponse>(BASE_PATH, formData);
  const item = ensureSuccess(toSuccessPayload(response.data));
  return normalizeCashFlow(item);
}

export async function updateCashFlow(id: number | string, payload: CashFlowPayload) {
  const body = new URLSearchParams();
  body.set('company_id', String(payload.company_id));
  body.set('cash_id', String(payload.cash_id));
  body.set('date', payload.date);
  body.set('note', payload.note);
  body.set('debet', String(payload.debet));
  body.set('credit', String(payload.credit));

  const response = await apiClient.put<CashFlowItemResponse>(`${BASE_PATH}/${id}`, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const item = ensureSuccess(toSuccessPayload(response.data));
  return normalizeCashFlow(item);
}

export async function deleteCashFlow(id: number | string) {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
