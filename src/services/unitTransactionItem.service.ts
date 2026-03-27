import { PaginationParams } from '@/@types/pagination.types';
import {
  CreateUnitTransactionItemPayload,
  UnitTransactionItem,
  UnitTransactionItemListResponse,
  UpdateUnitTransactionItemPayload,
} from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponseError,
  ensureSuccess,
  LaravelApiResponse,
  toPaginatedResult,
} from '@/lib/api/response';

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

// ======================
// UTILS
// ======================

const toNumber = (value: number | string | undefined): number =>
  Number(value ?? 0);

const toIntegerString = (value: number | string | undefined): string =>
  String(Math.trunc(Number(value ?? 0)));

const toDecimalString = (value: number | string | undefined): string =>
  Number(value ?? 0).toFixed(2);

const appendIfDefined = (
  form: FormData,
  key: string,
  value: any,
  formatter?: (v: any) => string
) => {
  if (value !== undefined && value !== null) {
    form.append(key, formatter ? formatter(value) : String(value));
  }
};

// ======================
// MAPPER
// ======================

const mapItem = (item: UnitTransactionItemApiModel): UnitTransactionItem => ({
  id: String(item.id ?? ''),
  unit_transaction_id: String(item.unit_transaction_id ?? ''),
  unit_type_id:
    item.unit_type_id !== undefined
      ? String(item.unit_type_id)
      : undefined,
  sparepart_id:
    item.sparepart_id !== undefined
      ? String(item.sparepart_id)
      : undefined,
  qty_total: toNumber(item.qty_total),
  price: toNumber(item.price),
  bbn_price: toNumber(item.bbn_price),
  expedition_fee: toNumber(item.expedition_fee),
  other_fee: toNumber(item.other_fee),
  dpp_total_price: toNumber(item.dpp_total_price),
  ppn_total_price: toNumber(item.ppn_total_price),
});

// ======================
// SERVICE
// ======================

export const unitTransactionItemService = {
  // ======================
  // GET ITEMS
  // ======================
  async getItems(
    purchaseId: string,
    params: PaginationParams = {}
  ): Promise<UnitTransactionItemListResponse> {
    const response = await apiClient.get<LaravelApiResponse<any>>(
      legacyBasePath,
      {
        params: {
          unit_transaction_id: purchaseId,
          page: params.page ?? 1,
          per_page: params.perPage ?? 50,
        },
      }
    );

    const payload = ensureSuccess(response.data);

    if (Array.isArray(payload)) {
      return {
        data: payload.map(mapItem),
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

  // ======================
  // CREATE ITEM
  // ======================
  async createItem(
    payload: CreateUnitTransactionItemPayload
  ): Promise<UnitTransactionItem> {
    const form = new FormData();

    form.append(
      'unit_transaction_id',
      toIntegerString(payload.unit_transaction_id)
    );
    form.append(
      'unit_type_id',
      toIntegerString(payload.unit_type_id)
    );

    appendIfDefined(
      form,
      'sparepart_id',
      payload.sparepart_id,
      toIntegerString
    );
    appendIfDefined(
      form,
      'qty_total',
      payload.qty_total,
      toIntegerString
    );
    appendIfDefined(form, 'price', payload.price, toDecimalString);
    appendIfDefined(
      form,
      'bbn_price',
      payload.bbn_price,
      toDecimalString
    );
    appendIfDefined(
      form,
      'expedition_fee',
      payload.expedition_fee,
      toDecimalString
    );
    appendIfDefined(
      form,
      'other_fee',
      payload.other_fee,
      toDecimalString
    );

    const response = await apiClient.post<
      LaravelApiResponse<UnitTransactionItemApiModel>
    >(legacyBasePath, form);

    return mapItem(ensureSuccess(response.data));
  },

  // ======================
  // UPDATE ITEM (FIXED)
  // ======================
async updateItem(
  id: string,
  payload: UpdateUnitTransactionItemPayload
): Promise<UnitTransactionItem> {
  const params = new URLSearchParams();

  // iki tak hapus karena di backendnya gak butuh, tapi kalo ternyata butuh tinggal di uncomment aja
  // params.append('unit_transaction_id', ...)

  if (payload.unit_type_id !== undefined) {
    params.append('unit_type_id', String(payload.unit_type_id));
  }

  if (payload.qty_total !== undefined) {
    params.append('qty_total', String(payload.qty_total));
  }

  if (payload.price !== undefined) {
    params.append('price', Number(payload.price).toFixed(2));
  }

  if (payload.bbn_price !== undefined) {
    params.append('bbn_price', Number(payload.bbn_price).toFixed(2));
  }

  if (payload.expedition_fee !== undefined) {
    params.append('expedition_fee', Number(payload.expedition_fee).toFixed(2));
  }

  if (payload.other_fee !== undefined) {
    params.append('other_fee', Number(payload.other_fee).toFixed(2));
  }

  const response = await apiClient.put(
    `/wapi/transaction/unit-transaction/unit-transaction-item/${id}`,
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return mapItem(ensureSuccess(response.data));
},

  // ======================
  // DELETE
  // ======================
  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`${legacyBasePath}/${id}`);
  },

  // ======================
  // BULK DELETE
  // ======================
  async bulkDelete(id: string): Promise<void> {
    await apiClient.delete(
      `${legacyBasePath}/transcation-item-detail-bulk-delete/${id}`
    );
  },
};