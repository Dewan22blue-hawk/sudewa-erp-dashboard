export interface UnitBilling {
  id: string;
  company_id: string;
  unit_transaction_id: string;
  bca_payment: number;
  cash_payment: number;
  bca_payment_2: number;
  payment_date: string;
  is_paid: boolean;
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
