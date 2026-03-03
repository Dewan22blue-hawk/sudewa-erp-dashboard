import { apiClient } from '@/lib/api/client';
import { ensureSuccess, type LaravelApiResponse } from '@/lib/api/response';
import { UserRoleItem } from '@/@types/user.types';

type RoleApiModel = {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  users_count?: number;
};

type RolesResponse = LaravelApiResponse<RoleApiModel[] | RoleApiModel>;

const basePath = '/wapi/roles';

const mapRole = (payload: RoleApiModel): UserRoleItem => ({
  id: payload.id,
  name: payload.name,
  guard_name: payload.guard_name,
  created_at: payload.created_at,
  updated_at: payload.updated_at,
});

export const getRoles = async (search?: string): Promise<UserRoleItem[]> => {
  const response = await apiClient.get<RolesResponse>(basePath, {
    params: search ? { search } : undefined,
  });
  const data = ensureSuccess(response.data);
  const list = Array.isArray(data) ? data : [data];
  return list.map(mapRole);
};
