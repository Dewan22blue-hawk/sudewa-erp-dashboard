import type { Armada, ArmadaListResponse, ArmadaPayload } from '@/@types/armada.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

const basePath = '/wapi/master-data/vehicle-fleet';

const mapArmada = (item: any): Armada => ({
  id: item.id,
  uuid: item.uuid,
  registrationNumber: item.registration_number || '',
  type: item.type || '',
  machineNumber: item.machine_number || '',
  chassisNumber: item.chassis_number || '',
  stnkAge: item.stnk_age ?? null,
  kirAge: item.kir_age ?? null,
  stnkNumber: item.stnk_number ?? null,
  kirBook: item.kir_book ?? null,
  equipment: Array.isArray(item.equipment) ? item.equipment.map(String) : [],
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export const getArmadas = async (
  params: PaginationParams & { search?: string },
): Promise<ArmadaListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(basePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      search: params.search,
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
    mapArmada,
  );
};

export const getArmadaById = async (id: string | number): Promise<Armada> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapArmada(data);
};

export const createArmada = async (payload: ArmadaPayload): Promise<void> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(basePath, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.data.status) {
      throw new ApiResponseError(response.data.message ?? 'Failed to create vehicle fleet');
    }
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateArmada = async (id: string | number, payload: ArmadaPayload): Promise<void> => {
  try {
    const response = await apiClient.put<LaravelApiResponse<any>>(`${basePath}/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.data.status) {
      throw new ApiResponseError(response.data.message ?? 'Failed to update vehicle fleet');
    }
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteArmada = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<any>>(`${basePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete vehicle fleet');
  }
};
