import type { PaginatedResult } from './pagination.types';

export type KasType = 'cash' | 'bank';

export interface Kas {
  id: number | string;
  uuid?: string;
  code: string;
  description: string;
  type: KasType;
  companyId?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface KasPayload {
  code: string;
  description: string;
  type: KasType;
  companyId?: number | string;
}

export type KasListResponse = PaginatedResult<Kas>;
