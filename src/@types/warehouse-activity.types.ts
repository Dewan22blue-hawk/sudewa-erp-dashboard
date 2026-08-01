export interface WarehouseActivity {
  id: number;
  uuid: string;
  person_id: number;
  cash_id: number | null;
  warehouse_id: number;
  unit_transaction_id: number | null;
  activity_number: string;
  activity_type: 'receipt' | 'issue' | string;
  activity_date: string;
  description: string | null;
  state: 'draft' | 'process' | 'done' | string;
}
