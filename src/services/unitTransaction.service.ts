import { PaginationParams } from '@/@types/pagination.types';
import { UnitTransaction, UnitTransactionDetail, UnitTransactionResponse } from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

type UnitTransactionApiModel = {
  id?: number | string;
  person_id?: number | string;
  warehouse_id?: number | string;
  code?: string;
  created_at?: string;
  stock_state?: string;
  transaction_bruto_total?: string | number;
  transaction_dpp_total?: string | number;
  transaction_ppn_total?: string | number;
  transaction_bbn_total?: string | number;
  transaction_other_fee?: string | number;
  person?: {
    id?: number | string;
    name?: string;
  };
  warehouse?: {
    id?: number | string;
    name?: string;
  };
  unit_transaction_item_total_dpp?: string | number;
  unit_transaction_item_total_ppn?: string | number;
  unit_transaction_item_bruto_total?: string | number;
  unit_transaction_billing?: {
    is_paid?: boolean;
    payment_at?: string | null;
  } | null;
};

const basePath = '/wapi/transaction/unit-transaction/unit-transaction';
const fallbackBasePath = '/wapi/transaction/unit-transaction';

const toNumber = (value: string | number | undefined): number => Number(value ?? 0);

const readErrorMessage = (error: any): string => {
  const raw = error?.message ?? error?.response?.data?.message ?? error?.response?.data?.errors;
  return String(raw ?? '').toLowerCase();
};

const shouldFallback = (error: any): boolean => {
  const statusCode = error?.statusCode ?? error?.response?.status;
  const message = readErrorMessage(error);
  const hasKnownNullRelationBug =
    message.includes('attempt to read property') &&
    (message.includes('"is_paid"') || message.includes("'is_paid'") || message.includes('is_paid'));

  return statusCode === 404 || statusCode === 405 || statusCode === 500 || hasKnownNullRelationBug;
};

const mapUnitTransaction = (item: UnitTransactionApiModel): UnitTransaction => ({
  id: String(item.id ?? ''),
  code: item.code ?? '-',
  created_at: item.created_at ?? '',
  supplier: item.person?.name ?? '-',
  warehouse: item.warehouse?.name ?? '-',
  transaction_bruto_total: toNumber(item.transaction_bruto_total),
  transaction_dpp_total: toNumber(item.transaction_dpp_total),
  transaction_ppn_total: toNumber(item.transaction_ppn_total),
  transaction_bbn_total: toNumber(item.transaction_bbn_total),
  transaction_other_fee: toNumber(item.transaction_other_fee),
  stock_state: item.stock_state ?? '-',
  unit_transaction_billing: item.unit_transaction_billing ?? null,
  isPaid: Boolean(item.unit_transaction_billing?.is_paid),
  paymentAt: item.unit_transaction_billing?.payment_at ?? null,
});

const mapUnitTransactionDetail = (item: UnitTransactionApiModel): UnitTransactionDetail => ({
  id: String(item.id ?? ''),
  code: item.code ?? '-',
  created_at: item.created_at ?? '',
  stock_state: item.stock_state ?? '-',
  person: {
    id: String(item.person?.id ?? item.person_id ?? ''),
    name: item.person?.name ?? '-',
  },
  warehouse: {
    id: String(item.warehouse?.id ?? item.warehouse_id ?? ''),
    name: item.warehouse?.name ?? '-',
  },
  unit_transaction_item_total_dpp: toNumber(item.unit_transaction_item_total_dpp ?? item.transaction_dpp_total),
  unit_transaction_item_total_ppn: toNumber(item.unit_transaction_item_total_ppn ?? item.transaction_ppn_total),
  unit_transaction_item_bruto_total: toNumber(item.unit_transaction_item_bruto_total ?? item.transaction_bruto_total),
});

export const unitTransactionService = {
  async getUnitTransactions(params: PaginationParams = {}): Promise<UnitTransactionResponse> {
    const requestParams = {
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      search: params.search || undefined,
      sort_order: 'asc',
      type: 'purchase',
    };

    let payload: any;
    try {
      const response = await apiClient.get<LaravelApiResponse<any>>(basePath, { params: requestParams });
      payload = ensureSuccess(response.data);
    } catch (error) {
      if (!shouldFallback(error)) throw error;
      const response = await apiClient.get<LaravelApiResponse<any>>(fallbackBasePath, { params: requestParams });
      payload = ensureSuccess(response.data);
    }

    return toPaginatedResult(payload, mapUnitTransaction);
  },

  async getUnitTransactionDetail(id: string): Promise<UnitTransactionDetail> {
    let payload: UnitTransactionApiModel | { data?: UnitTransactionApiModel };
    try {
      const response = await apiClient.get<LaravelApiResponse<UnitTransactionApiModel>>(`${basePath}/${id}`);
      payload = ensureSuccess(response.data);
    } catch (error) {
      if (!shouldFallback(error)) throw error;
      const response = await apiClient.get<LaravelApiResponse<UnitTransactionApiModel>>(`${fallbackBasePath}/${id}`);
      payload = ensureSuccess(response.data);
    }

    const detailPayload = ((payload as any)?.data ? ((payload as any).data as UnitTransactionApiModel) : (payload as UnitTransactionApiModel)) ?? ({} as UnitTransactionApiModel);
    return mapUnitTransactionDetail(detailPayload);
  },
};
