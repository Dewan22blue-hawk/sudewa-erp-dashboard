import type { LaravelPagination, PaginationMeta } from '@/@types/pagination.types';

export interface KasHarianCash {
  id: number;
  uuid?: string;
  code: string;
  description: string;
  type: string;
}

export interface KasHarianCompany {
  id: number;
  uuid?: string;
  name: string;
}

export interface KasHarian {
  id: number;
  uuid?: string;
  company_id: number;
  cash_id: number;
  code: string;
  date: string;
  note: string;
  debet: number;
  credit: number;
  created_at?: string;
  updated_at?: string;
  cash: KasHarianCash;
  company: KasHarianCompany;
}

export interface CashFlowPayload {
  company_id: number;
  cash_id: number;
  date: string;
  note: string;
  debet: number;
  credit: number;
}

export interface CashFlowFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  code?: string;
  company_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface CashFlowListResponse {
  status: boolean;
  message?: string;
  errors: Record<string, string[]> | null;
  data: LaravelPagination<KasHarian>;
}

export interface CashFlowItemResponse {
  status: boolean;
  message?: string;
  errors: Record<string, string[]> | null;
  data: KasHarian;
}

export interface CashFlowListResult {
  data: KasHarian[];
  meta: PaginationMeta;
  hasNextPage: boolean;
}
