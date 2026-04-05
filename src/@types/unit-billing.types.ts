export interface UnitBilling {
  id: string;
  company_id: string;
  unit_transaction_id: string;
<<<<<<< HEAD
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
=======
  bca_payment: number;
  cash_payment: number;
  bca_payment_2: number;
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
  payment_date: string;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
}

<<<<<<< HEAD
export interface UnitBillingHistory {
  id: string;
  unit_transaction_billing_id: string;
  unit_transaction_id?: string;
  bca_payment_amount: number;
  cash_payment_amount: number;
  bca_payment_usd_amount: number;
  payment_at: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

=======
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
export interface UpsertUnitBillingPayload {
  company_id: string;
  unit_transaction_id: string;
  bca_payment: number;
  cash_payment: number;
  bca_payment_2?: number;
  payment_date: string;
  is_paid: boolean;
}
<<<<<<< HEAD

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
=======
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
