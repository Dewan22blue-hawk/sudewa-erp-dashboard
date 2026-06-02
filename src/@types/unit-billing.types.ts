export interface UnitBilling {
  id: string;
  company_id: string;
  unit_transaction_id: string;
  grand_total?: number;
  total_paid?: number;
  remaining_payment?: number;
  last_payment_at?: string;
  bca_payment: number;
  cash_payment: number;
  bca_payment_2: number;
  bca_payment_liability?: number;
  cash_payment_liability?: number;
  bca_payment_usd_liability?: number;
  payment_date: string;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitBillingHistory {
  id: string;
  unit_transaction_billing_id: string;
  unit_transaction_id?: string;
  payment_proof?: string | null;
  bca_payment_amount: number;
  cash_payment_amount: number;
  bca_payment_usd_amount: number;
  payment_methods?: string[];
  cashes?: Array<{
    id: string;
    code?: string;
    amount: number;
  }>;
  payment_at: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpsertUnitBillingPayload {
  company_id: string;
  unit_transaction_id: string;
  bca_payment: number;
  cash_payment: number;
  bca_payment_2?: number;
  payment_date: string;
  is_paid: boolean;
}

export interface CreateUnitBillingPayloadV2 {
  company_id: string;
  unit_transaction_id: string;
  is_paid?: boolean;
}

export interface CreateUnitBillingHistoryPayload {
  unit_transaction_billing_id: string;
  bca_payment_amount: number;
  cash_payment_amount: number;
  bca_payment_usd_amount: number;
  payment_at: string;
  note?: string;
}
