import type { PaginatedResult } from './pagination.types';

export interface AccountGroup {
  id: number | string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AccountGroupDetail = AccountGroup;

export interface AccountGroupPayload {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface AccountGroupListResponse extends PaginatedResult<AccountGroup> {}
