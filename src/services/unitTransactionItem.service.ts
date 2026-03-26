import { PaginationParams } from '@/@types/pagination.types';
import {
  CreateUnitTransactionItemPayload,
  UnitTransactionItem,
  UnitTransactionItemListResponse,
  UpdateUnitTransactionItemPayload,
} from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

type UnitTransactionItemApiModel = {
  id?: number | string;
  unit_transaction_id?: number | string;
  unit_type_id?: number | string;
  sparepart_id?: number | string;
  qty_total?: number | string;
  price?: number | string;
  bbn_price?: number | string;
  expedition_fee?: number | string;
  other_fee?: number | string;
  dpp_total_price?: number | string;
  ppn_total_price?: number | string;
};

const basePath = '/wapi/transaction/unit-transaction-item';
const legacyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-item';

const toNumber = (value: number | string | undefined): number => Number(value ?? 0);
const toIntegerString = (value: number | string | undefined): string => String(Math.trunc(Number(value ?? 0)));
const toDecimalString = (value: number | string | undefined): string => Number(value ?? 0).toFixed(2);
const shouldFallback = (error: any): boolean => {
  const statusCode = error?.statusCode ?? error?.response?.status;
  return statusCode === 404 || statusCode === 405;
};

const withPathFallback = async <T>(primary: () => Promise<T>, legacy: () => Promise<T>): Promise<T> => {
  try {
    return await primary();
  } catch (error) {
    if (!shouldFallback(error)) throw error;
    return legacy();
  }
};

const mapItem = (item: UnitTransactionItemApiModel): UnitTransactionItem => ({
  id: String(item.id ?? ''),
  unit_transaction_id: String(item.unit_transaction_id ?? ''),
  unit_type_id: item.unit_type_id !== undefined ? String(item.unit_type_id) : undefined,
  sparepart_id: item.sparepart_id !== undefined ? String(item.sparepart_id) : undefined,
  qty_total: toNumber(item.qty_total),
  price: toNumber(item.price),
  bbn_price: toNumber(item.bbn_price),
  expedition_fee: toNumber(item.expedition_fee),
  other_fee: toNumber(item.other_fee),
  dpp_total_price: toNumber(item.dpp_total_price),
  ppn_total_price: toNumber(item.ppn_total_price),
});

export const unitTransactionItemService = {
  async getItems(purchaseId: string, params: PaginationParams = {}): Promise<UnitTransactionItemListResponse> {
    const response = await withPathFallback(
      () =>
        apiClient.get<LaravelApiResponse<any>>(basePath, {
          params: {
            unit_transaction_id: purchaseId,
            page: params.page ?? 1,
            per_page: params.perPage ?? 50,
          },
        }),
      () =>
        apiClient.get<LaravelApiResponse<any>>(legacyBasePath, {
          params: {
            unit_transaction_id: purchaseId,
            page: params.page ?? 1,
            per_page: params.perPage ?? 50,
          },
        }),
    );

    const payload = ensureSuccess(response.data);

    if (Array.isArray(payload)) {
      return {
        data: payload.map((item: UnitTransactionItemApiModel) => mapItem(item)),
        meta: {
          currentPage: 1,
          perPage: payload.length || 1,
          total: payload.length,
          lastPage: 1,
        },
      };
    }

    if (Array.isArray(payload?.data)) {
      return toPaginatedResult(payload, mapItem);
    }

    if (Array.isArray(payload?.data?.data)) {
      return toPaginatedResult(payload.data, mapItem);
    }

    return {
      data: [],
      meta: {
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1,
      },
    };
  },

  async createItem(payload: CreateUnitTransactionItemPayload): Promise<UnitTransactionItem> {
    const form = new FormData();
    form.append('unit_transaction_id', toIntegerString(payload.unit_transaction_id));
    if (payload.unit_type_id) form.append('unit_type_id', toIntegerString(payload.unit_type_id));
    if (payload.sparepart_id) form.append('sparepart_id', toIntegerString(payload.sparepart_id));
    form.append('qty_total', toIntegerString(payload.qty_total));
    form.append('price', toDecimalString(payload.price));
    form.append('bbn_price', toDecimalString(payload.bbn_price));
    form.append('expedition_fee', toDecimalString(payload.expedition_fee));
    form.append('other_fee', toDecimalString(payload.other_fee));
    form.append('stock_state', 'draft');

    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitTransactionItemApiModel>>(basePath, form),
      () => apiClient.post<LaravelApiResponse<UnitTransactionItemApiModel>>(legacyBasePath, form),
    );
    const data = ensureSuccess(response.data);
    return mapItem(data);
  },

  async updateItem(id: string, payload: UpdateUnitTransactionItemPayload): Promise<UnitTransactionItem> {
    const form = new FormData();
    form.append('unit_transaction_id', toIntegerString(payload.unit_transaction_id));
    if (payload.unit_type_id) form.append('unit_type_id', toIntegerString(payload.unit_type_id));
    if (payload.sparepart_id) form.append('sparepart_id', toIntegerString(payload.sparepart_id));
    form.append('qty_total', toIntegerString(payload.qty_total));
    form.append('price', toDecimalString(payload.price));
    form.append('bbn_price', toDecimalString(payload.bbn_price));
    form.append('expedition_fee', toDecimalString(payload.expedition_fee));
    form.append('other_fee', toDecimalString(payload.other_fee));
    form.append('stock_state', 'draft');
    form.append('_method', 'PUT');

    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<UnitTransactionItemApiModel>>(`${basePath}/${id}`, form),
      () => apiClient.post<LaravelApiResponse<UnitTransactionItemApiModel>>(`${legacyBasePath}/${id}`, form),
    );
    const data = ensureSuccess(response.data);
    return mapItem(data);
  },

  async deleteItem(id: string): Promise<void> {
    await withPathFallback(
      () => apiClient.delete<LaravelApiResponse<null>>(`${basePath}/${id}`),
      () => apiClient.delete<LaravelApiResponse<null>>(`${legacyBasePath}/${id}`),
    );
  },

  async bulkDelete(id: string): Promise<void> {
    await withPathFallback(
      () => apiClient.delete<LaravelApiResponse<null>>(`${basePath}/transcation-item-detail-bulk-delete/${id}`),
      () => apiClient.delete<LaravelApiResponse<null>>(`${legacyBasePath}/transcation-item-detail-bulk-delete/${id}`),
    );
  },
};
