import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { PengirimanItem } from '@/services/laporan-pengiriman.service';

interface Props {
  data: PengirimanItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPengirimanTable({
  data,
  pagination,
  isLoading,
  onPageChange,
}: Props) {
  const columns: ColumnDef<PengirimanItem>[] = useMemo(() => [
    {
      header: 'NO',
      id: 'no',
      alignment: 'center',
      cell: (_, idx) => <span className="font-medium text-slate-500">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</span>,
    },
    {
      header: 'NO PENGIRIMAN',
      accessorKey: 'transaction_code',
      cell: (item) => <span className="font-medium text-slate-900">{item.transaction_code}</span>,
    },
    {
      header: 'TGL KIRIM',
      id: 'tgl_kirim',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatDate(item.receipt_date)}</span>,
    },
    {
      header: 'NAMA CUSTOMER',
      accessorKey: 'person',
      cell: (item) => <span className="text-gray-600">{item.person}</span>,
    },
    {
      header: 'TIPE UNIT',
      id: 'tipe_unit',
      cell: (item) => <span className="text-gray-600">{item.unit_type.name}</span>,
    },
    {
      header: 'WARNA',
      accessorKey: 'color',
      cell: (item) => <span className="text-gray-600">{item.color}</span>,
    },
    {
      header: 'NO MESIN',
      accessorKey: 'machine_number',
      cell: (item) => <span className="text-gray-600">{item.machine_number}</span>,
    },
    {
      header: 'NO RANGKA',
      accessorKey: 'chassis_number',
      cell: (item) => <span className="text-gray-600">{item.chassis_number}</span>,
    },
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
