import { UnitTransactionItemSalesAssignment, WarehouseStockUnit } from '@/@types/unit-transaction.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';

type ItemSalesApiModel = {
  id?: string | number;
  unit_transaction_item_id?: string | number;
  unit_transaction_details?: Array<number | string>;
};

type UnitTransactionItemApiModel = {
  id?: string | number;
  unit_type_id?: string | number;
  qty_total?: string | number;
};

type UnitTypeDetailApiModel = {
  id?: string | number;
  unit_transaction_detail_id?: string | number;
  color?: string;
  warna?: string;
  machine_number?: string;
  no_mesin?: string;
  chassis_number?: string;
  no_rangka?: string;
  is_available?: boolean | number | string;
  in_stock?: boolean | number | string;
};

type UnitTypeApiModel = {
  unit_type_details?: UnitTypeDetailApiModel[];
  unit_item_details?: UnitTypeDetailApiModel[];
  data?: {
    unit_type_details?: UnitTypeDetailApiModel[];
    unit_item_details?: UnitTypeDetailApiModel[];
    data?: {
      unit_type_details?: UnitTypeDetailApiModel[];
      unit_item_details?: UnitTypeDetailApiModel[];
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

const itemSalesBasePath = '/wapi/transaction/unit-transaction-item-sales';
const itemSalesLegacyPath = '/wapi/transaction/unit-transaction/unit-transaction-item-sales';
const unitTransactionItemBasePath = '/wapi/transaction/unit-transaction-item';
const unitTransactionItemLegacyPath = '/wapi/transaction/unit-transaction/unit-transaction-item';
const unitTypeBasePath = '/wapi/master-data/unit-type';

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

const normalizeUnitTypeDetails = (payload: any): UnitTypeDetailApiModel[] => {
  if (Array.isArray(payload?.unit_type_details)) return payload.unit_type_details;
  if (Array.isArray(payload?.unit_item_details)) return payload.unit_item_details;
  if (Array.isArray(payload?.data?.unit_type_details)) return payload.data.unit_type_details;
  if (Array.isArray(payload?.data?.unit_item_details)) return payload.data.unit_item_details;
  if (Array.isArray(payload?.data?.data?.unit_type_details)) return payload.data.data.unit_type_details;
  if (Array.isArray(payload?.data?.data?.unit_item_details)) return payload.data.data.unit_item_details;
  return [];
};

const mapWarehouseStockUnit = (payload: UnitTypeDetailApiModel): WarehouseStockUnit => ({
  id: toIdNumber(payload?.id ?? payload?.unit_transaction_detail_id),
  color: String(payload?.color ?? payload?.warna ?? '-'),
  machine_number: String(payload?.machine_number ?? payload?.no_mesin ?? '-'),
  chassis_number: String(payload?.chassis_number ?? payload?.no_rangka ?? '-'),
  in_stock: toBool(payload?.is_available ?? payload?.in_stock),
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
  unit_type_id: toIdString(payload.unit_type_id),
  qty_total: toNumber(payload.qty_total),
});

export const unitTransactionItemSalesService = {
  async getUnitItemById(unitTransactionItemId: string): Promise<{ id: string; unit_type_id: string; qty_total: number }> {
    const response = await withPathFallback(
      () => apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(`${unitTransactionItemLegacyPath}/${unitTransactionItemId}`),
      () => apiClient.get<LaravelApiResponse<UnitTransactionItemApiModel>>(`${unitTransactionItemBasePath}/${unitTransactionItemId}`),
    );

    const payload = ensureSuccess(response.data);
    return mapUnitItem(payload);
  },

  async getStockByUnitType(unitTypeId: string, companyId = '1'): Promise<WarehouseStockUnit[]> {
    const response = await apiClient.get<LaravelApiResponse<UnitTypeApiModel>>(`${unitTypeBasePath}/${unitTypeId}`, {
      params: {
        company_id: companyId,
      },
    });

    const payload = ensureSuccess(response.data);
    return normalizeUnitTypeDetails(payload)
      .map(mapWarehouseStockUnit)
      .filter((item) => item.id > 0);
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
