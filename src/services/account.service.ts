import type { Account, AccountDetail, AccountListResponse, AccountPayload } from '@/@types/account.types';
import type { PaginationParams } from '@/@types/pagination.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, LaravelApiResponse, ensureSuccess, toPaginatedResult } from '@/lib/api/response';

interface AccountApiModel {
  id: number;
  account_group_id: number;
  account_group_name?: string;
  account_group?: {
    id: number;
    name: string;
  };
  code: string;
  name: string;
  description?: string | null;
  type?: 'credit' | 'debet' | 'debit';
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

const mapAccount = (payload: AccountApiModel): Account => ({
  id: payload.id,
  code: payload.code,
  name: payload.name,
  accountGroupId: payload.account_group_id,
  accountGroupName: payload.account_group_name ?? payload.account_group?.name,
  group: payload.account_group_name ?? payload.account_group?.name,
  type: payload.type === 'debit' ? 'debet' : payload.type, // normalize to debet
  cashFlow: undefined,
  description: payload.description ?? null,
  isActive: payload.is_active === undefined ? true : payload.is_active === true || payload.is_active === 1,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const basePath = '/wapi/master-data/account';

type PaginatedAccountResponse = LaravelApiResponse<{
  data: AccountApiModel[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}>;

type AccountItemResponse = LaravelApiResponse<AccountApiModel>;

type DeleteResponse = LaravelApiResponse<null>;

export const getAccounts = async (params: PaginationParams & { search?: string }): Promise<AccountListResponse> => {
  const response = await apiClient.get<PaginatedAccountResponse>(basePath, {
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
    mapAccount,
  );
};

export const getAccountById = async (id: number | string): Promise<AccountDetail> => {
  const response = await apiClient.get<AccountItemResponse>(`${basePath}/${id}`);
  const data = ensureSuccess(response.data);
  return mapAccount(data);
};

export const createAccount = async (payload: AccountPayload): Promise<Account> => {
  try {
    const type = payload.type === 'debit' ? 'debet' : (payload.type ?? 'debet');
    // Use x-www-form-urlencoded to match backend expectation
    const body = new URLSearchParams();
    body.append('account_group_id', String(payload.accountGroupId));
    body.append('code', payload.code);
    body.append('name', payload.name);
    if (payload.description !== undefined && payload.description !== null) body.append('description', payload.description);
    body.append('type', type);

    const response = await apiClient.post<AccountItemResponse>(basePath, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = ensureSuccess(response.data);
    return mapAccount(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const updateAccount = async (id: number | string, payload: AccountPayload): Promise<Account> => {
  try {
    const type = payload.type === 'debit' ? 'debet' : (payload.type ?? 'debet');

    const body = new URLSearchParams();
    body.append('account_group_id', String(payload.accountGroupId));
    body.append('code', payload.code);
    body.append('name', payload.name);
    if (payload.description !== undefined && payload.description !== null) body.append('description', payload.description);
    body.append('type', type);

    const response = await apiClient.put<AccountItemResponse>(`${basePath}/${id}`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = ensureSuccess(response.data);
    return mapAccount(data);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw error;
  }
};

export const deleteAccount = async (id: number | string): Promise<void> => {
  const response = await apiClient.delete<DeleteResponse>(`${basePath}/${id}`);
  const payload = response.data;

  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to delete account');
  }
};

// Legacy helper retained for compatibility with older dropdowns that require a flat list
export const getAccountHierarchy = async (): Promise<Account[]> => {
  const { data } = await getAccounts({ page: 1, perPage: 1000 });
  return data;
};

export const importAccount = async (companyId: string | number, file: File): Promise<void> => {
  const body = new FormData();
  body.append('file', file);

  const response = await apiClient.post(`${basePath}/${companyId}/import`, body, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const payload = response.data as LaravelApiResponse<null>;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to import account');
  }
};
