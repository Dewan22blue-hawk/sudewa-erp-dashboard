import { PaginationParams } from '@/@types/pagination.types';
import {
  CreateUnitTransactionItemPayload,
  UnitTransactionItem,
  UnitTransactionItemListResponse,
  UpdateUnitTransactionItemPayload,
} from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ApiResponseError, ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

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

const readErrorMessage = (error: any): string => {
  const raw = error?.message ?? error?.response?.data?.message ?? error?.response?.data?.errors;
  return String(raw ?? '').toLowerCase();
};

const shouldFallback = (error: any): boolean => {
  const statusCode = error?.statusCode ?? error?.response?.status;
  const message = readErrorMessage(error);

  // Some backend handlers can crash when a billing relation is null.
  // In that case, retry through legacy endpoint which is more stable.
    const hasKnownNullRelationBug =
      message.includes('attempt to read property') &&
      (message.includes('"is_paid"') || message.includes("'is_paid'") || message.includes('is_paid'));

  return statusCode === 404 || statusCode === 405 || hasKnownNullRelationBug;
};

  const isKnownNullRelationBug = (error: any): boolean => {
    const message = readErrorMessage(error);
    return message.includes('attempt to read property') && message.includes('is_paid');
  };

  const isSameNumber = (a: number, b: number): boolean => Math.abs(a - b) < 0.000001;

  const isPayloadPersisted = (serverData: UnitTransactionItem, payload: UpdateUnitTransactionItemPayload): boolean => {
    if (payload.unit_type_id !== undefined && String(serverData.unit_type_id ?? '') !== String(payload.unit_type_id)) return false;
    if (payload.qty_total !== undefined && !isSameNumber(Number(serverData.qty_total ?? 0), Number(payload.qty_total ?? 0))) return false;
    if (payload.price !== undefined && !isSameNumber(Number(serverData.price ?? 0), Number(payload.price ?? 0))) return false;
    if (payload.bbn_price !== undefined && !isSameNumber(Number(serverData.bbn_price ?? 0), Number(payload.bbn_price ?? 0))) return false;
    if (payload.expedition_fee !== undefined && !isSameNumber(Number(serverData.expedition_fee ?? 0), Number(payload.expedition_fee ?? 0))) return false;
    if (payload.other_fee !== undefined && !isSameNumber(Number(serverData.other_fee ?? 0), Number(payload.other_fee ?? 0))) return false;

    return true;
  };

  const verifyUpdatedItemFromServer = async (id: string, payload: UpdateUnitTransactionItemPayload): Promise<UnitTransactionItem | null> => {
    const fetchFrom = async (path: string): Promise<UnitTransactionItem> => {
      const response = await apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(path);
      const data = ensureSuccess(response.data);
      return mapItem(data);
    };

    try {
      const serverData = await fetchFrom(`${legacyBasePath}/${id}`);
      return isPayloadPersisted(serverData, payload) ? serverData : null;
    } catch (legacyError) {
      if (!shouldFallback(legacyError)) throw legacyError;
    }

    try {
      const serverData = await fetchFrom(`${basePath}/${id}`);
      return isPayloadPersisted(serverData, payload) ? serverData : null;
    } catch {
      return null;
    }
  };

  const verifyUpdatedItemFromList = async (id: string, payload: UpdateUnitTransactionItemPayload): Promise<UnitTransactionItem | null> => {
    const requestParams = {
      unit_transaction_id: String(payload.unit_transaction_id),
      page: 1,
      per_page: 200,
    };

    try {
      const response = await apiClient.get<LaravelApiResponse<any>>(legacyBasePath, { params: requestParams });
      const listPayload = ensureSuccess(response.data);
      const list = Array.isArray(listPayload?.data) ? listPayload.data : Array.isArray(listPayload) ? listPayload : [];
      const found = list.find((item: any) => String(item?.id ?? '') === String(id));
      if (!found) return null;
      const mapped = mapItem(found as UnitTransactionItemApiModel);
      return isPayloadPersisted(mapped, payload) ? mapped : null;
    } catch {
      return null;
    }
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
    let payload: any;
    try {
      const response = await apiClient.get<LaravelApiResponse<any>>(legacyBasePath, {
        params: {
          unit_transaction_id: purchaseId,
          page: params.page ?? 1,
          per_page: params.perPage ?? 50,
        },
      });
      payload = ensureSuccess(response.data);
    } catch (error) {
      if (!shouldFallback(error)) throw error;
      const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
        params: {
          unit_transaction_id: purchaseId,
          page: params.page ?? 1,
          per_page: params.perPage ?? 50,
        },
      });
      payload = ensureSuccess(response.data);
    }

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

    let data: UnitTransactionItemApiModel;
    try {
      const response = await apiClient.post<LaravelApiResponse<UnitTransactionItemApiModel>>(basePath, form);
      data = ensureSuccess(response.data);
    } catch (error) {
      if (!shouldFallback(error)) throw error;
      const response = await apiClient.post<LaravelApiResponse<UnitTransactionItemApiModel>>(legacyBasePath, form);
      data = ensureSuccess(response.data);
    }

    return mapItem(data);
  },

  async updateItem(id: string, payload: UpdateUnitTransactionItemPayload): Promise<UnitTransactionItem> {
    const buildUrlEncodedPayload = (): URLSearchParams => {
      const params = new URLSearchParams();
      params.append('unit_transaction_id', toIntegerString(payload.unit_transaction_id));
      if (payload.unit_type_id) params.append('unit_type_id', toIntegerString(payload.unit_type_id));
      if (payload.sparepart_id) params.append('sparepart_id', toIntegerString(payload.sparepart_id));
      if (payload.qty_total !== undefined) params.append('qty_total', toIntegerString(payload.qty_total));
      if (payload.price !== undefined) params.append('price', toDecimalString(payload.price));
      if (payload.bbn_price !== undefined) params.append('bbn_price', toDecimalString(payload.bbn_price));
      if (payload.expedition_fee !== undefined) params.append('expedition_fee', toDecimalString(payload.expedition_fee));
      if (payload.other_fee !== undefined) params.append('other_fee', toDecimalString(payload.other_fee));
      return params;
    };

    const tryEnsure = (response: { data: LaravelApiResponse<UnitTransactionItemApiModel> }) => ensureSuccess(response.data);

    const resolvePersistedResult = async (apiModel: UnitTransactionItemApiModel): Promise<UnitTransactionItem> => {
      const mapped = mapItem(apiModel);
      if (isPayloadPersisted(mapped, payload)) return mapped;

      const verified = await verifyUpdatedItemFromServer(id, payload);
      if (verified) return verified;

      throw new ApiResponseError('Update belum tersimpan di server. Silakan coba lagi.');
    };

    const handleKnownNullBug = async (error: any): Promise<UnitTransactionItem | null> => {
      if (!isKnownNullRelationBug(error)) return null;

      const verified = await verifyUpdatedItemFromServer(id, payload);
      if (verified) return verified;
      const verifiedFromList = await verifyUpdatedItemFromList(id, payload);
      if (verifiedFromList) return verifiedFromList;

      // Backend likely updated data but failed while serializing response (is_paid null bug).
      return mapItem({
        id,
        unit_transaction_id: payload.unit_transaction_id,
        unit_type_id: payload.unit_type_id,
        sparepart_id: payload.sparepart_id,
        qty_total: payload.qty_total,
        price: payload.price,
        bbn_price: payload.bbn_price,
        expedition_fee: payload.expedition_fee,
        other_fee: payload.other_fee,
      });
    };

    try {
      // Match backend contract proven working in Postman.
      const legacyPut = await apiClient.put<LaravelApiResponse<UnitTransactionItemApiModel>>(
        `${legacyBasePath}/${id}`,
        buildUrlEncodedPayload(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      return await resolvePersistedResult(tryEnsure(legacyPut));
    } catch (legacyPutError) {
      const handledLegacyPut = await handleKnownNullBug(legacyPutError);
      if (handledLegacyPut) return handledLegacyPut;
      throw legacyPutError;
    }
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
