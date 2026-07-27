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

export interface PPNPenjualan {
  id: number;
  code: string;
  buy_date: string;
  supplier: string;
  fp_date: string | null;
  nsfp_age: string | null;
  qty: number;
  unit_type: UnitType;
  unit_transaction_item_detail: UnitTransactionItemDetail;
  unit_price: number;
  total_price: number;
  dpp_amount: number;
  ppn_11: number;
  payment_amount: number;
  nsfp_number: string | null;
}

export interface UpdatePPNPenjualanPayload {
  fp_date?: string;
  nsfp_age?: string;
  amount?: number;
  nsfp_number?: string;
}

export interface UpdatePPNPenjualanMutationPayload {
  id: number;
  payload: UpdatePPNPenjualanPayload;
}

export interface PPNPenjualanListResponse {
  status: boolean;
  message: string;
  errors: Record<string, string[]> | null;
  data: LaravelPagination<PPNPenjualan>;
}

export interface PPNPenjualanUpdateResponse {
  status: boolean;
  message: string;
  errors: Record<string, string[]> | null;
  data: {
    id: number;
    fp_date: string | null;
    nsfp_age: string | null;
    amount: string;
  };
}

export const UpdatePPNPenjualanSchema = z.object({
  fp_date: z.date().optional().nullable(),
  nsfp_age: z.date().optional().nullable(),
  amount: z.number().optional().nullable(),
  nsfp_number: z.string().optional().nullable(),
});

export type UpdatePPNPenjualanFormValues = z.infer<typeof UpdatePPNPenjualanSchema>;

export interface PPNPenjualanFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface PPNPenjualanListResult {
  data: PPNPenjualan[];
  meta: PaginationMeta;
  hasNextPage: boolean;
  isTotalExact: boolean;
}
