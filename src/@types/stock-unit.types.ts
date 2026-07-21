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

export type Status = 'normal' | 'minor_damage' | 'major_damage' | 'returned' | 'refunded' | 'lost' | 'in_repair';

export interface StockUnit {
  id: string;
  namaUnit: string;
  warna: string;
  noMesin: string;
  noRangka: string;
  status: Status;
  stockStatus: StockStatus;
}
