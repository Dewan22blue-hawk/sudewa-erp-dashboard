import type { AccountGroup, AccountGroupDetail, AccountGroupListResponse, AccountGroupPayload } from '@/@types/account-group.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface AccountGroupApiModel {
  id: number;
  uuid?: string;
  group_code?: string;
  code?: string;
  name?: string;
  description?: string | null;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

// API may return `group_code` + `description` (no `name`). We fallback to keep dropdown non-empty.
const mapAccountGroup = (payload: AccountGroupApiModel): AccountGroup => {
  const code = payload.group_code ?? payload.code ?? '';
  const name = payload.name ?? payload.description ?? code;

  return {
    id: payload.id,
    code,
    name,
    description: payload.description ?? null,
    isActive: payload.is_active === undefined ? true : payload.is_active === true || payload.is_active === 1,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

const basePath = '/wapi/master-data/account-group';

type PaginatedAccountGroupResponse = LaravelApiResponse<{
  data: AccountGroupApiModel[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}>;

type AccountGroupItemResponse = LaravelApiResponse<AccountGroupApiModel>;

type DeleteResponse = LaravelApiResponse<null>;

export const getAccountGroups = async (params: PaginationParams): Promise<AccountGroupListResponse> => {
  const response = await apiClient.get<PaginatedAccountGroupResponse>(basePath, {
    params: buildLaravelPaginationQuery(params),
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
    mapAccountGroup,
  );
};

export const getAccountGroupById = async (id: number | string): Promise<AccountGroupDetail> => {
  const response = await apiClient.get<AccountGroupItemResponse>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapAccountGroup(data);
};

export const createAccountGroup = async (payload: AccountGroupPayload): Promise<AccountGroup> => {
  try {
    const response = await apiClient.post<AccountGroupItemResponse>(basePath, {
      code: payload.code,
      name: payload.name,
      description: payload.description,
      is_active: payload.isActive ?? true,
    });

    const data = ensureSuccess(response.data);
    return mapAccountGroup(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const updateAccountGroup = async (id: number | string, payload: AccountGroupPayload): Promise<AccountGroup> => {
  try {
    const response = await apiClient.put<AccountGroupItemResponse>(`${basePath}/${id}`, {
      code: payload.code,
      name: payload.name,
      description: payload.description,
      is_active: payload.isActive ?? true,
    });

    const data = ensureSuccess(response.data);
    return mapAccountGroup(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const deleteAccountGroup = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<DeleteResponse>(`${basePath}/${id}`);
  const payload = response.data;

  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete account group');
  }
};
