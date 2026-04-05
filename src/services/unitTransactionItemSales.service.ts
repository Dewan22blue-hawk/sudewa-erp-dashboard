import { UnitTransactionItemSalesAssignment, WarehouseStockUnit } from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';

type ItemSalesApiModel = {
  id?: string | number;
  unit_transaction_item_id?: string | number;
  unit_transaction_details?: Array<number | string>;
};

type UnitTransactionItemSalesRelationApiModel = {
  id?: string | number;
  unit_transaction_item_id?: string | number;
  unit_transaction_item_detail_id?: string | number;
};

type UnitTransactionItemApiModel = {
  id?: string | number;
  unit_transaction_id?: string | number;
  unit_type_id?: string | number;
  sparepart_id?: string | number;
  qty_total?: string | number;
  unit_transaction_item_details?: UnitTypeDetailApiModel[];
  unit_transaction_item_sales?: UnitTransactionItemSalesRelationApiModel[];
};

type UnitTypeDetailApiModel = {
  id?: string | number;
  unit_type?: {
    id?: string | number;
  };
  unit_transaction_detail_id?: string | number;
  unit_transaction_item_detail_id?: string | number;
  unit_type_detail_id?: string | number;
  detail_id?: string | number;
  color?: string;
  warna?: string;
  machine_number?: string;
  no_mesin?: string;
  chassis_number?: string;
  no_rangka?: string;
  stock_state?: string;
  status?: string;
  state?: string;
  is_on_hand?: boolean | number | string;
  on_hand?: boolean | number | string;
  is_sold?: boolean | number | string;
  is_available?: boolean | number | string;
  in_stock?: boolean | number | string;
  stock_available?: boolean | number | string;
  stock_forecast?: boolean | number | string;
};

type UnitTypeApiModel = {
  unit_type_details?: UnitTypeDetailApiModel[];
  unit_item_details?: UnitTypeDetailApiModel[];
  unit_transaction_details?: UnitTypeDetailApiModel[];
  details?: UnitTypeDetailApiModel[];
  stock_units?: UnitTypeDetailApiModel[];
  warehouse_stock_units?: UnitTypeDetailApiModel[];
  data?: {
    unit_type_details?: UnitTypeDetailApiModel[];
    unit_item_details?: UnitTypeDetailApiModel[];
    unit_transaction_details?: UnitTypeDetailApiModel[];
    details?: UnitTypeDetailApiModel[];
    stock_units?: UnitTypeDetailApiModel[];
    warehouse_stock_units?: UnitTypeDetailApiModel[];
    data?: {
      unit_type_details?: UnitTypeDetailApiModel[];
      unit_item_details?: UnitTypeDetailApiModel[];
      unit_transaction_details?: UnitTypeDetailApiModel[];
      details?: UnitTypeDetailApiModel[];
      stock_units?: UnitTypeDetailApiModel[];
      warehouse_stock_units?: UnitTypeDetailApiModel[];
    };
  };
};

type WarehouseActivityApiModel = {
  id?: string | number;
  warehouse_activity_id?: string | number;
  data?: {
    id?: string | number;
    warehouse_activity_id?: string | number;
  };
};

const itemSalesBasePath = '/wapi/transaction/unit-transaction/unit-transaction-item-sales';
const itemSalesLegacyPath = '/wapi/transaction/unit-transaction-item-sales';
const unitTransactionItemBasePath = '/wapi/transaction/unit-transaction/unit-transaction-item';
const unitTransactionItemLegacyPath = '/wapi/transaction/unit-transaction-item';
const unitTypeBasePath = '/wapi/master-data/unit-type';
const warehouseUnitDetailsBasePath = '/wapi/warehouse/warehouse-get-unit-transaction-item-details';

const warehouseActivityBasePath = '/wapi/transaction/warehouse-activity';
const warehouseActivityLegacyPath = '/wapi/transaction/unit-transaction/warehouse-activity';

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

const toIdNumber = (value: unknown): number => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
};

const toIdString = (value: unknown): string => String(value ?? '');
const toNumber = (value: unknown): number => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
};
const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
};

const looksLikeDetailRow = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;

  const hasId = ['id', 'unit_transaction_detail_id', 'unit_transaction_item_detail_id', 'unit_type_detail_id', 'detail_id'].some(
    (key) => item[key] !== undefined && item[key] !== null,
  );
  const hasVehicleIdentity = ['machine_number', 'no_mesin', 'chassis_number', 'no_rangka', 'color', 'warna'].some(
    (key) => item[key] !== undefined && item[key] !== null,
  );

  return hasId || hasVehicleIdentity;
};

