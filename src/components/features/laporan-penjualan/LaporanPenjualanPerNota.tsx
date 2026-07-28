import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'next/router';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { SalesTransactionItem } from '@/services/laporan-penjualan.service';

interface Props {
  data: SalesTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatCurrency = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPenjualanPerNota({ data, pagination, isLoading, onPageChange }: Props) {
  const router = useRouter();
  const slug = router.query.slug as string;

  const columns: ColumnDef<SalesTransactionItem>[] = useMemo(() => [
    {
      header: 'NO',
      id: 'no',
      alignment: 'center',
      cell: (_, idx) => <span className="font-medium text-slate-500">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</span>,
    },
    {
      header: 'NO PENJUALAN',
      accessorKey: 'transaction_code',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.transaction_code} />,
    },
    {
      header: 'TGL JUAL',
      accessorKey: 'transaction_date',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatDate(item.transaction_date)}</span>,
    },
    {
      header: 'TIPE UNIT',
      accessorKey: 'unit_name',
      sortable: true,
      alignment: 'left',
      cell: (item) => (
        <ReferenceLink href={`/dashboard/${slug}/master/type-unit?search=${encodeURIComponent(item.unit_name || '')}`}>
          {item.unit_name || '-'}
        </ReferenceLink>
      ),
    },
    {
      header: 'QTY',
      accessorKey: 'qty',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{item.qty || 0}</span>,
    },
    {
      header: 'HARGA JUAL',
      accessorKey: 'price',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.price)}</span>,
    },
    {
      header: 'BIAYA BBN',
      accessorKey: 'bbn',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.bbn)}</span>,
    },
    {
      header: 'BIAYA EKSPEDISI',
      accessorKey: 'expedition_fee',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.expedition_fee)}</span>,
    },
    {
      header: 'BIAYA LAINNYA',
      accessorKey: 'other_fee',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.other_fee)}</span>,
    },
    {
      header: 'HPP',
      accessorKey: 'hpp_fee',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.hpp_fee)}</span>,
    },
    {
      header: 'DPP',
      accessorKey: 'dpp',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.dpp)}</span>,
    },
    {
      header: 'PPN',
      accessorKey: 'ppn',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatCurrency(item.ppn)}</span>,
    },
    {
      header: 'JUMLAH',
      accessorKey: 'total',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>,
    }
  ], [pagination.currentPage, pagination.perPage, slug]);

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
