import type { LaravelPagination, PaginationMeta } from '@/@types/pagination.types';

export interface KasHarianCash {
  id: number;
  uuid?: string;
  code: string;
  description: string;
  type: string;
}

export interface KasHarianAccount {
  id: number;
  uuid?: string;
  code: string;
  name: string;
  description?: string | null;
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
  account_id?: number | null;
  unit_transaction_billing_history_id?: number | null;
  code: string;
  date: string;
  note: string;
  debet: number;
  credit: number;
  transaction_category?: string;
  created_at?: string;
  updated_at?: string;
  cash: KasHarianCash;
  account?: KasHarianAccount | null;
  company: KasHarianCompany;
  finance_billing?: {
    id: number;
    uuid?: string;
    cash_flow_id?: number;
    unit_transaction_billing_id?: number;
    last_payment_at?: string;
    grand_total?: number;
    is_valid?: boolean;
    created_at?: string;
    updated_at?: string;
    finance_billing_items?: Array<{
      id: number;
      finance_billing_id: number;
      bca_payment_amount: number;
      bca_payment_usd_amount: number;
      cash_payment_amount: number;
      payment_proof: string | null;
      payment_at: string;
      note: string;
      created_at?: string;
      updated_at?: string;
    }>;
  } | null;
}

export interface CashFlowPayload {
  company_id: number;
  cash_id: number;
  account_id: number;
  date: string;
  note: string;
  debet: number;
  credit: number;
  transaction_category: string;
  payment_proof?: File | null;
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

export type KasHarianSource = 'billing' | 'manual';

export interface KasHarianListItem {
  id: number;
  source: KasHarianSource;
  date: string;
  code: string;
  note: string;
  debet: number;
  credit: number;
  accountName: string;
  cashName?: string;
  cashFlowId?: number;
  financeBillingId?: number;
  transaction_category?: string;
}
