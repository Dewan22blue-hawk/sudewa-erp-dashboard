import type { AccountGroup, AccountGroupDetail, AccountGroupListResponse, AccountGroupPayload } from '@/@types/account-group.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface AccountGroupApiModel {
  id: number;
  company_id?: string | number | null;
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
    companyId: payload.company_id ?? null,
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
  per_page?: number;
  perPage?: number;
  total: number;
  last_page: number;
}>;

type AccountGroupItemResponse = LaravelApiResponse<AccountGroupApiModel>;

type DeleteResponse = LaravelApiResponse<null>;

export const getAccountGroups = async (params: PaginationParams & { company_id?: string | number }): Promise<AccountGroupListResponse> => {
  const response = await apiClient.get<PaginatedAccountGroupResponse>(basePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      company_id: params.company_id,
    },
  });

  const data = ensureSuccess(response.data);
  const scopedData = params.company_id
    ? (data.data ?? []).filter((item) => {
        if (item.company_id === undefined || item.company_id === null) return true;
        return String(item.company_id) === String(params.company_id);
      })
    : (data.data ?? []);

  return toPaginatedResult(
    {
      data: scopedData,
      current_page: data.current_page,
      per_page: data.per_page ?? data.perPage ?? params.perPage ?? 10,
      total: params.company_id ? scopedData.length : data.total,
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
      company_id: payload.company_id,
      group_code: payload.group_code,
      description: payload.description,
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

/** Quick create used from modal (uses FormData + group_code/company_id as required by backend) */
export interface QuickCreateAccountGroupPayload {
  companyId: string | number;
  groupCode: string;
  description?: string | null;
}

export const quickCreateAccountGroup = async (payload: QuickCreateAccountGroupPayload): Promise<AccountGroup> => {
  const body = new FormData();
  body.append('company_id', String(payload.companyId));
  body.append('group_code', payload.groupCode);
  if (payload.description) body.append('description', payload.description);

  const response = await apiClient.post<AccountGroupItemResponse>(basePath, body);
  const data = ensureSuccess(response.data);
  return mapAccountGroup(data);
};

export const updateAccountGroup = async (id: number | string, payload: AccountGroupPayload): Promise<AccountGroup> => {
  try {
    const response = await apiClient.put<AccountGroupItemResponse>(`${basePath}/${id}`, {
      company_id: payload.company_id,
      group_code: payload.group_code,
      description: payload.description,
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
