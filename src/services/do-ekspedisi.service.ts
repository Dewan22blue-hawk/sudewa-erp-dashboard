import type {
  DoEkspedisi,
  DoEkspedisiCustomer,
  DoEkspedisiDriver,
  DoEkspedisiItem,
  DoEkspedisiItemListParams,
  DoEkspedisiItemListResponse,
  DoEkspedisiItemPayload,
  DoEkspedisiListParams,
  DoEkspedisiListResponse,
  DoEkspedisiPayload,
  DoEkspedisiVehicle,
  LookupOption,
} from '@/@types/do-ekspedisi.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { ApiResponseError, ApiValidationError, ensureSuccess, type LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

const expeditionBasePath = '/wapi/transaction/do-expedition';
const expeditionItemBasePath = '/wapi/transaction/do-expedition-item';
const customerLookupPath = '/wapi/master-data/customer';
const vehicleLookupPath = '/wapi/master-data/vehicle-fleet';
const driverLookupPath = '/wapi/master-data/driver';

const toNumber = (value: unknown) => {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizePagination = <T>(payload: any, fallbackMapper?: (item: any) => T) => {
  if (payload && Array.isArray(payload.data) && typeof payload.current_page !== 'undefined') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return {
      data: payload,
      current_page: 1,
      per_page: payload.length || 10,
      total: payload.length,
      last_page: 1,
    };
  }

  if (payload && typeof payload === 'object') {
    const single = fallbackMapper ? fallbackMapper(payload) : payload;
    return {
      data: [single],
      current_page: 1,
      per_page: 1,
      total: 1,
      last_page: 1,
    };
  }

  return {
    data: [],
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  };
};

const mapVehicle = (item: any): DoEkspedisiVehicle => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  registrationNumber: item?.registration_number ?? '',
  type: item?.type ?? '',
});

const mapDriver = (item: any): DoEkspedisiDriver => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  name: item?.name ?? '',
  phone: item?.phone ?? null,
});

const mapCustomer = (item: any): DoEkspedisiCustomer => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  name: item?.name ?? '',
});

const mapDoEkspedisiItem = (item: any): DoEkspedisiItem => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  doExpeditionId: Number(item?.do_expedition_id ?? item?.expedition?.id ?? 0),
  customerId: Number(item?.customer_id ?? item?.customer?.id ?? 0),
  customerName: item?.customer?.name ?? '',
  loadingIn: item?.loading_in ?? '',
  loadingOut: item?.loading_out ?? '',
  destination: item?.destination ?? '',
  invoiceFee: toNumber(item?.invoice_fee),
  additionalCostFee: toNumber(item?.additional_cost_fee),
  otherFee: toNumber(item?.other_fee),
  driverFee: toNumber(item?.driver_fee),
  ppnFee: toNumber(item?.ppn_fee),
  serviceFee: toNumber(item?.service_fee),
  pphFee: toNumber(item?.pph_fee),
  customer: item?.customer ? mapCustomer(item.customer) : undefined,
  createdAt: item?.created_at,
  updatedAt: item?.updated_at,
});

const mapDoEkspedisi = (item: any): DoEkspedisi => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  doCode: item?.do_code ?? '',
  date: item?.date ?? '',
  vehicleId: item?.vehicle_id == null ? null : Number(item.vehicle_id),
  driverId: item?.driver_id == null ? null : Number(item.driver_id),
  itemsCount: Number(item?.items_count ?? item?.items?.length ?? 0),
  bruttoValue: toNumber(item?.brutto_value),
  totalPpn: toNumber(item?.total_ppn),
  totalPph: toNumber(item?.total_pph),
  totalServiceFee: toNumber(item?.total_service_fee),
  totalAdditionalCost: toNumber(item?.total_additional_cost),
  totalOtherFee: toNumber(item?.total_other_fee),
  totalDriverFee: toNumber(item?.total_driver_fee),
  vehicle: item?.vehicle ? mapVehicle(item.vehicle) : null,
  driver: item?.driver ? mapDriver(item.driver) : null,
  items: Array.isArray(item?.items) ? item.items.map(mapDoEkspedisiItem) : undefined,
  createdAt: item?.created_at,
  updatedAt: item?.updated_at,
});

