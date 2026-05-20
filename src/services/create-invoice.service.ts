import type {
  CreateInvoiceDoItemSummary,
  DoExpeditionInvoice,
  DoExpeditionInvoiceCreatePayload,
  DoExpeditionInvoiceListParams,
  DoExpeditionInvoiceListResponse,
  DoExpeditionInvoiceProcessPayload,
  DoExpeditionInvoiceProcessResponse,
  DoExpeditionInvoiceUpdatePayload,
} from '@/@types/create-invoice.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { getDoEkspedisiById } from '@/services/do-ekspedisi.service';
import { apiClient } from '@/lib/api/client';
import { ApiValidationError, ensureSuccess, type LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

const basePath = '/wapi/transaction/do-expedition-invoice';

const toNumber = (value: unknown) => {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizePagination = (payload: any) => {
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

  return {
    data: [],
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  };
};

const mapInvoice = (item: any): DoExpeditionInvoice => ({
  id: Number(item?.id ?? 0),
  uuid: item?.uuid,
  doExpeditionId: Number(item?.do_expedition_id ?? item?.do_expedition?.id ?? 0),
  qty: toNumber(item?.qty),
  doLetterCode: item?.do_letter_code ?? null,
  doAssignmentCode: item?.do_assignment_code ?? null,
  description: item?.description ?? null,
  createdAt: item?.created_at,
  updatedAt: item?.updated_at,
  doExpedition: item?.do_expedition
    ? {
        id: Number(item.do_expedition.id ?? 0),
        uuid: item.do_expedition.uuid,
        doCode: item.do_expedition.do_code ?? item.do_expedition.code ?? '',
        orderCode: item.do_expedition.do_order_list?.code ?? item.do_expedition.do_orderlist?.code ?? '',
        date: item.do_expedition.date ?? '',
        vehicleId: item.do_expedition.vehicle_id == null ? null : Number(item.do_expedition.vehicle_id),
        driverId: item.do_expedition.driver_id == null ? null : Number(item.do_expedition.driver_id),
        driverNote: item.do_expedition.driver_note ?? '',
        itemsCount: Array.isArray(item.do_expedition.items) ? item.do_expedition.items.length : 0,
        bruttoValue: 0,
        totalPpn: 0,
        totalPph: 0,
        totalServiceFee: 0,
        totalAdditionalCost: 0,
        totalOtherFee: 0,
        totalDriverFee: 0,
        items: Array.isArray(item.do_expedition.items)
          ? item.do_expedition.items.map((row: any) => ({
              id: Number(row?.id ?? 0),
              uuid: row?.uuid,
              doExpeditionId: Number(row?.do_expedition_id ?? item.do_expedition.id ?? 0),
              customerId: Number(row?.customer_id ?? row?.customer?.id ?? 0),
              customerName: row?.customer?.name ?? '',
              loadingIn: row?.loading_in ?? '',
              loadingOut: row?.loading_out ?? '',
              destination: row?.destination ?? '',
              invoiceFee: toNumber(row?.invoice_fee),
              additionalCostFee: toNumber(row?.additional_cost_fee),
              otherFee: toNumber(row?.other_fee),
              driverFee: toNumber(row?.driver_fee),
              ppnFee: toNumber(row?.ppn_fee),
              serviceFee: toNumber(row?.service_fee),
              pphFee: toNumber(row?.pph_fee),
              customer: row?.customer
                ? {
                    id: Number(row.customer.id ?? 0),
                    uuid: row.customer.uuid,
                    name: row.customer.name ?? '',
                    pic: row.customer.pic ?? row.customer.pic_name ?? null,
                  }
                : undefined,
              createdAt: row?.created_at,
              updatedAt: row?.updated_at,
            }))
          : [],
        createdAt: item.do_expedition.created_at,
        updatedAt: item.do_expedition.updated_at,
      }
    : null,
});

const withDoExpeditionDetail = async (invoice: DoExpeditionInvoice): Promise<DoExpeditionInvoice> => {
  if (!invoice.doExpeditionId) return invoice;

  const shouldLoadDetails = !invoice.doExpedition?.items?.length || !invoice.doExpedition?.vehicle || !invoice.doExpedition?.driver;
  if (!shouldLoadDetails) return invoice;

  try {
    const detail = await getDoEkspedisiById(invoice.doExpeditionId);
    return {
      ...invoice,
      doExpedition: detail,
    };
  } catch {
    return invoice;
  }
};

export const summarizeDoExpeditionItems = (invoice: DoExpeditionInvoice): CreateInvoiceDoItemSummary => {
  const items = invoice.doExpedition?.items ?? [];
  const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

  return {
    customers: unique(items.map((item) => item.customer?.name || item.customerName || '')),
    loadingIns: unique(items.map((item) => item.loadingIn || '')),
    destinations: unique(items.map((item) => item.destination || '')),
    loadingOuts: unique(items.map((item) => item.loadingOut || '')),
    invoiceFee: items.reduce((sum, item) => sum + toNumber(item.invoiceFee), 0),
    additionalFee: items.reduce((sum, item) => sum + toNumber(item.additionalCostFee), 0),
    otherFee: items.reduce((sum, item) => sum + toNumber(item.otherFee), 0),
    driverFee: items.reduce((sum, item) => sum + toNumber(item.driverFee), 0),
    ppnFee: items.reduce((sum, item) => sum + toNumber(item.ppnFee), 0),
    rows: items,
  };
};

export const getDoExpeditionInvoices = async (
  params: PaginationParams & DoExpeditionInvoiceListParams,
): Promise<DoExpeditionInvoiceListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
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
  const mapped = (normalized.data ?? []).map(mapInvoice);
  const enriched = await Promise.all(mapped.map(withDoExpeditionDetail));

  return toPaginatedResult(
    {
      ...normalized,
      data: enriched,
    },
    (item) => item as DoExpeditionInvoice,
  );
};

export const getDoExpeditionInvoiceById = async (id: string | number): Promise<DoExpeditionInvoice> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
  const invoice = mapInvoice(ensureSuccess(response.data));
  return withDoExpeditionDetail(invoice);
};

