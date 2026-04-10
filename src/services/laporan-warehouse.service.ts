import { apiClient } from '@/lib/api/client';

export interface StockItem {
  id: number;
  unit_type: {
    id: number;
    name: string;
    brand: { id: number; name: string };
  };
  color: string;
  machine_number: string;
  chassis_number: string;
  stock_available: number;
  stock_forecast: number;
  purchase_price: number;
  person?: string;
}

export interface OrderOutstandingItem {
  code: string;
  date: string;
  supplier_name?: string;
  customer_name?: string;
  unit_type: string;
  order_qty: number;
  received_qty?: number;
  delivered_qty?: number;
  remaining_qty: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface WarehouseItem {
  id: number;
  name: string;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toString = (value: unknown, fallback = '-'): string => {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const toArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const resolvePaginatedPayload = (payload: unknown): {
  rows: unknown[];
  metaSource: Record<string, unknown>;
} => {
  if (!payload || typeof payload !== 'object') {
    return { rows: [], metaSource: {} };
  }

  const source = payload as Record<string, unknown>;
  const directRows = toArray(source.data);

  if (directRows.length > 0 || source.current_page !== undefined || source.total !== undefined) {
    return { rows: directRows, metaSource: source };
  }

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as Record<string, unknown>;
    return {
      rows: toArray(nested.data),
      metaSource: nested,
    };
  }

  return { rows: [], metaSource: source };
};

const buildPaginatedResponse = <T>(
  payload: unknown,
  perPageFallback: number,
  mapper: (item: unknown) => T,
): PaginatedResponse<T> => {
  const { rows, metaSource } = resolvePaginatedPayload(payload);

  const currentPage = toNumber(metaSource.current_page) || 1;
  const perPage = toNumber(metaSource.per_page) || perPageFallback;
  const total = toNumber(metaSource.total) || rows.length;
  const lastPage = toNumber(metaSource.last_page) || (total > 0 ? Math.ceil(total / perPage) : 1);

  return {
    current_page: currentPage,
    data: rows.map(mapper),
    last_page: lastPage,
    per_page: perPage,
    total,
    from: toNumber(metaSource.from),
    to: toNumber(metaSource.to),
  };
};

const mapStockItem = (item: unknown): StockItem => {
  const source = (item ?? {}) as Record<string, unknown>;
  const unitType = (source.unit_type ?? {}) as Record<string, unknown>;
  const brand = (unitType.brand ?? {}) as Record<string, unknown>;

  return {
    id: toNumber(source.id),
    unit_type: {
      id: toNumber(unitType.id),
      name: toString(unitType.name),
      brand: {
        id: toNumber(brand.id),
        name: toString(brand.name),
      },
    },
    color: toString(source.color),
    machine_number: toString(source.machine_number),
    chassis_number: toString(source.chassis_number),
    stock_available: toNumber(source.stock_available),
    stock_forecast: toNumber(source.stock_forecast),
    purchase_price: toNumber(source.purchase_price),
    person: toString(source.person, ''),
  };
};

const mapOrderItem = (item: unknown, type: 'purchase' | 'sales'): OrderOutstandingItem => {
  const source = (item ?? {}) as Record<string, unknown>;
  const unitType = source.unit_type;

  const orderQty = toNumber(source.order_qty);
  const receivedQty = toNumber(source.received_qty);
  const deliveredQty = toNumber(source.delivered_qty);

  const remainingQty =
    type === 'purchase' ? orderQty - receivedQty : orderQty - deliveredQty;

  return {
    code: toString(source.code),
    date: toString(source.date, ''),
    supplier_name: toString(source.supplier_name, ''),
    customer_name: toString(source.customer_name, ''),
    unit_type:
      typeof unitType === 'string'
        ? unitType
        : toString((unitType as Record<string, unknown> | undefined)?.name),
    order_qty: orderQty,
    received_qty: receivedQty,
    delivered_qty: deliveredQty,
    remaining_qty: remainingQty,
  };
};

export const getStockData = async (params: {
  warehouse_id?: number;
  page?: number;
  per_page?: number;
  machine_number?: string;
}): Promise<PaginatedResponse<StockItem>> => {
  const warehouseId = params.warehouse_id ?? 1;

  const response = await apiClient.get(
    `/wapi/warehouse/warehouse-get-unit-transaction-item-details/${warehouseId}`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 50,
        ...(params.machine_number ? { machine_number: params.machine_number } : {}),
      },
    },
  );

  return buildPaginatedResponse(response.data?.data ?? response.data, params.per_page ?? 50, mapStockItem);
};

export const getStockDetailData = getStockData;

export const getPurchaseOrderOutstanding = async (params: {
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<OrderOutstandingItem>> => {
  const response = await apiClient.get('/wapi/report/unit-type-detail-stock', {
    params: {
      type: 'purchase',
      page: params.page ?? 1,
      per_page: params.per_page ?? 50,
      ...(params.start_date ? { start_date: params.start_date } : {}),
      ...(params.end_date ? { end_date: params.end_date } : {}),
    },
  });

  return buildPaginatedResponse(response.data?.data ?? response.data, params.per_page ?? 50, (item) =>
    mapOrderItem(item, 'purchase'),
  );
};

export const getSalesOrderOutstanding = async (params: {
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<OrderOutstandingItem>> => {
  const response = await apiClient.get('/wapi/report/unit-type-detail-stock', {
    params: {
      type: 'sales',
      page: params.page ?? 1,
      per_page: params.per_page ?? 50,
      ...(params.start_date ? { start_date: params.start_date } : {}),
      ...(params.end_date ? { end_date: params.end_date } : {}),
    },
  });

  return buildPaginatedResponse(response.data?.data ?? response.data, params.per_page ?? 50, (item) =>
    mapOrderItem(item, 'sales'),
  );
};

export const getWarehouses = async (): Promise<WarehouseItem[]> => {
  const response = await apiClient.get('/wapi/warehouse');
  const payload = response.data?.data;

  if (Array.isArray(payload)) {
    return payload.map((item) => {
      const source = item as Record<string, unknown>;
      return {
        id: toNumber(source.id),
        name: toString(source.name),
      };
    });
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: unknown[] }).data.map((item) => {
      const source = item as Record<string, unknown>;
      return {
        id: toNumber(source.id),
        name: toString(source.name),
      };
    });
  }

  return [];
};
