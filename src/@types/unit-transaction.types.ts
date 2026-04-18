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
  remainingPayment: number;
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
  max_capacity?: number;
  person: UnitTransactionPerson;
  warehouse: UnitTransactionWarehouse;
  unit_transaction_bruto_total: number;
  unit_transaction_item_total_hpp: number;
  unit_transaction_item_total_dpp: number;
  unit_transaction_item_total_ppn: number;
  unit_transaction_item_bruto_total: number;
  unit_transaction_adjustments?: any[];
  unit_transaction_items?: any[];
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
  hpp_total_price?: number;
  dpp_total_price: number;
  ppn_total_price: number;
}

export interface UnitTransactionItemListResponse {
  data: UnitTransactionItem[];
  meta: PaginationMeta;
}

export interface CreateUnitTransactionItemPayload {
  unit_transaction_id: string;
  unit_type_id: string;
  sparepart_id?: string;
  qty_total: number;
  price: number;
  bbn_price: number;
  expedition_fee: number;
  other_fee: number;
}

export interface UpdateUnitTransactionItemPayload {
  unit_transaction_id?: string;
  unit_type_id?: string;
  sparepart_id?: string;
  qty_total?: number;
  price?: number;
  bbn_price?: number;
  expedition_fee?: number;
  other_fee?: number;
}

export interface UnitTransactionItemSummary {
  id: string;
  unit_transaction_id: string;
  unit_transaction_code?: string;
  unit_type_id?: string;
  qty_total: number;
  price: number;
  bbn_price: number;
  expedition_fee: number;
  other_fee: number;
  hpp_per_unit_price?: number;
  dpp_per_unit_price?: number;
  ppn_per_unit_price?: number;
  hpp_total_price?: number;
  dpp_total_price?: number;
  ppn_total_price?: number;
}

export interface UnitTransactionItemDetail {
  id: string;
  unit_transaction_item_id: string;
  unit_type_name?: string;
  price?: number;
  color: string;
  machine_number: string;
  chassis_number: string;
  in_stock?: boolean;
  status?: string;
  created_at?: string;
}

export interface TransactionAdjustment {
  id: string;
  unit_transaction_id: string;
  cash_id?: string;
  amount: number;
  description: string;
  date?: string;
  created_at?: string;
}

export interface UnitTransactionItemDetailListResponse {
  data: UnitTransactionItemDetail[];
  meta: PaginationMeta;
}

export interface CreateUnitItemDetailPayload {
  unit_transaction_item_id: string;
  color: string;
  machine_number: string;
  chassis_number: string;
}

export interface UpdateUnitItemDetailPayload {
  unit_transaction_item_id: string;
  color: string;
  machine_number: string;
  chassis_number: string;
}

export interface WarehouseStockUnit {
  id: number;
  color: string;
  machine_number: string;
  chassis_number: string;
  unit_type_id?: string;
  warehouse_id?: string;
  in_stock?: boolean;
}

export interface UnitTransactionItemSalesAssignment {
  id: string;
  unit_transaction_item_id: string;
  unit_transaction_details: number[];
  details: WarehouseStockUnit[];
}
