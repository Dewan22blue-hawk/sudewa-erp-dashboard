import type { Brand, BrandDetail, BrandListResponse, BrandPayload } from '@/@types/brand.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface BrandApiModel {
  id: number;
  name: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

const mapBrand = (payload: BrandApiModel): Brand => {
  return {
    id: payload.id,
    name: payload.name,
    image: payload.image ?? null,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

const basePath = '/wapi/master-data/brand';

type PaginatedBrandResponse = LaravelApiResponse<{
  data: BrandApiModel[];
  current_page: number;
  perPage: number;
  total: number;
  last_page: number;
}>;

type BrandItemResponse = LaravelApiResponse<BrandApiModel>;

export const getBrands = async (params: PaginationParams): Promise<BrandListResponse> => {
  const response = await apiClient.get<PaginatedBrandResponse>(basePath, {
    params: buildLaravelPaginationQuery(params),
  });

  const data = ensureSuccess(response.data);

  return toPaginatedResult(
    {
      data: data.data ?? [],
      current_page: data.current_page,
      per_page: data.perPage,
      total: data.total,
      last_page: data.last_page,
    },
    mapBrand,
  );
};

export const getBrandById = async (id: number | string): Promise<BrandDetail> => {
  const response = await apiClient.get<BrandItemResponse>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapBrand(data);
};

export const createBrand = async (payload: BrandPayload): Promise<Brand> => {
  try {
    const body = new FormData();
    body.append('name', payload.name);
    if (payload.image instanceof File) {
      body.append('image', payload.image);
    }

    const response = await apiClient.post<BrandItemResponse>(basePath, body);
    const data = ensureSuccess(response.data);
    return mapBrand(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const updateBrand = async (id: number | string, payload: BrandPayload): Promise<Brand> => {
  try {
    const body = new FormData();
    body.append('name', payload.name);
    // Method spoofing for Laravel if needed, but typically FormData + PUT needs special handling or POST + _method
    body.append('_method', 'PUT');

    if (payload.image instanceof File) {
      body.append('image', payload.image);
    }

    const response = await apiClient.post<BrandItemResponse>(`${basePath}/${id}`, body);
    const data = ensureSuccess(response.data);
    return mapBrand(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const deleteBrand = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<null>>(`${basePath}/${id}`);
  const payload = response.data;

  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete brand');
  }
};
