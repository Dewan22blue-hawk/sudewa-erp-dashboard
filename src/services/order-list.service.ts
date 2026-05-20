import type {
  CreateOrderListPayload,
  CreateOrderListTarifPayload,
  OrderList,
  OrderListCustomer,
  OrderListListParams,
  OrderListListResponse,
  OrderListTarifItem,
  OrderListTarifListParams,
  OrderListTarifListResponse,
  OrderListTarifReference,
  OrderListVehicle,
  OrderListVehicleType,
  UpdateOrderListPayload,
  UpdateOrderListTarifPayload,
} from '@/@types/order-list.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, ensureSuccess, type LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

const orderListBasePath = '/wapi/transaction/do-order-list';
const orderListTarifBasePath = '/wapi/transaction/do-order-list-tarif';

const toNumber = (value: unknown): number => {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
};

const normalizeVehicleType = (value: unknown): OrderListVehicleType | null => {
  const normalized = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (normalized === 'towing' || normalized === 'cdd' || normalized === 'fuso') {
    return normalized;
  }
  return null;
};

const mapOrderListCustomer = (item: any): OrderListCustomer | undefined => {
  if (!item || typeof item !== 'object') return undefined;

  return {
    id: Number(item.id ?? 0),
    uuid: item.uuid,
    code: item.code,
    name: item.name ?? '-',
    address: item.address ?? null,
    phone: item.phone ?? null,
    npwp: item.npwp ?? null,
    pic: item.pic_name ?? item.pic ?? null,
  };
};

const mapOrderListVehicle = (item: any): OrderListVehicle => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  registrationNumber: toStringValue(item?.registration_number, item?.registrationNumber),
  type: toStringValue(item?.type, item?.vehicle_type, item?.vehicleType),
});

const mapTarifReference = (item: any): OrderListTarifReference | undefined => {
  if (!item || typeof item !== 'object') return undefined;

  return {
    id: Number(item.id ?? 0),
    uuid: item.uuid,
    customerId: item.customer_id != null ? Number(item.customer_id) : undefined,
    loadingIn: item.loading_in ?? '',
    loadingOut: item.loading_out ?? '',
    distance: item.distance != null ? toNumber(item.distance) : undefined,
    ujTowing: item.uj_towing != null ? toNumber(item.uj_towing) : null,
    ujCdd: item.uj_cdd != null ? toNumber(item.uj_cdd) : null,
    ujFuso: item.uj_fuso != null ? toNumber(item.uj_fuso) : null,
    invCdd: item.inv_cdd != null ? toNumber(item.inv_cdd) : null,
    invFuso: item.inv_fuso != null ? toNumber(item.inv_fuso) : null,
    customer: mapOrderListCustomer(item.customer),
  };
};

const resolveDriverFee = (vehicleType: OrderListVehicleType | null, tarif?: OrderListTarifReference, fallback?: unknown) => {
  if (fallback != null && fallback !== '') return toNumber(fallback);
  if (!tarif || !vehicleType) return 0;
  if (vehicleType === 'towing') return toNumber(tarif.ujTowing);
  if (vehicleType === 'cdd') return toNumber(tarif.ujCdd);
  return toNumber(tarif.ujFuso);
};

const resolveInvoiceFee = (vehicleType: OrderListVehicleType | null, tarif?: OrderListTarifReference, fallback?: unknown) => {
  if (fallback != null && fallback !== '') return toNumber(fallback);
  if (!tarif || !vehicleType) return 0;
  if (vehicleType === 'cdd') return toNumber(tarif.invCdd);
  if (vehicleType === 'fuso') return toNumber(tarif.invFuso);
  return 0;
};

