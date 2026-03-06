import type { UnitBrand } from '@/@types/type-unit.types';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, LaravelApiResponse } from '@/lib/api/response';

interface BrandApiModel {
  id: number;
  name: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

type BrandListResponse = LaravelApiResponse<{
  data: BrandApiModel[];
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
}>;

const basePath = '/wapi/master-data/brand';

const mapBrand = (b: BrandApiModel): UnitBrand => ({
  id: b.id,
  name: b.name,
  image: b.image ?? null,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
});

export const getBrands = async (): Promise<UnitBrand[]> => {
  const response = await apiClient.get<BrandListResponse>(basePath);
  const data = ensureSuccess(response.data);
  const list = Array.isArray((data as any).data) ? (data as any).data : [];
  return list.map(mapBrand);
};

export interface CreateBrandPayload {
  name: string;
  image?: File | null;
  description?: string | null;
}

export const createBrand = async (payload: CreateBrandPayload): Promise<UnitBrand> => {
  const body = new FormData();
  body.append('name', payload.name);
  if (payload.image) body.append('image', payload.image);
  if (payload.description) body.append('description', payload.description);

  const response = await apiClient.post<LaravelApiResponse<BrandApiModel>>(basePath, body);
  const data = ensureSuccess(response.data);
  return mapBrand(data as BrandApiModel);
};
