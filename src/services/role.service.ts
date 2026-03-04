import { apiClient } from '@/lib/api/client';
import { ensureSuccess, type LaravelApiResponse, ApiResponseError } from '@/lib/api/response';
import { UserRoleItem } from '@/@types/user.types';
import { Role, RolePayload } from '@/@types/role.types';

type RoleApiModel = {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  users_count?: number;
  permissions?: PermissionApiModel[];
};

type PermissionApiModel = {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  pivot?: Record<string, unknown>;
};

type RolesResponse = LaravelApiResponse<RoleApiModel[] | RoleApiModel>;
type RoleItemResponse = LaravelApiResponse<RoleApiModel>;

const basePath = '/wapi/roles';

const mapRole = (payload: RoleApiModel): UserRoleItem => ({
  id: payload.id,
  name: payload.name,
  guard_name: payload.guard_name,
  created_at: payload.created_at,
  updated_at: payload.updated_at,
  users_count: payload.users_count,
});

const mapRoleDetail = (payload: RoleApiModel): Role => ({
  id: payload.id,
  name: payload.name,
  guard_name: payload.guard_name,
  created_at: payload.created_at,
  updated_at: payload.updated_at,
  users_count: payload.users_count,
  permissions: payload.permissions?.map((p) => ({
    id: p.id,
    name: p.name,
    guard_name: p.guard_name,
    created_at: p.created_at,
    updated_at: p.updated_at,
  })),
});

export const getRoles = async (search?: string): Promise<UserRoleItem[]> => {
  const response = await apiClient.get<RolesResponse>(basePath, {
    params: search ? { search } : undefined,
  });
  const data = ensureSuccess(response.data);
  const list = Array.isArray(data) ? data : [data];
  return list.map(mapRole);
};

export const getRoleDetail = async (id: number | string, opts?: { withoutPermission?: boolean }): Promise<Role> => {
  const response = await apiClient.get<RoleItemResponse>(`${basePath}/${id}`, {
    params: opts?.withoutPermission ? { without_permission: true } : undefined,
  });
  const data = ensureSuccess(response.data);
  return mapRoleDetail(data);
};

const buildRolePayload = (payload: RolePayload) => {
  const body = new FormData();
  body.append('name', payload.name);
  if (payload.permissions && payload.permissions.length > 0) {
    body.append('permissions', payload.permissions.join(','));
  }
  return body;
};

export const createRole = async (payload: RolePayload): Promise<Role> => {
  const body = buildRolePayload(payload);
  const response = await apiClient.post<RoleItemResponse>(basePath, body);
  const data = ensureSuccess(response.data);
  return mapRoleDetail(data);
};

export const assignRolePermissions = async (id: number | string, permissions: string[]): Promise<void> => {
  const params = { permissions: permissions.join(',') };
  const response = await apiClient.post<LaravelApiResponse<null>>(`${basePath}/${id}/assign-permissions`, undefined, { params });
  const payload = response.data;
  if (!payload.status) {
    throw new ApiResponseError(payload.message ?? 'Failed to assign permissions');
  }
};
