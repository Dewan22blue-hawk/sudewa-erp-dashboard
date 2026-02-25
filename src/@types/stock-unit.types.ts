export type StockStatus = 'in_transit' | 'available' | 'reserved';

export interface StockUnit {
  id: string;
  tipeUnit: string;
  warna: string;
  noMesin: string;
  noRangka: string;
  supplier: string;
  customer?: string | null;
  status: StockStatus;
}
