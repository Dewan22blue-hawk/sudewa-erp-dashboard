import type { Sparepart, SparepartCategory, SparepartListResponse, SparepartPayload } from '@/@types/sparepart.types';
import { apiClient } from '@/lib/api/client';
import { ApiResponseError, LaravelApiResponse, ensureSuccess } from '@/lib/api/response';
import type { LaravelPagination } from '@/@types/pagination.types';

interface SparepartApiModel {
  id: number;
  uuid?: string;
  sparepart_category_id?: number;
  code: string;
  name: string;
  unit?: string;
  purchase_price?: number | string;
  selling_price?: number | string;
  company_id?: number | string;
  created_at?: string;
  updated_at?: string;
  group?: string;
  sparepart_category?: SparepartCategoryApiModel | null;
}

interface SparepartCategoryApiModel {
  id: number;
  uuid?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

type SparepartListApiResponse = LaravelApiResponse<SparepartApiModel[] | LaravelPagination<SparepartApiModel>>;
type SparepartItemApiResponse = LaravelApiResponse<SparepartApiModel>;
type SparepartCategoryListApiResponse = LaravelApiResponse<SparepartCategoryApiModel[]>;
type DeleteResponse = LaravelApiResponse<null>;

const sparepartBasePath = '/wapi/master-data/sparepart';
const categoryBasePath = '/wapi/master-data/sparepart-category';

const mapCategory = (payload?: SparepartCategoryApiModel | null): SparepartCategory | null => {
  if (!payload) return null;
  return {
    id: payload.id,
    uuid: payload.uuid,
    name: payload.name,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

const mapSparepart = (payload: SparepartApiModel): Sparepart => {
  const category = mapCategory(payload.sparepart_category);
  const purchasePrice = payload.purchase_price === undefined || payload.purchase_price === null ? 0 : Number(payload.purchase_price);
  const sellingPrice = payload.selling_price === undefined || payload.selling_price === null ? 0 : Number(payload.selling_price);

  return {
    id: payload.id,
    uuid: payload.uuid,
    code: payload.code,
    name: payload.name,
    categoryId: payload.sparepart_category_id ?? category?.id ?? null,
    unit: payload.unit ?? '',
    purchasePrice,
    sellingPrice,
    companyId: payload.company_id ?? null,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    category,
    group: payload.group ?? category?.name,
  };
};

const normalizeList = (data: SparepartApiModel[] | LaravelPagination<SparepartApiModel>): { list: SparepartApiModel[]; meta: { current_page: number; per_page: number; total: number; last_page: number } } => {
  if (Array.isArray(data)) {
    return { list: data, meta: { current_page: 1, per_page: data.length || 1, total: data.length, last_page: 1 } };
  }

  return {
    list: data.data ?? [],
    meta: {
      current_page: data.current_page ?? 1,
      per_page: data.per_page ?? (data.data?.length || 1),
      total: data.total ?? data.data?.length ?? 0,
      last_page: data.last_page ?? 1,
    },
  };
};

const buildPayload = (payload: SparepartPayload, opts?: { asUpdate?: boolean }) => {
  const body = new FormData();
  if (opts?.asUpdate) body.append('_method', 'PUT');

  body.append('code', payload.code);
  body.append('name', payload.name);
  body.append('sparepart_category_id', String(payload.categoryId));
  body.append('unit', payload.unit);
  body.append('purchase_price', String(payload.purchasePrice));
  body.append('selling_price', String(payload.sellingPrice));
  if (payload.companyId) body.append('company_id', String(payload.companyId));

  return body;
};

export const getSpareparts = async (companyId?: string | number): Promise<SparepartListResponse> => {
  const response = await apiClient.get<SparepartListApiResponse>(sparepartBasePath, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  const data = ensureSuccess(response.data);
  const { list, meta } = normalizeList(data);

  return {
    data: list.map(mapSparepart),
    meta: {
      currentPage: meta.current_page,
      perPage: meta.per_page,
      total: meta.total,
      lastPage: meta.last_page,
    },
  };
};

export const getSparepartCategories = async (): Promise<SparepartCategory[]> => {
  const response = await apiClient.get<SparepartCategoryListApiResponse>(categoryBasePath);
  const data = ensureSuccess(response.data);
  return data.map(mapCategory).filter(Boolean) as SparepartCategory[];
};

export const createSparepart = async (payload: SparepartPayload): Promise<Sparepart> => {
  const body = buildPayload(payload);
  const response = await apiClient.post<SparepartItemApiResponse>(sparepartBasePath, body);
  const data = ensureSuccess(response.data);
  return mapSparepart(data);
};

export const updateSparepart = async (id: number | string, payload: SparepartPayload): Promise<Sparepart> => {
  const body = buildPayload(payload, { asUpdate: true });
  const response = await apiClient.post<SparepartItemApiResponse>(`${sparepartBasePath}/${id}`, body);
  const data = ensureSuccess(response.data);
  return mapSparepart(data);
};

export const deleteSparepart = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<DeleteResponse>(`${sparepartBasePath}/${id}`);
  const payload = response.data;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete sparepart');
  }
};

export const importSparepart = async (file: File, companyId?: string | number): Promise<void> => {
  const body = new FormData();
  body.append('file', file);
  if (companyId) body.append('company_id', String(companyId));

  const response = await apiClient.post<DeleteResponse>(`${sparepartBasePath}/import`, body);
  const payload = response.data;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to import sparepart');
  }
};
