import { apiClient } from '@/lib/api/client';

export interface PurchaseTransactionParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  person_id?: number;
  search?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PurchaseTransactionItem {
  id: number;
  code: string;
  created_at: string;
  person?: { id: number; name: string };
  person_id?: number;
  unit_transaction_item_counts?: number;
  unit_transaction_items?: Array<{
    unit_type?: { name?: string };
    qty_total: number;
    price: number;
    bbn_price: number;
    expedition_fee: number;
    other_fee: number;
    hpp_total_price: number;
    dpp_total_price: number;
    ppn_total_price: number;
  }>;
  transaction_bruto_total: number;
  transaction_dpp_total: number;
  transaction_ppn_total: number;
  transaction_bbn_total: number;
  transaction_other_fee: number;
}

export interface PurchaseTransactionResponse {
  current_page: number;
  data: PurchaseTransactionItem[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

type RawPurchaseTransactionItem = Record<string, any>;

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const mapPurchaseItem = (raw: RawPurchaseTransactionItem): PurchaseTransactionItem => {
  const rawUnitItems = Array.isArray(raw?.unit_transaction_items)
    ? raw.unit_transaction_items
    : Array.isArray(raw?.unitTransactionItems)
      ? raw.unitTransactionItems
      : [];

  const unitItems = rawUnitItems.map((unit: RawPurchaseTransactionItem) => ({
    unit_type: {
      name:
        unit?.unit_type?.name ??
        unit?.unitType?.name ??
        unit?.unit_type_name ??
        unit?.unitTypeName ??
        '-',
    },
    qty_total: toNumber(unit?.qty_total ?? unit?.qty),
    price: toNumber(unit?.price),
    bbn_price: toNumber(unit?.bbn_price ?? unit?.bbnPrice),
    expedition_fee: toNumber(unit?.expedition_fee ?? unit?.expeditionFee),
    other_fee: toNumber(unit?.other_fee ?? unit?.otherFee),
    hpp_total_price: toNumber(unit?.hpp_total_price ?? unit?.hppTotalPrice),
    dpp_total_price: toNumber(unit?.dpp_total_price ?? unit?.dppTotalPrice),
    ppn_total_price: toNumber(unit?.ppn_total_price ?? unit?.ppnTotalPrice),
  }));

  return {
    id: toNumber(raw?.id),
    code: String(raw?.code ?? '-'),
    created_at: String(raw?.created_at ?? raw?.createdAt ?? ''),
    person: raw?.person
      ? {
          id: toNumber(raw.person?.id),
          name: String(raw.person?.name ?? '-'),
        }
      : undefined,
    person_id: raw?.person_id !== undefined ? toNumber(raw.person_id) : undefined,
    unit_transaction_item_counts: toNumber(raw?.unit_transaction_item_counts ?? raw?.unitTransactionItemCounts),
    unit_transaction_items: unitItems,
    transaction_bruto_total: toNumber(raw?.transaction_bruto_total ?? raw?.transactionBrutoTotal),
    transaction_dpp_total: toNumber(raw?.transaction_dpp_total ?? raw?.transactionDppTotal),
    transaction_ppn_total: toNumber(raw?.transaction_ppn_total ?? raw?.transactionPpnTotal),
    transaction_bbn_total: toNumber(raw?.transaction_bbn_total ?? raw?.transactionBbnTotal),
    transaction_other_fee: toNumber(raw?.transaction_other_fee ?? raw?.transactionOtherFee),
  };
};

const getLaporanPembelianDetail = async (id: number): Promise<PurchaseTransactionItem | null> => {
  const response = await apiClient.get(`/wapi/transaction/unit-transaction/unit-transaction/${id}`);
  const payload = response?.data?.data ?? response?.data;
  if (!payload) return null;

  const row = payload?.data ?? payload;
  return mapPurchaseItem(row as RawPurchaseTransactionItem);
};

export const getLaporanPembelian = async (
  params: PurchaseTransactionParams
): Promise<PurchaseTransactionResponse> => {
  const response = await apiClient.get('/wapi/transaction/unit-transaction/unit-transaction', {
    params: {
      type: 'purchase',
      is_paid: true,
      sort_order: 'desc',
      ...params,
    },
  });

  const payload = response?.data?.data ?? {};
  const rows = Array.isArray(payload?.data) ? payload.data : [];

  const mappedRows = rows.map((row: RawPurchaseTransactionItem) => mapPurchaseItem(row));

  const enrichedRows = await Promise.all(
    mappedRows.map(async (row: PurchaseTransactionItem) => {
      const hasUnitItems = (row.unit_transaction_items?.length ?? 0) > 0;
      const expectedItems = row.unit_transaction_item_counts ?? 0;

      if (hasUnitItems || expectedItems <= 0 || row.id <= 0) {
        return row;
      }

      try {
        const detail = await getLaporanPembelianDetail(row.id);
        if (!detail || (detail.unit_transaction_items?.length ?? 0) === 0) {
          return row;
        }

        return {
          ...row,
          person: row.person ?? detail.person,
          unit_transaction_items: detail.unit_transaction_items,
        };
      } catch {
        return row;
      }
    }),
  );

  return {
    ...payload,
    data: enrichedRows,
  } as PurchaseTransactionResponse;
};

export const getSuppliers = async () => {
  const response = await apiClient.get('/wapi/master-data/supplier', {
    params: { per_page: 1000 }
  });
  return response.data.data;
};

export const getUnitTypes = async () => {
  const response = await apiClient.get('/wapi/master-data/unit-type', {
    params: { sort_by: 'created_at', sort_order: 'asc' }
  });
  return response.data.data;
};