export const createDoExpeditionInvoice = async (payload: DoExpeditionInvoiceCreatePayload): Promise<DoExpeditionInvoice> => {
  try {
    const body = new FormData();
    body.append('do_code', payload.do_code);

    const response = await apiClient.post<LaravelApiResponse<any>>(basePath, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return mapInvoice(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateDoExpeditionInvoice = async (
  id: string | number,
  payload: DoExpeditionInvoiceUpdatePayload,
): Promise<DoExpeditionInvoice> => {
  try {
    const body = new URLSearchParams();
    body.append('qty', String(payload.qty));
    body.append('do_letter_code', payload.do_letter_code);
    body.append('do_assignment_code', payload.do_assignment_code);

    const response = await apiClient.put<LaravelApiResponse<any>>(`${basePath}/${id}`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return mapInvoice(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteDoExpeditionInvoice = async (id: string | number) => {
  const response = await apiClient.delete<LaravelApiResponse<any>>(`${basePath}/${id}`);
  return ensureSuccess(response.data);
};

export const processDoExpeditionInvoice = async (
  payload: DoExpeditionInvoiceProcessPayload,
): Promise<DoExpeditionInvoiceProcessResponse> => {
  const body = new FormData();
  body.append('date', payload.date);
  body.append('subject', payload.subject);
  body.append('attachment', payload.attachment);
  body.append('letter_content', payload.letter_content);
  body.append('do_expedition_invoice_ids', JSON.stringify(payload.do_expedition_invoice_ids.map((item) => Number(item))));

  payload.do_expedition_invoice_ids.forEach((item) => {
    body.append('do_expedition_invoice_ids[]', String(item));
  });

  const response = await apiClient.post<LaravelApiResponse<any>>(`${basePath}/process-invoice`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const data = ensureSuccess(response.data);
  if (data && typeof data === 'object') return data as DoExpeditionInvoiceProcessResponse;
  return {};
};
