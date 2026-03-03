import type { TypeUnit, TypeUnitListResponse, TypeUnitPayload, UnitBrand } from '@/@types/type-unit.types';
import { apiClient } from '@/lib/api/client';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess } from '@/lib/api/response';

interface TypeUnitApiModel {
  id: number;
  uuid?: string;
  brand_id: number;
  code: string;
  name: string;
  capacity?: number | null;
  image?: string | null;
  unit_type?: string | null;
  unit_model?: string | null;
  netto_weight?: number | string | null;
  bruto_weight?: number | string | null;
  created_at?: string;
  updated_at?: string;
  brand?: {
    id: number;
    uuid?: string;
    name: string;
    image?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
}

type TypeUnitListApiResponse = LaravelApiResponse<
  | TypeUnitApiModel[]
  | TypeUnitApiModel
  | {
      data: TypeUnitApiModel[];
      current_page?: number;
      per_page?: number;
      total?: number;
      last_page?: number;
    }
>;
type TypeUnitItemResponse = LaravelApiResponse<TypeUnitApiModel>;
type DeleteResponse = LaravelApiResponse<null>;

const basePath = '/wapi/master-data/unit-type';

const mapBrand = (brand?: TypeUnitApiModel['brand']): UnitBrand | null => {
  if (!brand) return null;
  return {
    id: brand.id,
    uuid: brand.uuid,
    name: brand.name,
    image: brand.image ?? null,
    createdAt: brand.created_at,
    updatedAt: brand.updated_at,
  };
};

const mapTypeUnit = (payload: TypeUnitApiModel): TypeUnit => ({
  id: payload.id,
  uuid: payload.uuid,
  brandId: payload.brand_id,
  code: payload.code,
  name: payload.name,
  capacity: payload.capacity ?? null,
  image: payload.image ?? null,
  unitType: payload.unit_type ?? null,
  unitModel: payload.unit_model ?? null,
  nettoWeight: payload.netto_weight === undefined || payload.netto_weight === null ? null : Number(payload.netto_weight),
  brutoWeight: payload.bruto_weight === undefined || payload.bruto_weight === null ? null : Number(payload.bruto_weight),
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
  brand: mapBrand(payload.brand),
});

const normalizeList = (
  data: TypeUnitApiModel[] | TypeUnitApiModel | { data: TypeUnitApiModel[]; current_page?: number; per_page?: number; total?: number; last_page?: number },
): { list: TypeUnitApiModel[]; meta?: { current_page?: number; per_page?: number; total?: number; last_page?: number } } => {
  if (Array.isArray(data)) return { list: data };
  if (data && Array.isArray((data as any).data)) {
    const payload = data as { data: TypeUnitApiModel[]; current_page?: number; per_page?: number; total?: number; last_page?: number };
    return { list: payload.data, meta: payload };
  }
  if (data) return { list: [data as TypeUnitApiModel] };
  return { list: [] };
};

export const getTypeUnits = async (): Promise<TypeUnitListResponse> => {
  const response = await apiClient.get<TypeUnitListApiResponse>(basePath);
  const data = ensureSuccess(response.data);
  const { list: rawList, meta } = normalizeList(data);
  const list = rawList.map(mapTypeUnit);
  return {
    data: list,
    meta: {
      currentPage: meta?.current_page ?? 1,
      perPage: meta?.per_page ?? (list.length || 1),
      total: meta?.total ?? list.length,
      lastPage: meta?.last_page ?? 1,
    },
  };
};

export const getTypeUnitById = async (id: number | string): Promise<TypeUnit> => {
  const response = await apiClient.get<TypeUnitItemResponse>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapTypeUnit(data);
};

const buildPayload = (payload: TypeUnitPayload, opts?: { asUpdate?: boolean }) => {
  const body = new FormData();
  if (opts?.asUpdate) body.append('_method', 'PUT');

  body.append('code', payload.code);
  body.append('brand_id', String(payload.brandId));
  body.append('name', payload.name);

  if (payload.capacity !== undefined && payload.capacity !== null) body.append('capacity', String(payload.capacity));
  if (payload.unitType) body.append('unit_type', payload.unitType);
  if (payload.unitModel) body.append('unit_model', payload.unitModel);
  if (payload.brutoWeight !== undefined && payload.brutoWeight !== null) body.append('bruto_weight', String(payload.brutoWeight));
  if (payload.nettoWeight !== undefined && payload.nettoWeight !== null) body.append('netto_weight', String(payload.nettoWeight));
  if (payload.image) body.append('image', payload.image);

  return body;
};

export const createTypeUnit = async (payload: TypeUnitPayload): Promise<TypeUnit> => {
  const body = buildPayload(payload);
  const response = await apiClient.post<TypeUnitItemResponse>(basePath, body); // biarkan browser set boundary multipart
  const data = ensureSuccess(response.data);
  return mapTypeUnit(data);
};

export const updateTypeUnit = async (id: number | string, payload: TypeUnitPayload): Promise<TypeUnit> => {
  const body = buildPayload(payload, { asUpdate: true });
  const response = await apiClient.post<TypeUnitItemResponse>(`${basePath}/${id}`, body); // _method=PUT di body
  const data = ensureSuccess(response.data);
  return mapTypeUnit(data);
};

export const deleteTypeUnit = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<DeleteResponse>(`${basePath}/${id}`);
  const payload = response.data;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete type unit');
  }
};
