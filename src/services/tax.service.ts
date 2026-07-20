import type { Tax, TaxListParams, TaxListResponse, TaxPayload, TaxVersion } from '@/@types/tax.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, ensureSuccess, toPaginatedResult, type LaravelApiResponse } from '@/lib/api/response';

const basePath = '/wapi/settings/tax';

const mapTax = (item: any): Tax => ({
  id: Number(item.id ?? 0),
  code: item.code ?? '',
  name: item.name ?? '',
  is_lock: item.is_lock ?? 0,
  created_at: item.created_at ?? null,
  tax_versions: Array.isArray(item.tax_versions)
    ? item.tax_versions.map((v: any) => ({
        id: Number(v.id ?? 0),
        tax_id: Number(v.tax_id ?? 0),
        name: v.name ?? '',
        is_default: v.is_default ?? 0,
      }))
    : [],
});

export const getTaxList = async (params: TaxListParams): Promise<TaxListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      search: params.search,
    },
  });

  const payload = ensureSuccess(response.data);
  return toPaginatedResult(payload, mapTax);
};

export const getTaxById = async (id: string | number): Promise<Tax> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
  return mapTax(ensureSuccess(response.data));
};

export const createTax = async (payload: TaxPayload): Promise<Tax> => {
  try {
    const body = new FormData();
    body.append('code', payload.code);
    body.append('name', payload.name);

    const response = await apiClient.post<LaravelApiResponse<any>>(basePath, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapTax(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateTax = async (id: string | number, payload: TaxPayload): Promise<Tax> => {
  try {
    const body = new FormData();
    body.append('_method', 'PUT');
    body.append('code', payload.code);
    body.append('name', payload.name);

    const response = await apiClient.post<LaravelApiResponse<any>>(`${basePath}/${id}`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapTax(ensureSuccess(response.data));
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteTax = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${basePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete tax');
  }
};

const mapTaxVersion = (item: any): TaxVersion => ({
  id: Number(item.id ?? 0),
  tax_id: Number(item.tax_id ?? 0),
  name: item.name ?? '',
  is_default: item.is_default ?? 0,
});

export const getTaxDefault = async (code: string): Promise<TaxVersion | null> => {
  try {
    const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${code}/default`);
    const data = ensureSuccess(response.data);
    return data ? mapTaxVersion(data) : null;
  } catch {
    return null;
  }
};