const isOnHandUnit = (item: UnitTypeDetailApiModel): boolean => {
  const stockAvailableNumber = toNumber(item?.stock_available);
  const stockForecastNumber = toNumber(item?.stock_forecast);
  if (stockAvailableNumber > 0 || stockForecastNumber > 0) {
    return true;
  }

  const hasExplicitAvailability =
    item?.is_available !== undefined || item?.in_stock !== undefined || item?.is_on_hand !== undefined || item?.on_hand !== undefined;

  if (hasExplicitAvailability) {
    return toBool(item?.is_available ?? item?.in_stock ?? item?.is_on_hand ?? item?.on_hand);
  }

  const statusText = String(item?.stock_state ?? item?.status ?? item?.state ?? '')
    .trim()
    .toLowerCase();

  if (!statusText) {
    return !toBool(item?.is_sold);
  }

  return ['on_hand', 'on hand', 'available', 'in_stock', 'in stock', 'ready'].includes(statusText);
};

const normalizeUnitTypeDetails = (payload: any): UnitTypeDetailApiModel[] => {
  const buckets = [
    payload?.unit_type_details,
    payload?.unit_item_details,
    payload?.unit_transaction_details,
    payload?.details,
    payload?.stock_units,
    payload?.warehouse_stock_units,
    payload?.data?.unit_type_details,
    payload?.data?.unit_item_details,
    payload?.data?.unit_transaction_details,
    payload?.data?.details,
    payload?.data?.stock_units,
    payload?.data?.warehouse_stock_units,
    payload?.data?.data?.unit_type_details,
    payload?.data?.data?.unit_item_details,
    payload?.data?.data?.unit_transaction_details,
    payload?.data?.data?.details,
    payload?.data?.data?.stock_units,
    payload?.data?.data?.warehouse_stock_units,
  ];

  for (const bucket of buckets) {
    if (Array.isArray(bucket) && bucket.some(looksLikeDetailRow)) {
      return bucket;
    }
  }

  const walk = (input: any): UnitTypeDetailApiModel[] => {
    if (!input || typeof input !== 'object') return [];

    if (Array.isArray(input)) {
      return input.filter(looksLikeDetailRow);
    }

    for (const value of Object.values(input)) {
      if (!value || typeof value !== 'object') continue;
      const found = walk(value);
      if (found.length > 0) return found;
    }

    return [];
  };

  const deepFound = walk(payload);
  if (deepFound.length > 0) return deepFound;

  return [];
};

