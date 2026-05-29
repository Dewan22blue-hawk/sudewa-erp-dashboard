import type {
  PPNPenjualan,
  PPNPenjualanFilterParams,
  PPNPenjualanListResponse,
  PPNPenjualanListResult,
  PPNPenjualanUpdateResponse,
  UnitTransactionItemDetail,
  UnitType,
  UpdatePPNPenjualanMutationPayload,
} from '@/@types/ppn-penjualan.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, mapLaravelPaginationMeta, type LaravelApiResponse } from '@/lib/api/response';

const BASE_PATH = '/wapi/finance/ppn';
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeUnitType = (value: Partial<UnitType> | null | undefined): UnitType => ({
  id: toNumber(value?.id),
  code: value?.code ?? '-',
  name: value?.name ?? '-',
  unit_type: value?.unit_type ?? '-',
  unit_model: value?.unit_model ?? '-',
});

const normalizeUnitDetail = (value: Partial<UnitTransactionItemDetail> | null | undefined): UnitTransactionItemDetail => ({
  id: toNumber(value?.id),
  machine_number: value?.machine_number ?? '-',
  chassis_number: value?.chassis_number ?? '-',
  color: value?.color ?? '-',
});

const normalizePPNPenjualan = (value: Partial<PPNPenjualan>): PPNPenjualan => ({
  id: toNumber(value.id),
  code: value.code ?? '-',
  buy_date: value.buy_date ?? '',
  supplier: value.supplier ?? '-',
  fpm_date: value.fpm_date ?? null,
  nsfpm_age: value.nsfpm_age ?? null,
  nsfpm_input: toNumber(value.nsfpm_input),
  qty: toNumber(value.qty),
  unit_type: normalizeUnitType(value.unit_type),
  unit_transaction_item_detail: normalizeUnitDetail(value.unit_transaction_item_detail),
  unit_price: toNumber(value.unit_price),
  dpp_amount: toNumber(value.dpp_amount),
  ppn_11: toNumber(value.ppn_11),
  payment_amount: toNumber(value.payment_amount),
});

const toSuccessPayload = <T>(payload: { status: boolean; message: string; errors: Record<string, string[]> | null; data: T }) =>
  ({
    ...payload,
    errors: payload.errors ?? undefined,
  }) as unknown as LaravelApiResponse<T>;

export async function getPPNPenjualanList(params: PPNPenjualanFilterParams = {}): Promise<PPNPenjualanListResult> {
  const page = params.page ?? DEFAULT_PAGE;
  const perPage = params.per_page ?? DEFAULT_PER_PAGE;

  const response = await apiClient.get<PPNPenjualanListResponse>(BASE_PATH, {
    params: {
      type: 'ppn_sales',
      page,
      per_page: perPage,
      search: params.search || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
      sort_by: params.sort_by ?? 'buy_date',
      sort_direction: params.sort_direction ?? 'desc',
    },
  });

  const payload = ensureSuccess(toSuccessPayload(response.data));

  return {
    data: (payload.data ?? []).map((item) => normalizePPNPenjualan(item)),
    meta: mapLaravelPaginationMeta(payload),
    hasNextPage: Boolean(payload.next_page_url),
    isTotalExact: true,
  };
}

export async function updatePPNPenjualan({ id, payload }: UpdatePPNPenjualanMutationPayload) {
  const response = await apiClient.put<PPNPenjualanUpdateResponse>(`${BASE_PATH}/${id}`, undefined, {
    params: {
      fpm_date: payload.fpm_date || undefined,
      nsfpm_age: payload.nsfpm_age || undefined,
      nsfp_amount: payload.nsfp_amount ?? undefined,
      amount: payload.amount ?? undefined,
    },
  });

  return ensureSuccess(toSuccessPayload(response.data));
}
