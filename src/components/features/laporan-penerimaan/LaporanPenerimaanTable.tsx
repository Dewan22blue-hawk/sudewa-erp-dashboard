import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { PenerimaanItem } from '@/services/laporan-penerimaan.service';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';

interface Props {
  data: PenerimaanItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPenerimaanTable({
  data,
  pagination,
  isLoading,
  onPageChange,
}: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';

  const columns: ColumnDef<PenerimaanItem>[] = useMemo(() => [
    {
      header: 'NO PENERIMAAN',
      accessorKey: 'transaction_code',
      cell: (item) => <CopyBox text={item.transaction_code} />,
    },
    {
      header: 'TGL TERIMA',
      id: 'tgl_terima',
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatDate(item.receipt_date)}</span>,
    },
    {
      header: 'NAMA SUPPLIER',
      accessorKey: 'person',
      cell: (item) => <ReferenceLink href={`/dashboard/${slug}/master/supplier?search=${item?.person}`}>{item?.person}</ReferenceLink>,
    },
    {
      header: 'TIPE UNIT',
      id: 'tipe_unit',
      cell: (item) => <ReferenceLink href={`/dashboard/${slug}/master/unit-type?search=${item?.unit_type.name}`}>{item?.unit_type?.name}</ReferenceLink>,
    },
    {
      header: 'WARNA',
      accessorKey: 'color',
      cell: (item) => <span className="text-gray-600">{item.color}</span>,
    },
    {
      header: 'NO MESIN',
      accessorKey: 'machine_number',
      cell: (item) => <CopyBox text={item.machine_number} />,
    },
    {
      header: 'NO RANGKA',
      accessorKey: 'chassis_number',
      cell: (item) => <CopyBox text={item.chassis_number} />,
    },
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