const enrichVehiclesWithType = async (items: DoEkspedisi[]): Promise<DoEkspedisi[]> => {
  const missingVehicleIds = Array.from(
    new Set(
      items
        .filter((item) => item.vehicleId && (!item.vehicle?.type || !item.vehicle.type.trim()))
        .map((item) => Number(item.vehicleId)),
    ),
  );

  if (missingVehicleIds.length === 0) {
    return items;
  }

  const vehicleEntries = await Promise.all(
    missingVehicleIds.map(async (vehicleId) => {
      try {
        const response = await apiClient.get<LaravelApiResponse<any>>(`${vehicleLookupPath}/${vehicleId}`);
        const vehicle = mapVehicle(ensureSuccess(response.data));
        return [vehicleId, vehicle] as const;
      } catch {
        return [vehicleId, null] as const;
      }
    }),
  );

  const vehicleMap = new Map<number, DoEkspedisiVehicle | null>(vehicleEntries);

  return items.map((item) => {
    if (!item.vehicleId) return item;

    const enrichedVehicle = vehicleMap.get(Number(item.vehicleId));
    if (!enrichedVehicle) return item;

    return {
      ...item,
      vehicle: {
        ...enrichedVehicle,
        registrationNumber: item.vehicle?.registrationNumber || enrichedVehicle.registrationNumber,
      },
    };
  });
};

const buildMainPayload = (payload: DoEkspedisiPayload, asUpdate = false) => {
  if (!asUpdate) {
    const formData = new FormData();
    formData.append('date', payload.date);
    formData.append('vehicle_id', String(payload.vehicle_id));
    formData.append('driver_id', String(payload.driver_id));
    return formData;
  }

  const params = new URLSearchParams();
  params.append('date', payload.date);
  params.append('vehicle_id', String(payload.vehicle_id));
  params.append('driver_id', String(payload.driver_id));
  return params;
};

const buildItemPayload = (payload: DoEkspedisiItemPayload, asUpdate = false) => {
  if (!asUpdate) {
    const formData = new FormData();
    formData.append('do_expedition_id', String(payload.do_expedition_id));
    formData.append('customer_id', String(payload.customer_id));
    formData.append('loading_in', payload.loading_in);
    formData.append('loading_out', payload.loading_out);
    formData.append('destination', payload.destination);
    formData.append('invoice_fee', String(payload.invoice_fee));
    formData.append('additional_cost_fee', String(payload.additional_cost_fee));
    formData.append('other_fee', String(payload.other_fee));
    formData.append('driver_fee', String(payload.driver_fee));
    return formData;
  }

  const params = new URLSearchParams();
  params.append('do_expedition_id', String(payload.do_expedition_id));
  params.append('customer_id', String(payload.customer_id));
  params.append('loading_in', payload.loading_in);
  params.append('loading_out', payload.loading_out);
  params.append('destination', payload.destination);
  params.append('invoice_fee', String(payload.invoice_fee));
  params.append('additional_cost_fee', String(payload.additional_cost_fee));
  params.append('other_fee', String(payload.other_fee));
  params.append('driver_fee', String(payload.driver_fee));
  return params;
};

export const getDoEkspedisis = async (
  params: PaginationParams & DoEkspedisiListParams,
): Promise<DoEkspedisiListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(expeditionBasePath, {
    params: {
      search: params.search?.trim() || undefined,
      order_by: params.order_by ?? 'created_at',
      order_sort: params.order_sort ?? 'desc',
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
    },
  });

  const payload = ensureSuccess(response.data);
  const normalized = normalizePagination(payload);
  const mappedItems = (normalized.data ?? []).map(mapDoEkspedisi);
  const enrichedItems = await enrichVehiclesWithType(mappedItems);

  return toPaginatedResult(
    {
      ...normalized,
      data: enrichedItems,
    },
    (item) => item as DoEkspedisi,
  );
};

