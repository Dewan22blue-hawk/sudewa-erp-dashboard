import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { PenerimaanItem } from '@/services/laporan-penerimaan.service';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      header: 'No Penerimaan',
      accessorKey: 'transaction_code',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.transaction_code} />,
    },
    {
      header: 'Tgl Terima',
      id: 'tgl_terima',
      sortable: true,
      alignment: 'center',
      cell: (item) => <span className="text-gray-600">{formatDate(item.receipt_date)}</span>,
    },
    {
      header: 'Nama Supplier',
      accessorKey: 'person',
      sortable: true,
      alignment: 'left',
      cell: (item) => <ReferenceLink href={`/dashboard/${slug}/master/supplier?search=${item?.person}`}>{item?.person}</ReferenceLink>,
    },
    {
      header: 'Tipe Unit',
      id: 'tipe_unit',
      sortable: true,
      alignment: 'left',
      cell: (item) => <ReferenceLink href={`/dashboard/${slug}/master/type-unit?search=${item?.unit_type?.name}`}>{item?.unit_type?.name}</ReferenceLink>,
    },
    {
      header: 'Warna',
      accessorKey: 'color',
      sortable: true,
      alignment: 'left',
      cell: (item) => <span className="text-gray-600">{item.color}</span>,
    },
    {
      header: 'Nomor Mesin',
      accessorKey: 'machine_number',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.machine_number} />,
    },
    {
      header: 'Nomor Rangka',
      accessorKey: 'chassis_number',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.chassis_number} />,
    },
    {
      header: 'Sub Blok',
      accessorKey: 'warehouse_sub_block',
      sortable: true,
      alignment: 'center',
      tooltip: 'Lokasi sub-blok penyimpanan unit di dalam gudang',
      cell: (item) => item.warehouse_sub_block?.name ? (
        <CopyBox text={item.warehouse_sub_block?.name} />
      ) : (
        <Badge variant='outline' className={`font-semibold bg-white`}>Belum Ditambahkan</Badge>
      ),
    },
  ], [slug]);

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
