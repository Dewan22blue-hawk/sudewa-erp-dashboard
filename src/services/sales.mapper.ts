import { SalesItem, SalesLineItem } from '@/components/features/sales/sales.data';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';

export type SalesApiModel = {
  id?: number | string;
  company_id?: number | string;
  person_id?: number | string;
  warehouse_id?: number | string;
  code?: string;
  type?: string;
  max_capacity?: number | string;
  stock_state?: string;
  created_at?: string;
  transaction_bruto_total?: string | number;
  transaction_dpp_total?: string | number;
  transaction_ppn_total?: string | number;
  transaction_bbn_total?: string | number;
  transaction_other_fee?: string | number;
  person?: {
    id?: number | string;
    name?: string;
  };
  warehouse?: {
    id?: number | string;
    name?: string;
  };
  unit_transaction_billing?: {
    is_paid?: boolean;
    total_paid?: string | number;
  } | null;
  unit_transaction_item_total_dpp?: string | number;
  unit_transaction_item_total_ppn?: string | number;
  unit_transaction_item_bruto_total?: string | number;
  unit_transaction_items?: Array<{
    id?: number | string;
    unit_type_id?: number | string;
    unit_type?: {
      name?: string;
    };
    qty_total?: string | number;
    price?: string | number;
    bbn_price?: string | number;
    expedition_fee?: string | number;
    other_fee?: string | number;
    hpp_total_price?: string | number;
    dpp_total_price?: string | number;
    ppn_total_price?: string | number;
    unit_transaction_item_details?: Array<{
      id?: number | string;
      color?: string;
      machine_number?: string;
      chassis_number?: string;
    }>;
  }>;
};

export type SalesListUI = {
  id: string;
  code: string;
  customerName: string;
  warehouseName: string;
  total: number;
  date: string;
  status: 'Lunas' | 'Belum';
};

const toNumber = (value: string | number | undefined): number => Number(value ?? 0);

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export function mapSalesToUI(item: SalesApiModel): SalesListUI {
  return {
    id: String(item.id ?? ''),
    code: item.code ?? '-',
    customerName: item.person?.name ?? '-',
    warehouseName: item.warehouse?.name ?? '-',
    total: toNumber(item.transaction_bruto_total),
    date: item.created_at ?? '',
    status: item.unit_transaction_billing?.is_paid ? 'Lunas' : 'Belum',
  };
}

export const mapSalesToTableItem = (item: SalesApiModel): SalesItem => {
  const mapped = mapSalesToUI(item);
  const totalDpp = toNumber(item.transaction_dpp_total);
  const totalPpn = toNumber(item.transaction_ppn_total);
  const totalBiaya = toNumber(item.transaction_bbn_total) + toNumber(item.transaction_other_fee);
  const totalJual = mapped.total;
  const totalBayar = toNumber(item.unit_transaction_billing?.total_paid);

  return {
    id: mapped.id,
    kodeJual: mapped.code,
    tanggal: formatDate(mapped.date),
    customer: mapped.customerName,
    tipeUnit: '-',
    hargaSatuan: 0,
    qty: toNumber(item.max_capacity),
    biayaBbn: toNumber(item.transaction_bbn_total),
    biayaEkspedisi: 0,
    biayaLain: toNumber(item.transaction_other_fee),
    totalHpp: totalDpp,
    totalDpp,
    totalPpn,
    totalBiaya,
    totalJual,
    totalBayar,
    kurangBayar: Math.max(totalJual - totalBayar, 0),
    lineItems: [],
    units: [],
  };
};

const mapSalesLineItem = (item: NonNullable<SalesApiModel['unit_transaction_items']>[number], index: number): SalesLineItem => {
  const qty = toNumber(item.qty_total);
  const hargaJual = toNumber(item.price);
  const biayaBbn = toNumber(item.bbn_price);
  const biayaEkspedisi = toNumber(item.expedition_fee);
  const biayaLain = toNumber(item.other_fee);
  const hpp = toNumber(item.hpp_total_price);
  const dpp = toNumber(item.dpp_total_price);
  const ppn = toNumber(item.ppn_total_price);

  return {
    id: String(item.id ?? index + 1),
    tipeUnit: item.unit_type?.name ?? '-',
    qty,
    hargaJual,
    biayaBbn,
    biayaEkspedisi,
    biayaLain,
    hpp,
    dpp,
    ppn,
    jumlah: hpp + ppn + biayaBbn + biayaEkspedisi + biayaLain,
  };
};

export const mapSalesDetailToUI = (item: SalesApiModel): SalesItem => {
  const totalDpp = toNumber(item.unit_transaction_item_total_dpp ?? item.transaction_dpp_total);
  const totalPpn = toNumber(item.unit_transaction_item_total_ppn ?? item.transaction_ppn_total);
  const totalJual = toNumber(item.unit_transaction_item_bruto_total ?? item.transaction_bruto_total);
  const totalBayar = toNumber(item.unit_transaction_billing?.total_paid);
  const qty = toNumber(item.max_capacity);

  return {
    id: String(item.id ?? ''),
    kodeJual: item.code ?? '-',
    tanggal: formatDate(item.created_at),
    customer: item.person?.name ?? '-',
    tipeUnit: item.unit_transaction_items?.[0]?.unit_type?.name ?? '-',
    hargaSatuan: toNumber(item.unit_transaction_items?.[0]?.price),
    qty,
    biayaBbn: toNumber(item.transaction_bbn_total),
    biayaEkspedisi: item.unit_transaction_items?.reduce((acc, row) => acc + toNumber(row.expedition_fee), 0) ?? 0,
    biayaLain: toNumber(item.transaction_other_fee),
    totalHpp: totalDpp,
    totalDpp,
    totalPpn,
    totalBiaya: toNumber(item.transaction_bbn_total) + toNumber(item.transaction_other_fee),
    totalJual,
    totalBayar,
    kurangBayar: Math.max(totalJual - totalBayar, 0),
    lineItems: (item.unit_transaction_items ?? []).map(mapSalesLineItem),
    units: [],
  };
};

export const mapSalesDetailCard = (item: SalesApiModel) => ({
  code: item.code ?? '-',
  customerName: item.person?.name ?? '-',
  warehouse: item.warehouse?.name ?? '-',
  total: toNumber(item.unit_transaction_item_bruto_total),
  dpp: toNumber(item.unit_transaction_item_total_dpp),
  ppn: toNumber(item.unit_transaction_item_total_ppn),
});

export const mapSalesDetailToEditForm = (item: SalesApiModel): EditUnitFormData => {
  const qty = Math.max(toNumber(item.max_capacity), 1);
  const totalDpp = toNumber(item.unit_transaction_item_total_dpp ?? item.transaction_dpp_total);
  const totalPpn = toNumber(item.unit_transaction_item_total_ppn ?? item.transaction_ppn_total);

  return {
    customer: item.person?.name ?? '',
    tipeUnit: item.unit_transaction_items?.[0]?.unit_type?.name ?? 'Product A',
    qty,
    harga: toNumber(item.unit_transaction_items?.[0]?.price),
    biayaBbn: toNumber(item.transaction_bbn_total),
    biayaEkspedisi: item.unit_transaction_items?.reduce((acc, row) => acc + toNumber(row.expedition_fee), 0) ?? 0,
    biayaLain: toNumber(item.transaction_other_fee),
    hppSatuan: totalDpp / qty,
    totalHpp: totalDpp,
    dppSatuan: totalDpp / qty,
    totalDpp,
    ppnSatuan: totalPpn / qty,
    totalPpn,
  };
};
