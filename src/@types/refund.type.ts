import { PaginationMeta } from '@/@types/pagination.types';
import { UnitTransactionItemDetail } from './unit-transaction.types';

export interface RefundStatus {
  id: string;
  name: string;
  slug: 'waiting' | 'approve' | 'reject';
}

export interface UnitTransactionRefund {
  id: string;
  code: string;
  unit_transaction_id: string;
  refund_date: string;
  refund_amount: number;
  note: string;
  status: 'waiting' | 'approve' | 'reject' | string;
  created_at: string;
  items?: UnitTransactionItemDetail[];
  payments?: UnitTransactionRefundPayment[];
  transaction?: {
    id?: string;
    code?: string;
    type?: string;
    person?: {
      id?: string;
      name?: string;
    } | null;
  } | null;
}

export interface UnitTransactionRefundPayment {
  id: string;
  unit_transaction_refund_id: string;
  cash_id?: string;
  amount: number;
  payment_date: string;
  created_at: string;
  note?: string;
}

export interface UnitTransactionRefundListResponse {
  data: UnitTransactionRefund[];
  meta: PaginationMeta;
}

export interface CreateRefundPayload {
  unit_transaction_id: string;
  refund_date: string;
  refund_amount: number;
  note?: string;
  unit_transaction_item_detail_ids: string[]; // string[] or number[]
}

export interface UpdateRefundPayload {
  refund_date?: string;
  refund_amount?: number;
  note?: string;
}

export interface CreateRefundPaymentPayload {
  unit_transaction_refund_id: string;
  amount: number;
  payment_date: string;
  note?: string;
}

export interface UpdateRefundPaymentPayload {
  amount?: number;
  payment_date?: string;
  note?: string;
}
