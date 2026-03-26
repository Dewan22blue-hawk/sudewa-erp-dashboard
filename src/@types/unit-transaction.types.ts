import { PaginationMeta } from '@/@types/pagination.types';

export interface UnitTransactionBilling {
  is_paid?: boolean;
  payment_at?: string | null;
}

export interface UnitTransaction {
  id: string;
  code: string;
  created_at: string;
  supplier: string;
  warehouse: string;
  transaction_bruto_total: number;
  transaction_dpp_total: number;
  transaction_ppn_total: number;
  transaction_bbn_total: number;
  transaction_other_fee: number;
  stock_state: string;
  unit_transaction_billing?: UnitTransactionBilling | null;
  isPaid: boolean;
  paymentAt: string | null;
}

export interface UnitTransactionResponse {
  data: UnitTransaction[];
  meta: PaginationMeta;
}

export interface UnitTransactionPerson {
  id?: string;
  name: string;
}

export interface UnitTransactionWarehouse {
  id?: string;
  name: string;
}

export interface UnitTransactionDetail {
  id: string;
  code: string;
  created_at: string;
  stock_state: string;
  person: UnitTransactionPerson;
  warehouse: UnitTransactionWarehouse;
  unit_transaction_item_total_dpp: number;
  unit_transaction_item_total_ppn: number;
  unit_transaction_item_bruto_total: number;
}

export interface UnitTransactionItem {
  id: string;
  unit_transaction_id: string;
  unit_type_id?: string;
  sparepart_id?: string;
  qty_total: number;
  price: number;
  bbn_price: number;
  expedition_fee: number;
  other_fee: number;
  dpp_total_price: number;
  ppn_total_price: number;
}

export interface UnitTransactionItemListResponse {
  data: UnitTransactionItem[];
  meta: PaginationMeta;
}

export interface CreateUnitTransactionItemPayload {
  unit_transaction_id: string;
  unit_type_id?: string;
  sparepart_id?: string;
  qty_total: number;
  price: number;
  bbn_price: number;
  expedition_fee: number;
  other_fee: number;
}

export interface UpdateUnitTransactionItemPayload extends CreateUnitTransactionItemPayload {}
