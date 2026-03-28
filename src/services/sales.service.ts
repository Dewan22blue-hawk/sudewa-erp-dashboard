import { LaravelPagination } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';
import { SalesApiModel, mapSalesDetailToUI, mapSalesToTableItem, mapSalesToUI } from '@/services/sales.mapper';

const basePath = '/wapi/transaction/unit-transaction/unit-transaction';

export type SalesPayload = {
  company_id: number;
  person_id: number;
  code: string;
  type: 'sales';
  max_capacity: number;
  stock_state: string;
  warehouse_id?: number;
};

const appendIfDefined = (form: FormData, key: string, value: string | number | undefined) => {
  if (value !== undefined && value !== null && value !== '') {
    form.append(key, String(value));
  }
};

const appendPayload = (form: FormData, payload: SalesPayload) => {
  form.append('company_id', String(payload.company_id));
  form.append('person_id', String(payload.person_id));
  appendIfDefined(form, 'warehouse_id', payload.warehouse_id);
  form.append('code', payload.code);
  form.append('type', payload.type);
  form.append('max_capacity', String(payload.max_capacity));
  form.append('stock_state', payload.stock_state);
};

const unwrapDetail = (payload: SalesApiModel | { data?: SalesApiModel }): SalesApiModel => {
  if ((payload as { data?: SalesApiModel })?.data) {
    return (payload as { data: SalesApiModel }).data;
  }
  return payload as SalesApiModel;
};

export const salesService = {
  async getSalesList() {
    const response = await apiClient.get<LaravelApiResponse<LaravelPagination<SalesApiModel>>>(basePath, {
      params: {
        type: 'sales',
        sort_order: 'asc',
      },
    });

    const responseData = ensureSuccess(response.data);
    const mappedData = (responseData.data ?? []).map(mapSalesToUI);

    return {
      data: (responseData.data ?? []).map(mapSalesToTableItem),
      mappedData,
      meta: {
        currentPage: responseData.current_page ?? 1,
        perPage: responseData.per_page ?? 10,
        total: responseData.total ?? 0,
        lastPage: responseData.last_page ?? 1,
      },
    };
  },

  async getSalesDetail(id: string) {
    const response = await apiClient.get<LaravelApiResponse<SalesApiModel | { data?: SalesApiModel }>>(`${basePath}/${id}`);
    const payload = ensureSuccess(response.data);
    const detail = unwrapDetail(payload);

    return {
      raw: detail,
      ui: mapSalesDetailToUI(detail),
    };
  },

  async createSales(payload: SalesPayload) {
    const form = new FormData();
    appendPayload(form, payload);

    const response = await apiClient.post<LaravelApiResponse<SalesApiModel | { data?: SalesApiModel }>>(basePath, form);
    const data = ensureSuccess(response.data);
    return unwrapDetail(data);
  },

  async updateSales(id: string, payload: SalesPayload) {
    const form = new FormData();
    appendPayload(form, payload);

    const response = await apiClient.put<LaravelApiResponse<SalesApiModel | { data?: SalesApiModel }>>(`${basePath}/${id}`, form);
    const data = ensureSuccess(response.data);
    return unwrapDetail(data);
  },

  async deleteSales(id: string) {
    await apiClient.delete<LaravelApiResponse<null>>(`${basePath}/${id}`);
  },
};