const normalizeWarehouseItemDetails = (payload: any): UnitTypeDetailApiModel[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const mapWarehouseStockUnit = (payload: UnitTypeDetailApiModel): WarehouseStockUnit => ({
  id: toIdNumber(
    payload?.id ?? payload?.unit_transaction_detail_id ?? payload?.unit_transaction_item_detail_id ?? payload?.unit_type_detail_id ?? payload?.detail_id,
  ),
  color: String(payload?.color ?? payload?.warna ?? '-'),
  machine_number: String(payload?.machine_number ?? payload?.no_mesin ?? '-'),
  chassis_number: String(payload?.chassis_number ?? payload?.no_rangka ?? '-'),
  in_stock: isOnHandUnit(payload),
});

const appendUnitTransactionDetails = (form: FormData, ids: number[]) => {
  ids.forEach((id) => {
    form.append('unit_transaction_details[]', String(id));
  });
};

const extractWarehouseActivityId = (payload: WarehouseActivityApiModel): string => {
  const candidates = [payload?.warehouse_activity_id, payload?.id, payload?.data?.warehouse_activity_id, payload?.data?.id];
  const resolved = candidates.find((item) => item !== undefined && item !== null && String(item).length > 0);
  return String(resolved ?? '');
};

const mapUnitItem = (payload: UnitTransactionItemApiModel) => ({
  id: toIdString(payload.id),
  unit_transaction_id: toIdString(payload.unit_transaction_id),
  unit_type_id: toIdString(payload.unit_type_id),
  sparepart_id: payload.sparepart_id !== undefined && payload.sparepart_id !== null ? toIdString(payload.sparepart_id) : undefined,
  qty_total: toNumber(payload.qty_total),
  unit_transaction_item_details: (payload.unit_transaction_item_details ?? []).map(mapWarehouseStockUnit).filter((item) => item.id > 0),
  unit_transaction_item_sales: (payload.unit_transaction_item_sales ?? [])
    .map((item) => ({
      id: toIdNumber(item.id),
      unit_transaction_item_id: toIdNumber(item.unit_transaction_item_id),
      unit_transaction_item_detail_id: toIdNumber(item.unit_transaction_item_detail_id),
    }))
    .filter((item) => item.unit_transaction_item_detail_id > 0),
});

export const unitTransactionItemSalesService = {
  async getUnitItemById(unitTransactionItemId: string): Promise<{
    id: string;
    unit_transaction_id: string;
    unit_type_id: string;
    sparepart_id?: string;
    qty_total: number;
    unit_transaction_item_details: WarehouseStockUnit[];
    unit_transaction_item_sales: Array<{
      id: number;
      unit_transaction_item_id: number;
      unit_transaction_item_detail_id: number;
    }>;
  }> {
    const response = await withPathFallback(
      () => apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(`${unitTransactionItemBasePath}/${unitTransactionItemId}`),
      () => apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(`${unitTransactionItemLegacyPath}/${unitTransactionItemId}`),
    );

    const payload = ensureSuccess(response.data);
    return mapUnitItem(payload);
  },

  async getStockByUnitType(unitTypeId: string, companyId = '1'): Promise<WarehouseStockUnit[]> {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${warehouseUnitDetailsBasePath}/${companyId}`, {
      params: {
        per_page: 200,
        page: 1,
        unit_type_id: unitTypeId,
      },
    });

    const payload = ensureSuccess(response.data);
    const warehouseRows = normalizeWarehouseItemDetails(payload);
    const filteredByType = warehouseRows.filter((row) => {
      const rowTypeId = String(row?.unit_type?.id ?? '');
      return rowTypeId === String(unitTypeId);
    });

    const mapped = filteredByType
      .map(mapWarehouseStockUnit)
      .filter((item) => item.id > 0 && item.in_stock);

    // Legacy fallback (do not remove): keep old source for quick rollback.
    // const legacyResponse = await apiClient.get<LaravelApiResponse<UnitTypeApiModel>>(`${unitTypeBasePath}/${unitTypeId}`, {
    //   params: {
    //     company_id: companyId,
    //   },
    // });
    // const legacyPayload = ensureSuccess(legacyResponse.data);
    // const mappedLegacy = normalizeUnitTypeDetails(legacyPayload)
    //   .map(mapWarehouseStockUnit)
    //   .filter((item) => item.id > 0 && item.in_stock);

    const deduped = new Map<number, WarehouseStockUnit>();
    mapped.forEach((item) => {
      if (!deduped.has(item.id)) {
        deduped.set(item.id, item);
      }
    });

    return Array.from(deduped.values());
  },

  async assignStock(payload: { unitTransactionItemId: string; unitTransactionDetails: number[] }): Promise<UnitTransactionItemSalesAssignment> {
    const form = new FormData();
    form.append('unit_transaction_item_id', payload.unitTransactionItemId);
    appendUnitTransactionDetails(form, payload.unitTransactionDetails);

    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<ItemSalesApiModel>>(itemSalesBasePath, form),
      () => apiClient.post<LaravelApiResponse<ItemSalesApiModel>>(itemSalesLegacyPath, form),
    );

    const data = ensureSuccess(response.data);
    return {
      id: toIdString(data.id),
      unit_transaction_item_id: toIdString(data.unit_transaction_item_id),
      unit_transaction_details: (data.unit_transaction_details ?? []).map((item) => toIdNumber(item)).filter((item) => item > 0),
      details: [],
    };
  },

  async dispatchStockInit(
    transactionId: string,
    payload: { personId: string; warehouseId: string; activityType?: 'issue' },
  ): Promise<string> {
    const form = new FormData();
    form.append('person_id', payload.personId);
    form.append('warehouse_id', payload.warehouseId);
    form.append('activity_type', payload.activityType ?? 'issue');

    const response = await withPathFallback(
      () => apiClient.post<LaravelApiResponse<WarehouseActivityApiModel>>(`${warehouseActivityBasePath}/${transactionId}/dispatch-stock`, form),
      () => apiClient.post<LaravelApiResponse<WarehouseActivityApiModel>>(`${warehouseActivityLegacyPath}/${transactionId}/dispatch-stock`, form),
    );

    const data = ensureSuccess(response.data);
    return extractWarehouseActivityId(data);
  },

  async dispatchStockConfirm(activityId: string, unitTransactionDetails: number[]): Promise<void> {
    const form = new FormData();
    appendUnitTransactionDetails(form, unitTransactionDetails);

    await withPathFallback(
      () => apiClient.put<LaravelApiResponse<any>>(`${warehouseActivityBasePath}/${activityId}/dispatch-stock`, form),
      async () => {
        const fallbackForm = new FormData();
        appendUnitTransactionDetails(fallbackForm, unitTransactionDetails);
        fallbackForm.append('_method', 'PUT');

        try {
          return await apiClient.post<LaravelApiResponse<any>>(`${warehouseActivityBasePath}/${activityId}/dispatch-stock`, fallbackForm);
        } catch (error) {
          if (!shouldFallback(error)) throw error;
          return apiClient.post<LaravelApiResponse<any>>(`${warehouseActivityLegacyPath}/${activityId}/dispatch-stock`, fallbackForm);
        }
      },
    );
  },
};
