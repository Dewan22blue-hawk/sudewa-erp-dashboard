import { useMemo } from 'react';
import { PurchaseTransactionItem } from '@/services/laporan-pembelian.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';

interface Props {
  data: PurchaseTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPembelianPerTipe({ data, pagination, isLoading, onPageChange }: Props) {
  const columns = useMemo<ColumnDef<PurchaseTransactionItem>[]>(
    () => [
      {
        header: 'NO',
        alignment: 'center',
        cell: (_, idx) => idx + 1 + (pagination.currentPage - 1) * pagination.perPage,
      },
      {
        header: 'NO PEMBELIAN',
        accessorKey: 'code',
        sortable: true,
        alignment: 'left',
      },
      {
        header: 'TGL BELI',
        accessorKey: 'created_at',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatDate(item.created_at),
      },
      {
        header: 'TIPE UNIT',
        alignment: 'left',
        cell: (item) => {
          const items = item.unit_transaction_items || [];
          const unitTypes = Array.from(new Set(items.map(u => u.unit_type?.name).filter(Boolean))).join(', ');
          return (
            <span className="max-w-[200px] truncate block" title={unitTypes || '-'}>
              {unitTypes || '-'}
            </span>
          );
        },
      },
      {
        header: 'QTY',
        alignment: 'center',
        cell: (item) => {
          const items = item.unit_transaction_items || [];
          return items.reduce((acc, curr) => acc + curr.qty_total, 0);
        },
      },
      {
        header: 'HARGA',
        alignment: 'center',
        cell: (item) => {
          const items = item.unit_transaction_items || [];
          const harga = items.reduce((acc, curr) => acc + (curr.price * curr.qty_total), 0);
          return formatCurrency(harga);
        },
      },
      {
        header: 'BIAYA BBN',
        alignment: 'center',
        cell: (item) => {
          const items = item.unit_transaction_items || [];
          const biayaBbn = items.reduce((acc, curr) => acc + (curr.bbn_price * curr.qty_total), 0);
          return formatCurrency(biayaBbn);
        },
      },
      {
        header: 'BIAYA EKSPEDISI',
        alignment: 'center',
        cell: (item) => {
          const items = item.unit_transaction_items || [];
          const biayaEkspedisi = items.reduce((acc, curr) => acc + curr.expedition_fee, 0);
          return formatCurrency(biayaEkspedisi);
        },
      },
      {
        header: 'BIAYA LAIN',
        alignment: 'center',
        cell: (item) => {
          const items = item.unit_transaction_items || [];
          const biayaLain = items.reduce((acc, curr) => acc + curr.other_fee, 0);
          return formatCurrency(biayaLain);
        },
      },
      {
        header: 'TOTAL BELI',
        accessorKey: 'transaction_bruto_total',
        sortable: true,
        alignment: 'center',
        cell: (item) => (
          <span className="font-semibold text-slate-900">
            {formatCurrency(item.transaction_bruto_total)}
          </span>
        ),
      },
    ],
    [pagination.currentPage, pagination.perPage]
  );

  return (
    <BaseTable
      data={data}
      columns={columns}
      loading={isLoading}
      meta={{
        currentPage: pagination.currentPage,
        perPage: pagination.perPage,
        lastPage: pagination.lastPage,
        total: pagination.total,
      }}
      onPageChange={onPageChange}
    />
  );
}
