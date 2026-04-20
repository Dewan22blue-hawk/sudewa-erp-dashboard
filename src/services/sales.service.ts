import { LaravelPagination } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';
import { SalesApiModel, mapSalesDetailToUI, mapSalesToTableItem, mapSalesToUI } from '@/services/sales.mapper';

const basePath = '/wapi/transaction/unit-transaction/unit-transaction';
const fallbackBasePath = '/wapi/transaction/unit-transaction';

type SalesItemApiModel = {
  id?: number | string;
  unit_transaction_id?: number | string;
  qty_total?: number | string;
  price?: number | string;
  bbn_price?: number | string;
  other_fee?: number | string;
  dpp_per_unit_price?: number | string;
  ppn_per_unit_price?: number | string;
  dpp_total_price?: number | string;
  ppn_total_price?: number | string;
  created_at?: string;
  unit_transaction?: {
    id?: number | string;
    code?: string;
  };
};

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

const toUrlEncodedPayload = (payload: SalesPayload): URLSearchParams => {
  const params = new URLSearchParams();
  params.append('company_id', String(payload.company_id));
  params.append('person_id', String(payload.person_id));
  if (payload.warehouse_id !== undefined && payload.warehouse_id !== null) {
    params.append('warehouse_id', String(payload.warehouse_id));
  }
  params.append('code', payload.code);
  params.append('type', payload.type);
  params.append('max_capacity', String(payload.max_capacity));
  params.append('stock_state', payload.stock_state);
  return params;
};

const unwrapDetail = (payload: SalesApiModel | { data?: SalesApiModel }): SalesApiModel => {
  if ((payload as { data?: SalesApiModel })?.data) {
    return (payload as { data: SalesApiModel }).data;
  }
  return payload as SalesApiModel;
};

const toNumber = (value: string | number | undefined): number => Number(value ?? 0);

const normalizeSalesRows = (rows: SalesItemApiModel[]): SalesApiModel[] => {
  const grouped = new Map<string, SalesApiModel>();

  rows.forEach((row) => {
    const transactionId = String(row.unit_transaction_id ?? row.unit_transaction?.id ?? row.id ?? '');
    if (!transactionId) return;

    const qty = toNumber(row.qty_total);
    const bruto = toNumber(row.price) * qty;
    const dpp = toNumber(row.dpp_per_unit_price) > 0 ? toNumber(row.dpp_per_unit_price) * qty : toNumber(row.dpp_total_price);
    const ppn = toNumber(row.ppn_per_unit_price) > 0 ? toNumber(row.ppn_per_unit_price) * qty : toNumber(row.ppn_total_price);
    const bbn = toNumber(row.bbn_price) * qty;
    const other = toNumber(row.other_fee);

    const existing = grouped.get(transactionId);

    if (!existing) {
      grouped.set(transactionId, {
        id: transactionId,
        code: row.unit_transaction?.code ?? '-',
        created_at: row.created_at,
        transaction_bruto_total: bruto,
        transaction_dpp_total: dpp,
        transaction_ppn_total: ppn,
        transaction_bbn_total: bbn,
        transaction_other_fee: other,
      });
      return;
    }

    existing.transaction_bruto_total = toNumber(existing.transaction_bruto_total) + bruto;
    existing.transaction_dpp_total = toNumber(existing.transaction_dpp_total) + dpp;
    existing.transaction_ppn_total = toNumber(existing.transaction_ppn_total) + ppn;
    existing.transaction_bbn_total = toNumber(existing.transaction_bbn_total) + bbn;
    existing.transaction_other_fee = toNumber(existing.transaction_other_fee) + other;
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
};

export const salesService = {
  async getSalesList() {
    let rows: SalesApiModel[] = [];
    let responseData: LaravelPagination<SalesApiModel> | null = null;

    try {
      const response = await apiClient.get<LaravelApiResponse<LaravelPagination<any>>>(basePath, {
        params: {
          type: 'sales',
          sort_order: 'desc',
        },
      });

      const payload = ensureSuccess(response.data) as LaravelPagination<SalesApiModel>;
      responseData = payload;
      rows = payload.data ?? [];
    } catch {
      // Compatibility fallback for environments exposing the shorter base path.
      try {
        const fallbackResponse = await apiClient.get<LaravelApiResponse<LaravelPagination<any>>>(fallbackBasePath, {
          params: {
            type: 'sales',
            sort_order: 'desc',
          },
        });

        const fallbackPayload = ensureSuccess(fallbackResponse.data) as LaravelPagination<SalesApiModel>;
        responseData = fallbackPayload;
        rows = fallbackPayload.data ?? [];
      } catch {
        responseData = null;
      }
    }

    if (!responseData) {
      return {
        data: [],
        mappedData: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 0,
          lastPage: 1,
        },
      };
    }

    const mappedData = rows.map(mapSalesToUI);

    return {
      data: rows.map(mapSalesToTableItem),
      mappedData,
      meta: {
        currentPage: responseData.current_page ?? 1,
        per_page: responseData.per_page ?? 10,
        total: responseData.total ?? 0,
        lastPage: responseData.last_page ?? 1,
      },
    };
  },

  async getSalesDetail(id: string) {
    let detail: SalesApiModel | null = null;

    try {
      const response = await apiClient.get<LaravelApiResponse<SalesApiModel | { data?: SalesApiModel }>>(`${basePath}/${id}`);
      const payload = ensureSuccess(response.data);
      detail = unwrapDetail(payload);
    } catch {
      const fallbackResponse = await apiClient.get<LaravelApiResponse<SalesApiModel | { data?: SalesApiModel }>>(`${fallbackBasePath}/${id}`);
      const fallbackPayload = ensureSuccess(fallbackResponse.data);
      detail = unwrapDetail(fallbackPayload);
    }

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
    const params = toUrlEncodedPayload(payload);

    const response = await apiClient.put<LaravelApiResponse<SalesApiModel | { data?: SalesApiModel }>>(`${basePath}/${id}`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = ensureSuccess(response.data);
    return unwrapDetail(data);
  },

  async deleteSales(id: string) {
    await apiClient.delete<LaravelApiResponse<null>>(`${basePath}/${id}`);
  },
};
