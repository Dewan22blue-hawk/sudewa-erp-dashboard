import { UnitTransactionItemSalesAssignment, WarehouseStockUnit } from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';

type ItemSalesApiModel = {
  id?: string | number;
  unit_transaction_item_id?: string | number;
  unit_transaction_details?: Array<number | string>;
  details?: Array<any>;
  unit_details?: Array<any>;
};

type WarehouseActivityApiModel = {
  id?: string | number;
  warehouse_activity_id?: string | number;
  data?: {
    id?: string | number;
    warehouse_activity_id?: string | number;
  };
};

const itemSalesBasePath = '/wapi/transaction/unit-transaction-item-sales';
const itemSalesLegacyPath = '/wapi/transaction/unit-transaction/unit-transaction-item-sales';
const itemDetailBasePath = '/wapi/transaction/unit-transaction-item-detail';
const itemDetailLegacyPath = '/wapi/transaction/unit-transaction/unit-transaction-item-detail';

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

const normalizeDetails = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.details)) return payload.details;
  if (Array.isArray(payload?.unit_details)) return payload.unit_details;
  if (Array.isArray(payload?.unit_transaction_details)) return payload.unit_transaction_details;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.details)) return payload.data.details;
  if (Array.isArray(payload?.data?.unit_details)) return payload.data.unit_details;
  return [];
};

const mapWarehouseStockUnit = (payload: any): WarehouseStockUnit => ({
  id: toIdNumber(payload?.id ?? payload?.unit_transaction_detail_id),
  color: String(payload?.color ?? payload?.warna ?? '-'),
  machine_number: String(payload?.machine_number ?? payload?.no_mesin ?? '-'),
  chassis_number: String(payload?.chassis_number ?? payload?.no_rangka ?? '-'),
  unit_type_id: payload?.unit_type_id !== undefined ? toIdString(payload.unit_type_id) : undefined,
  warehouse_id: payload?.warehouse_id !== undefined ? toIdString(payload.warehouse_id) : undefined,
  in_stock: payload?.in_stock !== undefined ? Boolean(payload.in_stock) : undefined,
});

const mapAssignment = (payload: ItemSalesApiModel): UnitTransactionItemSalesAssignment => {
  const detailSource = payload.details ?? payload.unit_details ?? [];
  const details = normalizeDetails(detailSource).map(mapWarehouseStockUnit);
  const idsFromPayload = Array.isArray(payload.unit_transaction_details)
    ? payload.unit_transaction_details.map((item) => toIdNumber(item)).filter((item) => item > 0)
    : [];

  const unitTransactionDetails = idsFromPayload.length > 0 ? idsFromPayload : details.map((item) => item.id).filter((item) => item > 0);

  return {
    id: toIdString(payload.id),
    unit_transaction_item_id: toIdString(payload.unit_transaction_item_id),
    unit_transaction_details: unitTransactionDetails,
    details,
  };
};

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

const buildParams = (params: { unitTypeId: string; warehouseId?: string; companyId?: string; search?: string }) => {
  const cleaned: Record<string, string | number> = {
    unit_type_id: params.unitTypeId,
    in_stock: 1,
    available: 1,
  };

  if (params.warehouseId && params.warehouseId.trim()) {
    cleaned.warehouse_id = params.warehouseId;
  }

  if (params.companyId && params.companyId.trim()) {
    cleaned.company_id = params.companyId;
  }

  if (params.search && params.search.trim()) {
    cleaned.search = params.search.trim();
  }

  return cleaned;
};

export const unitTransactionItemSalesService = {
  async getAssignments(unitTransactionItemId: string): Promise<UnitTransactionItemSalesAssignment[]> {
    const response = await withPathFallback(
      () =>
        apiClient.get<LaravelApiResponse<any>>(itemSalesBasePath, {
          params: {
            unit_transaction_item_id: unitTransactionItemId,
          },
        }),
      () =>
        apiClient.get<LaravelApiResponse<any>>(itemSalesLegacyPath, {
          params: {
            unit_transaction_item_id: unitTransactionItemId,
          },
        }),
    );

    const payload = ensureSuccess(response.data);

    if (Array.isArray(payload)) return payload.map(mapAssignment);
    if (Array.isArray(payload?.data)) return payload.data.map(mapAssignment);
    if (payload && typeof payload === 'object') return [mapAssignment(payload as ItemSalesApiModel)];

    return [];
  },

  async getAvailableStockUnits(params: {
    unitTypeId: string;
    warehouseId?: string;
    companyId?: string;
    search?: string;
  }): Promise<WarehouseStockUnit[]> {
    const requestParams = buildParams(params);

    const candidates = [
      itemDetailBasePath,
      itemDetailLegacyPath,
      `${itemSalesBasePath}/available`,
      itemSalesBasePath,
      itemSalesLegacyPath,
    ];

    let lastError: any;

    for (const endpoint of candidates) {
      try {
        const response = await apiClient.get<LaravelApiResponse<any>>(endpoint, { params: requestParams });
        const payload = ensureSuccess(response.data);
        const rows = normalizeDetails(payload).map(mapWarehouseStockUnit).filter((item) => item.id > 0);

        if (rows.length > 0 || endpoint.includes('item-detail')) {
          return rows;
        }
      } catch (error: any) {
        lastError = error;

        const statusCode = error?.statusCode ?? error?.response?.status;
        if (statusCode !== 404 && statusCode !== 405) {
          throw error;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    return [];
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
    return mapAssignment(data);
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
