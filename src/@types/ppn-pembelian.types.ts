import { z } from 'zod';
import type { LaravelPagination } from '@/@types/pagination.types';
import type { PaginationMeta } from '@/@types/pagination.types';

export interface UnitType {
  id: number;
  code: string;
  name: string;
  unit_type: string;
  unit_model: string;
}

export interface UnitTransactionItemDetail {
  id: number;
  machine_number: string;
  chassis_number: string;
  color: string;
}

export interface PPNPembelian {
  id: number;
  code: string;
  buy_date: string;
  supplier: string;
  fp_date: string | null;
  nsfp_age: string | null;
  nsfp_input: number;
  qty: number;
  unit_type: UnitType;
  unit_transaction_item_detail: UnitTransactionItemDetail;
  unit_price: number;
  dpp_amount: number;
  ppn_11: number;
  payment_amount: number;
}

export interface UpdatePPNPembelianPayload {
  fp_date?: string;
  nsfp_age?: string;
  nsfp_amount?: number;
  amount?: number;
}

export interface UpdatePPNPembelianMutationPayload {
  id: number;
  payload: UpdatePPNPembelianPayload;
}

export interface PPNPembelianListResponse {
  status: boolean;
  message: string;
  errors: Record<string, string[]> | null;
  data: LaravelPagination<PPNPembelian>;
}

export interface PPNPembelianUpdateResponse {
  status: boolean;
  message: string;
  errors: Record<string, string[]> | null;
  data: {
    id: number;
    fp_date: string | null;
    nsfp_age: string | null;
    nsfp_amount: string;
    amount: string;
  };
}

export const UpdatePPNPembelianSchema = z.object({
  fp_date: z.date().optional().nullable(),
  nsfp_age: z.date().optional().nullable(),
  nsfp_amount: z.number().optional().nullable(),
  amount: z.number().optional().nullable(),
});

export type UpdatePPNPembelianFormValues = z.infer<typeof UpdatePPNPembelianSchema>;

export interface PPNPembelianFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface PPNPembelianListResult {
  data: PPNPembelian[];
  meta: PaginationMeta;
  hasNextPage: boolean;
  isTotalExact: boolean;
}
