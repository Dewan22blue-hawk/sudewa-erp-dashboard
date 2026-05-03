import type { Customer, CustomerListResponse, CustomerPayload } from '@/@types/customer.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface CustomerApiModel {
  id: number;
  uuid?: string;
  code?: string;
  type?: string;
  name: string;
  address?: string | null;
  npwp?: string | null;
  phone?: string | null;
  pic?: string | null;
  pic_name?: string | null;
  user_id?: number | string;
  company_id?: number | string;
  created_at?: string;
  updated_at?: string;
  map_link?: string | null;
}

const mapCustomer = (payload: CustomerApiModel): Customer => ({
  id: payload.id,
  uuid: payload.uuid,
  code: payload.code,
  type: payload.type,
  name: payload.name,
  address: payload.address ?? null,
  npwp: payload.npwp ?? null,
  phone: payload.phone ?? null,
  pic: payload.pic ?? payload.pic_name ?? null,
  userId: payload.user_id,
  companyId: payload.company_id,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
  map_link: payload.map_link ?? null,
});

const basePath = '/wapi/master-data/customer';

type PaginatedCustomerResponse = LaravelApiResponse<{
  data: CustomerApiModel[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}>;

type CustomerItemResponse = LaravelApiResponse<CustomerApiModel>;

type DeleteResponse = LaravelApiResponse<null>;

export const getCustomers = async (
  params: PaginationParams & {
    search?: string;
    user_id?: number | string;
    company_id?: number | string;
    code?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    case_sensitive?: 0 | 1 | boolean;
  },
): Promise<CustomerListResponse> => {
  const response = await apiClient.get<PaginatedCustomerResponse>(basePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      search: params.search,
      user_id: params.user_id,
      company_id: params.company_id,
      code: params.code,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      case_sensitive: params.case_sensitive,
    },
  });

  const data = ensureSuccess(response.data);

  return toPaginatedResult(
    {
      data: data.data ?? [],
      current_page: data.current_page,
      per_page: data.per_page,
      total: data.total,
      last_page: data.last_page,
    },
    mapCustomer,
  );
};

export const getCustomerById = async (id: number | string): Promise<Customer> => {
  const response = await apiClient.get<CustomerItemResponse>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapCustomer(data);
};

const buildPayload = (payload: CustomerPayload, opts?: { asUpdate?: boolean }) => {
  const body = new FormData();
  if (opts?.asUpdate) body.append('_method', 'PUT');
  if (payload.userId !== undefined) body.append('user_id', String(payload.userId));
  if (payload.companyId !== undefined) body.append('company_id', String(payload.companyId));
  body.append('name', payload.name);
  body.append('address', payload.address ?? '');
  body.append('phone', payload.phone ?? '');
  body.append('npwp', payload.npwp ?? '');
  body.append('pic_name', payload.pic ?? '');
  body.append('map_link', payload.map_link ?? '');
  return body;
};

export const createCustomer = async (payload: CustomerPayload): Promise<Customer> => {
  try {
    const body = buildPayload(payload);
    const response = await apiClient.post<CustomerItemResponse>(basePath, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = ensureSuccess(response.data);
    return mapCustomer(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const updateCustomer = async (id: number | string, payload: CustomerPayload): Promise<Customer> => {
  try {
    const body = buildPayload(payload, { asUpdate: true });
    const response = await apiClient.post<CustomerItemResponse>(`${basePath}/${id}`, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = ensureSuccess(response.data);
    return mapCustomer(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const deleteCustomer = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<DeleteResponse>(`${basePath}/${id}`);
  const payload = response.data;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete customer');
  }
};

export const importCustomer = async (file: File, companyId?: string | number): Promise<void> => {
  const body = new FormData();
  body.append('file', file);

  const url = companyId ? `${basePath}/${companyId}/import` : `${basePath}/import`;

  const response = await apiClient.post(url, body, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const payload = response.data as LaravelApiResponse<null>;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to import customer');
  }
};

export const exportCustomer = async (companyId?: string | number): Promise<void> => {
  const response = await apiClient.get(`${basePath}/export`, {
    params: companyId ? { company_id: companyId } : undefined,
    responseType: 'blob',
  });

  const contentType = response.headers['content-type'];
  const isJson = contentType && contentType.includes('application/json');

  if (isJson) {
    const textData = await (response.data as Blob).text();
    const jsonResponse = JSON.parse(textData);
    throw new ApiResponseError(jsonResponse.message ?? 'Failed to export customer');
  }

  const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Customer_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
