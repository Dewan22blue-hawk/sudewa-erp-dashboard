import type { PaginatedResult } from './pagination.types';

export interface SparepartCategory {
  id: number;
  uuid?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sparepart {
  id: number | string;
  uuid?: string;
  code: string;
  name: string;
  categoryId: number | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  companyId?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: SparepartCategory | null;
  // For backward compatibility with the previous UI naming
  group?: string;
}

export interface SparepartPayload {
  code: string;
  name: string;
  categoryId: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  companyId?: string | number;
}

export type SparepartListResponse = PaginatedResult<Sparepart>;
