import type { Supplier, SupplierListResponse, SupplierPayload } from '@/@types/supplier.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface SupplierApiModel {
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
}

const mapSupplier = (payload: SupplierApiModel): Supplier => ({
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
});

const basePath = '/wapi/master-data/supplier';

type PaginatedSupplierResponse = LaravelApiResponse<{
  data: SupplierApiModel[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}>;

type SupplierItemResponse = LaravelApiResponse<SupplierApiModel>;

type DeleteResponse = LaravelApiResponse<null>;

export const getSuppliers = async (
  params: PaginationParams & {
    search?: string;
    user_id?: number | string;
    company_id?: number | string;
    code?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    case_sensitive?: 0 | 1 | boolean;
  },
): Promise<SupplierListResponse> => {
  const response = await apiClient.get<PaginatedSupplierResponse>(basePath, {
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
    mapSupplier,
  );
};

export const getSupplierById = async (id: number | string): Promise<Supplier> => {
  const response = await apiClient.get<SupplierItemResponse>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapSupplier(data);
};

const buildPayload = (payload: SupplierPayload, opts?: { asUpdate?: boolean }) => {
  const body = new FormData();
  if (opts?.asUpdate) body.append('_method', 'PUT');
  if (payload.userId !== undefined) body.append('user_id', String(payload.userId));
  if (payload.companyId !== undefined) body.append('company_id', String(payload.companyId));
  if (payload.code) body.append('code', payload.code);
  if (payload.type) body.append('type', payload.type);
  body.append('name', payload.name);
  if (payload.address) body.append('address', payload.address);
  if (payload.phone) body.append('phone', payload.phone);
  if (payload.npwp) body.append('npwp', payload.npwp);
  if (payload.pic) {
    body.append('pic', payload.pic);
    body.append('pic_name', payload.pic);
  }
  return body;
};

export const createSupplier = async (payload: SupplierPayload): Promise<Supplier> => {
  try {
    const body = buildPayload(payload);
    const response = await apiClient.post<SupplierItemResponse>(basePath, body);
    const data = ensureSuccess(response.data);
    return mapSupplier(data);
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateSupplier = async (id: number | string, payload: SupplierPayload): Promise<Supplier> => {
  try {
    const body = buildPayload(payload, { asUpdate: true });
    const response = await apiClient.post<SupplierItemResponse>(`${basePath}/${id}`, body);
    const data = ensureSuccess(response.data);
    return mapSupplier(data);
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteSupplier = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<DeleteResponse>(`${basePath}/${id}`);
  const payload = response.data;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete supplier');
  }
};
