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

const normalizeCashFlow = (payload: Partial<KasHarian>): KasHarian => ({
  id: toNumber(payload.id),
  uuid: payload.uuid,
  company_id: toNumber(payload.company_id),
  cash_id: toNumber(payload.cash_id),
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
  company: {
    id: toNumber(payload.company?.id),
    uuid: payload.company?.uuid,
    name: payload.company?.name ?? '-',
  },
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
  formData.append('date', payload.date);
  formData.append('note', payload.note);
  formData.append('debet', String(payload.debet));
  formData.append('credit', String(payload.credit));
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
