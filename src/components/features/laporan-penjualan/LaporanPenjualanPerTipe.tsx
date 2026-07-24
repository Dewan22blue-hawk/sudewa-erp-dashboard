import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { SalesTransactionItem } from '@/services/laporan-penjualan.service';

interface Props {
  data: SalesTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPenjualanPerTipe({ data, pagination, isLoading, onPageChange }: Props) {
  const columns: ColumnDef<SalesTransactionItem>[] = useMemo(() => [
    {
      header: 'NO',
      id: 'no',
      alignment: 'center',
      cell: (_, idx) => <span className="font-medium text-slate-500">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</span>,
    },
    {
      header: 'NO PENJUALAN',
      accessorKey: 'code',
      cell: (item) => <span className="font-medium text-slate-900 whitespace-nowrap">{item.code}</span>,
    },
    {
      header: 'TGL JUAL',
      id: 'tgl_jual',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatDate(item.created_at)}</span>,
    },
    {
      header: 'TIPE UNIT',
      id: 'tipe_unit',
      cell: (item) => {
        const items = item.unit_transaction_items || [];
        const unitTypes = Array.from(new Set(items.map(u => u.unit_type?.name).filter(Boolean))).join(', ');
        return (
          <span className="text-gray-600 whitespace-nowrap inline-block max-w-[200px] truncate" title={unitTypes || '-'}>
            {unitTypes || '-'}
          </span>
        );
      },
    },
    {
      header: 'QTY',
      id: 'qty',
      alignment: 'center',
      cell: (item) => {
        const items = item.unit_transaction_items || [];
        const qty = items.reduce((acc, curr) => acc + curr.qty_total, 0);
        return <span className="text-gray-600">{qty}</span>;
      },
    },
    {
      header: 'HARGA',
      id: 'harga',
      alignment: 'center',
      cell: (item) => {
        const items = item.unit_transaction_items || [];
        const harga = items.reduce((acc, curr) => acc + (curr.price * curr.qty_total), 0);
        return <span className="text-gray-600 whitespace-nowrap">{formatCurrency(harga)}</span>;
      },
    },
    {
      header: 'BIAYA BBN',
      id: 'biaya_bbn',
      alignment: 'center',
      cell: (item) => {
        const items = item.unit_transaction_items || [];
        const biayaBbn = items.reduce((acc, curr) => acc + (curr.bbn_price * curr.qty_total), 0);
        return <span className="text-gray-600 whitespace-nowrap">{formatCurrency(biayaBbn)}</span>;
      },
    },
    {
      header: 'BIAYA EKSPEDISI',
      id: 'biaya_ekspedisi',
      alignment: 'center',
      cell: (item) => {
        const items = item.unit_transaction_items || [];
        const biayaEkspedisi = items.reduce((acc, curr) => acc + curr.expedition_fee, 0);
        return <span className="text-gray-600 whitespace-nowrap">{formatCurrency(biayaEkspedisi)}</span>;
      },
    },
    {
      header: 'BIAYA LAIN',
      id: 'biaya_lain',
      alignment: 'center',
      cell: (item) => {
        const items = item.unit_transaction_items || [];
        const biayaLain = items.reduce((acc, curr) => acc + curr.other_fee, 0);
        return <span className="text-gray-600 whitespace-nowrap">{formatCurrency(biayaLain)}</span>;
      },
    },
    {
      header: 'TOTAL JUAL',
      id: 'total_jual',
      alignment: 'center',
      cell: (item) => <span className="font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(item.transaction_bruto_total)}</span>,
    }
  ], [pagination.currentPage, pagination.perPage]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-200 bg-white overflow-x-auto shadow-none w-full">
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
      </div>
    </div>
  );
}
