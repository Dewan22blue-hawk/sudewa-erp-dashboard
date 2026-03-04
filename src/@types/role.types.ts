import { Permission } from './permission.types';

export interface Role {
  id: number | string;
  name: string;
  guard_name?: string;
  created_at?: string | null;
  updated_at?: string | null;
  users_count?: number;
  permissions?: Permission[];
}

export interface RolePayload {
  name: string;
  permissions?: string[];
}