export const getDoEkspedisiById = async (id: string | number): Promise<DoEkspedisi> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${expeditionBasePath}/${id}`);
  return mapDoEkspedisi(ensureSuccess(response.data));
};

export const createDoEkspedisi = async (payload: DoEkspedisiPayload): Promise<DoEkspedisi> => {
  try {
    const body = buildMainPayload(payload);
    const response = await apiClient.post<LaravelApiResponse<any>>(expeditionBasePath, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return mapDoEkspedisi(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateDoEkspedisi = async (id: string | number, payload: DoEkspedisiPayload): Promise<DoEkspedisi> => {
  try {
    const body = buildMainPayload(payload, true);
    const response = await apiClient.put<LaravelApiResponse<any>>(`${expeditionBasePath}/${id}`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return mapDoEkspedisi(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteDoEkspedisi = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${expeditionBasePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete DO expedition');
  }
};

export const getDoEkspedisiItems = async (
  params: PaginationParams & DoEkspedisiItemListParams,
): Promise<DoEkspedisiItemListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(expeditionItemBasePath, {
    params: {
      order_by: params.order_by ?? 'created_at',
      order_sort: params.order_sort ?? 'desc',
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      loading_in: params.loading_in?.trim() || undefined,
      loading_out: params.loading_out?.trim() || undefined,
      destination: params.destination?.trim() || undefined,
      do_expedition_id: params.do_expedition_id,
      customer_id: params.customer_id,
    },
  });

  const payload = ensureSuccess(response.data);
  const normalized = normalizePagination(payload);

  return toPaginatedResult(normalized, mapDoEkspedisiItem);
};

export const getDoEkspedisiItemById = async (id: string | number): Promise<DoEkspedisiItem> => {
  try {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${expeditionItemBasePath}/${id}`);
    return mapDoEkspedisiItem(ensureSuccess(response.data));
  } catch {
    const fallback = await apiClient.get<LaravelApiResponse<any>>(`${expeditionBasePath}/${id}`);
    return mapDoEkspedisiItem(ensureSuccess(fallback.data));
  }
};

export const createDoEkspedisiItem = async (payload: DoEkspedisiItemPayload): Promise<DoEkspedisiItem> => {
  try {
    const body = buildItemPayload(payload);
    const response = await apiClient.post<LaravelApiResponse<any>>(expeditionItemBasePath, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return mapDoEkspedisiItem(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateDoEkspedisiItem = async (id: string | number, payload: DoEkspedisiItemPayload): Promise<DoEkspedisiItem> => {
  try {
    const body = buildItemPayload(payload, true);
    const response = await apiClient.put<LaravelApiResponse<any>>(`${expeditionItemBasePath}/${id}`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return mapDoEkspedisiItem(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteDoEkspedisiItem = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${expeditionItemBasePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete DO expedition item');
  }
};

const mapLookupResult = (data: any[], mapper: (item: any) => LookupOption) => data.map(mapper);

export const lookupDoEkspedisiCustomers = async (search = ''): Promise<LookupOption[]> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(customerLookupPath, {
    params: {
      search: search.trim() || undefined,
      page: 1,
      per_page: 20,
    },
  });

  const payload = ensureSuccess(response.data);
  const list = Array.isArray(payload?.data) ? payload.data : [];
  return mapLookupResult(list, (item) => ({
    id: Number(item.id),
    label: item.name ?? '',
    subtitle: item.code ?? item.phone ?? undefined,
  }));
};

export const lookupDoEkspedisiVehicles = async (search = ''): Promise<LookupOption[]> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(vehicleLookupPath, {
    params: {
      search: search.trim() || undefined,
      page: 1,
      per_page: 100,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  });

  const payload = ensureSuccess(response.data);
  const list = Array.isArray(payload?.data) ? payload.data : [];
  const mapped = mapLookupResult(list, (item) => ({
    id: Number(item.id),
    label: item.registration_number ?? '',
    subtitle: item.type ?? undefined,
  }));

  if (!search.trim()) {
    return mapped;
  }

  const normalizedSearch = search.trim().toLowerCase();
  return mapped.filter((item) => `${item.label} ${item.subtitle ?? ''}`.toLowerCase().includes(normalizedSearch));
};

export const lookupDoEkspedisiDrivers = async (search = ''): Promise<LookupOption[]> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(driverLookupPath, {
    params: {
      search: search.trim() || undefined,
      page: 1,
      per_page: 20,
    },
  });

  const payload = ensureSuccess(response.data);
  const normalized = normalizePagination(payload);
  const list = Array.isArray(normalized?.data) ? normalized.data : [];

  return mapLookupResult(list, (item) => ({
    id: Number(item.id),
    label: item.name ?? '',
    subtitle: item.code ?? item.phone ?? undefined,
  }));
};
