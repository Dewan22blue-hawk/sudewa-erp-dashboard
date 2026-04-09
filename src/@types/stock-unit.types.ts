export type StockStatus =
  | 'draft'
  | 'cancel'
  | 'rejected'
  | 'prepare'
  | 'inbound_purcase_order'
  | 'inbound_incoming_goods'
  | 'inbound_receipt'
  | 'inbound_return'
  | 'outbound_reserved'
  | 'outbound_in_transit'
  | 'outbound_delivered'
  | 'outbound_return';

export interface StockUnit {
  id: string;
  tipeUnit: string;
  warna: string;
  noMesin: string;
  noRangka: string;
  status: StockStatus;
}