const mapOrderListTarifItem = (item: any, parent?: any): OrderListTarifItem => {
  const tarif = mapTarifReference(item.tarif ?? item.tariff ?? item.master_tarif);
  const vehicleType = normalizeVehicleType(
    item.vehicle_type ??
      item.vehicleType ??
      item.type ??
      item.armada_type ??
      item.vehicle_armada_type ??
      item.tipe_armada ??
      item.type_armada ??
      item.armada,
  );

  return {
    id: Number(item.id ?? 0),
    uuid: item.uuid,
    doOrderListId: Number(item.do_orderlist_id ?? item.do_order_list_id ?? parent?.id ?? 0),
    tarifId: Number(item.tarif_id ?? item.tarif?.id ?? item.tariff?.id ?? 0),
    qty: toNumber(item.qty),
    loadContent: toStringValue(item.load_content, item.muatan, item.loadContent),
    deliveryDestination: toStringValue(
      item.delivery_destination,
      item.deliveryDestination,
      item.destination,
      item.tujuan_kirim,
      item.delivery_address,
    ),
    vehicleType,
    loadingIn: toStringValue(item.loading_in, item.loadingIn, tarif?.loadingIn, parent?.loading_in, parent?.loadingIn),
    loadingOut: toStringValue(item.loading_out, item.loadingOut, tarif?.loadingOut, parent?.loading_out, parent?.loadingOut),
    driverFee: resolveDriverFee(vehicleType, tarif, item.uj_driver ?? item.driver_fee),
    expeditionInvoice: resolveInvoiceFee(vehicleType, tarif, item.bill_invoice ?? item.invoice_bill ?? item.invoice_fee),
    tarif,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

const mapOrderList = (item: any): OrderList => {
  const tarifSource = Array.isArray(item?.tarifs)
    ? item.tarifs
    : Array.isArray(item?.do_order_list_tarifs)
      ? item.do_order_list_tarifs
      : Array.isArray(item?.do_orderlist_tarifs)
        ? item.do_orderlist_tarifs
        : [];
  const tarifs = tarifSource.map((entry: any) => mapOrderListTarifItem(entry, item));
  const firstTarif = tarifs[0];

  return {
    id: Number(item?.id ?? 0),
    uuid: item?.uuid,
    code: item?.code ?? '-',
    customerId: Number(item?.customer_id ?? item?.customer?.id ?? 0),
    status: (item?.status ?? 'pending') as OrderList['status'],
    billInvoice: toNumber(item?.bill_invoice ?? item?.invoice_bill),
    ppn: toNumber(item?.ppn),
    note: toStringValue(item?.note, item?.notes, item?.keterangan, item?.description, item?.remark),
    ujDriver: toNumber(item?.uj_driver ?? firstTarif?.driverFee),
    loadingIn: toStringValue(item?.loading_in, item?.loadingIn, firstTarif?.loadingIn),
    loadingOut: toStringValue(item?.loading_out, item?.loadingOut, firstTarif?.loadingOut),
    vehicles: Array.isArray(item?.vehicles) ? item.vehicles.map(mapOrderListVehicle) : [],
    customer: mapOrderListCustomer(item?.customer),
    tarifs,
    expeditions: Array.isArray(item?.expeditions) ? item.expeditions : [],
    createdAt: item?.created_at,
    updatedAt: item?.updated_at,
  };
};

const buildCreateOrderListBody = (payload: CreateOrderListPayload) => {
  const body = new FormData();
  body.append('customer_id', String(payload.customer_id));
  body.append('status', payload.status);
  body.append('bill_invoice', String(payload.bill_invoice));
  if (payload.note != null) body.append('note', payload.note);
  if (payload.ppn != null) body.append('ppn', String(payload.ppn));
  if (payload.uj_driver != null) body.append('uj_driver', String(payload.uj_driver));
  if (payload.loading_in != null) body.append('loading_in', payload.loading_in);
  if (payload.loading_out != null) body.append('loading_out', payload.loading_out);
  return body;
};

const buildUpdateOrderListBody = (payload: UpdateOrderListPayload) => {
  const body = new URLSearchParams();
  body.append('customer_id', String(payload.customer_id));
  body.append('status', payload.status);
  body.append('invoice_bill', String(payload.invoice_bill));
  body.append('bill_invoice', String(payload.bill_invoice ?? payload.invoice_bill));
  if (payload.note != null) body.append('note', payload.note);
  if (payload.ppn != null) body.append('ppn', String(payload.ppn));
  if (payload.uj_driver != null) body.append('uj_driver', String(payload.uj_driver));
  if (payload.loading_in != null) body.append('loading_in', payload.loading_in);
  if (payload.loading_out != null) body.append('loading_out', payload.loading_out);
  return body;
};

const buildCreateOrderListTarifBody = (payload: CreateOrderListTarifPayload) => {
  const body = new FormData();
  body.append('do_orderlist_id', String(payload.do_orderlist_id));
  body.append('tarif_id', String(payload.tarif_id));
  body.append('qty', String(payload.qty));
  body.append('load_content', payload.load_content);
  body.append('delivery_destination', payload.delivery_destination);
  if (payload.vehicle_type) body.append('vehicle_type', payload.vehicle_type);
  return body;
};

const buildUpdateOrderListTarifBody = (payload: UpdateOrderListTarifPayload) => {
  const body = new URLSearchParams();
  body.append('qty', String(payload.qty));
  body.append('vehicle_type', payload.vehicle_type);
  body.append('load_content', payload.load_content);
  body.append('delivery_destination', payload.delivery_destination);
  return body;
};

export const getOrderLists = async (params: OrderListListParams): Promise<OrderListListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(orderListBasePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      order_by: params.order_by ?? 'created_at',
      order_sort: params.order_sort ?? 'desc',
    },
  });

  const payload = ensureSuccess(response.data);
  return toPaginatedResult(payload, mapOrderList);
};

export const getOrderListById = async (id: string | number): Promise<OrderList> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${orderListBasePath}/${id}`);
  return mapOrderList(ensureSuccess(response.data));
};

export const createOrderList = async (payload: CreateOrderListPayload): Promise<OrderList> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(orderListBasePath, buildCreateOrderListBody(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapOrderList(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateOrderList = async (id: string | number, payload: UpdateOrderListPayload): Promise<OrderList> => {
  try {
    const response = await apiClient.put<LaravelApiResponse<any>>(`${orderListBasePath}/${id}`, buildUpdateOrderListBody(payload), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return mapOrderList(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteOrderList = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${orderListBasePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete order list');
  }
};

export const getOrderListTarifs = async (params: OrderListTarifListParams): Promise<OrderListTarifListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(orderListTarifBasePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      order_by: params.order_by ?? 'created_at',
      order_sort: params.order_sort ?? 'desc',
      do_orderlist_id: params.do_orderlist_id,
    },
  });

  const payload = ensureSuccess(response.data);
  return toPaginatedResult(payload, (item) => mapOrderListTarifItem(item));
};

export const getOrderListTarifById = async (id: string | number): Promise<OrderListTarifItem> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${orderListTarifBasePath}/${id}`);
  return mapOrderListTarifItem(ensureSuccess(response.data));
};

export const createOrderListTarif = async (payload: CreateOrderListTarifPayload): Promise<OrderListTarifItem> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(orderListTarifBasePath, buildCreateOrderListTarifBody(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapOrderListTarifItem(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateOrderListTarif = async (id: string | number, payload: UpdateOrderListTarifPayload): Promise<OrderListTarifItem> => {
  try {
    const response = await apiClient.put<LaravelApiResponse<any>>(`${orderListTarifBasePath}/${id}`, buildUpdateOrderListTarifBody(payload), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return mapOrderListTarifItem(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteOrderListTarif = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${orderListTarifBasePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete order list tarif');
  }
};
