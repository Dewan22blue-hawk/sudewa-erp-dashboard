import { PaginationParams } from '@/@types/pagination.types';
import {
  CreateUnitItemDetailPayload,
  UnitTransactionItemDetail,
  UnitTransactionItemDetailListResponse,
  UnitTransactionItemSummary,
  UpdateUnitItemDetailPayload,
} from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

type UnitTransactionItemApiModel = {
  id?: string | number;
  unit_transaction_id?: string | number;
  unit_type_id?: string | number;
  qty_total?: string | number;
  price?: string | number;
  bbn_price?: string | number;
  expedition_fee?: string | number;
  other_fee?: string | number;
  hpp_per_unit_price?: string | number;
  dpp_per_unit_price?: string | number;
  ppn_per_unit_price?: string | number;
  hpp_total_price?: string | number;
  dpp_total_price?: string | number;
  ppn_total_price?: string | number;
  unit_transaction?: {
    id?: string | number;
    code?: string;
  };
};

type UnitTransactionItemDetailApiModel = {
  id?: string | number;
  unit_transaction_item_id?: string | number;
  color?: string;
  machine_number?: string;
  chassis_number?: string;
  in_stock?: boolean | number | string;
  created_at?: string;
};

const itemBasePath = '/wapi/transaction/unit-transaction-item';
const itemLegacyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-item';
const detailBasePath = '/wapi/transaction/unit-transaction-item-detail';
const detailLegacyBasePath = '/wapi/transaction/unit-transaction/unit-transaction-item-detail';

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

const toNumber = (value: string | number | undefined): number => Number(value ?? 0);
const toIdString = (value: string | number | undefined): string => String(value ?? '');
const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
};
const mapUnitTransactionItem = (item: UnitTransactionItemApiModel): UnitTransactionItemSummary => ({
  id: String(item.id ?? ''),
  unit_transaction_id: String(item.unit_transaction_id ?? item.unit_transaction?.id ?? ''),
  unit_transaction_code: item.unit_transaction?.code,
  unit_type_id: item.unit_type_id !== undefined ? String(item.unit_type_id) : undefined,
  qty_total: toNumber(item.qty_total),
  price: toNumber(item.price),
  bbn_price: toNumber(item.bbn_price),
  expedition_fee: toNumber(item.expedition_fee),
  other_fee: toNumber(item.other_fee),
  hpp_per_unit_price: toNumber(item.hpp_per_unit_price),
  dpp_per_unit_price: toNumber(item.dpp_per_unit_price),
  ppn_per_unit_price: toNumber(item.ppn_per_unit_price),
  hpp_total_price: toNumber(item.hpp_total_price),
  dpp_total_price: toNumber(item.dpp_total_price),
  ppn_total_price: toNumber(item.ppn_total_price),
});

const mapItemDetail = (item: UnitTransactionItemDetailApiModel): UnitTransactionItemDetail => ({
  id: String(item.id ?? ''),
  unit_transaction_item_id: String(item.unit_transaction_item_id ?? ''),
  color: item.color ?? '-',
  machine_number: item.machine_number ?? '-',
  chassis_number: item.chassis_number ?? '-',
  in_stock: toBool(item.in_stock),
  created_at: item.created_at,
});

export const unitItemDetailService = {
  async getUnitTransactionItemById(id: string): Promise<UnitTransactionItemSummary> {
    const response = await withPathFallback(
      () => apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(`${itemLegacyBasePath}/${id}`),
      () => apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(`${itemBasePath}/${id}`),
    );

    const payload = ensureSuccess(response.data);
    return mapUnitTransactionItem(payload);
  },

  async getDetails(unitTransactionItemId: string, params: PaginationParams = {}): Promise<UnitTransactionItemDetailListResponse> {
    const requestParams = {
      unit_transaction_item_id: unitTransactionItemId,
      page: params.page ?? 1,
      per_page: params.perPage ?? 50,
    };

    const response = await withPathFallback(
      () =>
        apiClient.get<LaravelApiResponse<any>>(detailLegacyBasePath, {
          params: requestParams,
        }),
      () =>
        apiClient.get<LaravelApiResponse<any>>(detailBasePath, {
          params: requestParams,
        }),
    );

    const payload = ensureSuccess(response.data);

    if (Array.isArray(payload)) {
      return {
        data: payload.map((item: UnitTransactionItemDetailApiModel) => mapItemDetail(item)),
        meta: {
          currentPage: 1,
          perPage: payload.length || 1,
          total: payload.length,
          lastPage: 1,
        },
      };
    }

    if (Array.isArray(payload?.data)) {
      return toPaginatedResult(payload, mapItemDetail);
    }

    if (Array.isArray(payload?.data?.data)) {
      return toPaginatedResult(payload.data, mapItemDetail);
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

  async createDetail(payload: CreateUnitItemDetailPayload): Promise<UnitTransactionItemDetail> {
    const body = new URLSearchParams();
    body.append('unit_transaction_item_id', toIdString(payload.unit_transaction_item_id));
    body.append('color', payload.color);
    body.append('machine_number', payload.machine_number);
    body.append('chassis_number', payload.chassis_number);

    const response = await withPathFallback(
      () =>
        apiClient.post<LaravelApiResponse<UnitTransactionItemDetailApiModel>>(detailLegacyBasePath, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      () =>
        apiClient.post<LaravelApiResponse<UnitTransactionItemDetailApiModel>>(detailBasePath, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
    );

    const data = ensureSuccess(response.data);
    return mapItemDetail(data);
  },

  async updateDetail(id: string, payload: UpdateUnitItemDetailPayload): Promise<UnitTransactionItemDetail> {
    const body = new URLSearchParams();
    body.append('unit_transaction_item_id', toIdString(payload.unit_transaction_item_id));
    body.append('color', payload.color);
    body.append('machine_number', payload.machine_number);
    body.append('chassis_number', payload.chassis_number);

    const response = await withPathFallback(
      () =>
        apiClient.put<LaravelApiResponse<UnitTransactionItemDetailApiModel>>(`${detailLegacyBasePath}/${id}`, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      () =>
        apiClient.put<LaravelApiResponse<UnitTransactionItemDetailApiModel>>(`${detailBasePath}/${id}`, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
    );

    const data = ensureSuccess(response.data);
    return mapItemDetail(data);
  },

  async deleteDetail(id: string): Promise<void> {
    await withPathFallback(
      () => apiClient.delete<LaravelApiResponse<null>>(`${detailLegacyBasePath}/${id}`),
      () => apiClient.delete<LaravelApiResponse<null>>(`${detailBasePath}/${id}`),
    );
  },

  async importDetails(unitTransactionItemId: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);

    await withPathFallback(
      () => apiClient.post<LaravelApiResponse<any>>(`${detailLegacyBasePath}/${unitTransactionItemId}/import`, form),
      () => apiClient.post<LaravelApiResponse<any>>(`${detailBasePath}/${unitTransactionItemId}/import`, form),
    );
  },
};
