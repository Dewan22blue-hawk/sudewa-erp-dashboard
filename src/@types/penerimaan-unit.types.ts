export interface PenerimaanUnit {
  id: string;
  noPenerimaan: string;
  tanggal: string;
  supplier: string;
  keterangan?: string;
}

export interface PenerimaanUnitDetail {
  id: string;
  penerimaanId: string;
  noPembelian: string;
  tipeUnit: string;
  warna: string;
  noMesin: string;
  noRangka: string;
  diterima: boolean;
}
