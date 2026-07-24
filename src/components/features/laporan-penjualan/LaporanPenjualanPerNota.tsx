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

export default function LaporanPenjualanPerNota({ data, pagination, isLoading, onPageChange }: Props) {
  // Flatten data: setiap item bisa memiliki multiple unit_transaction_items
  const flattenedData = useMemo(() => data.flatMap((item) =>
    (item.unit_transaction_items || []).map((unit, idx) => ({
      id: `${item.id}-${idx}`,
      noPenjualan: item.code,
      tanggal: item.created_at,
      tipeUnit: unit.unit_type.name,
      qty: unit.qty_total,
      hargaJual: unit.price,
      biayaBbn: unit.bbn_price,
      biayaEkspedisi: unit.expedition_fee,
      biayaLainnya: unit.other_fee,
      hpp: unit.hpp_total_price,
      dpp: unit.dpp_total_price,
      ppn: unit.ppn_total_price,
      jumlah: item.transaction_bruto_total,
    }))
  ), [data]);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      header: 'NO',
      id: 'no',
      alignment: 'center',
      cell: (_, idx) => <span className="font-medium text-slate-500">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</span>,
    },
    {
      header: 'NO PENJUALAN',
      accessorKey: 'noPenjualan',
      cell: (item) => <span className="font-medium text-slate-900 whitespace-nowrap">{item.noPenjualan}</span>,
    },
    {
      header: 'TGL JUAL',
      id: 'tgl_jual',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatDate(item.tanggal)}</span>,
    },
    {
      header: 'TIPE UNIT',
      accessorKey: 'tipeUnit',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{item.tipeUnit}</span>,
    },
    {
      header: 'QTY',
      accessorKey: 'qty',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{item.qty}</span>,
    },
    {
      header: 'HARGA JUAL',
      id: 'harga_jual',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.hargaJual)}</span>,
    },
    {
      header: 'BIAYA BBN',
      id: 'biaya_bbn',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.biayaBbn)}</span>,
    },
    {
      header: 'BIAYA EKSPEDISI',
      id: 'biaya_ekspedisi',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.biayaEkspedisi)}</span>,
    },
    {
      header: 'BIAYA LAINNYA',
      id: 'biaya_lainnya',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.biayaLainnya)}</span>,
    },
    {
      header: 'HPP',
      id: 'hpp',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.hpp)}</span>,
    },
    {
      header: 'DPP',
      id: 'dpp',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.dpp)}</span>,
    },
    {
      header: 'PPN',
      id: 'ppn',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.ppn)}</span>,
    },
    {
      header: 'JUMLAH',
      id: 'jumlah',
      alignment: 'center',
      cell: (item) => <span className="font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(item.jumlah)}</span>,
    }
  ], [pagination.currentPage, pagination.perPage]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-200 bg-white overflow-x-auto shadow-none w-full">
        <BaseTable
          data={flattenedData}
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
