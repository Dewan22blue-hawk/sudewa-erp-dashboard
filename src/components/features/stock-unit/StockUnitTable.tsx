import type { ReactNode } from 'react';
import { StockStatus, StockUnit } from '@/@types/stock-unit.types';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { cn } from '@/lib/utils';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';
import { Badge } from '@/components/ui/badge';

interface Props {
  data: StockUnit[];
  isLoading: boolean;
  page: number;
  perPage: number;
  totalData: number;
  statusTabs?: ReactNode;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Backend enum statuses
  normal: { label: 'Normal', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold' },
  minor_damage: { label: 'Minor Damage', className: 'border-amber-200 bg-amber-50 text-amber-700 font-semibold' },
  major_damage: { label: 'Major Damage', className: 'border-red-200 bg-red-50 text-red-700 font-semibold' },
  returned: { label: 'Returned', className: 'border-purple-200 bg-purple-50 text-purple-700 font-semibold' },
  refunded: { label: 'Refunded', className: 'border-orange-200 bg-orange-50 text-orange-700 font-semibold' },
  lost: { label: 'Lost', className: 'border-rose-200 bg-rose-50 text-rose-700 font-semibold' },
  in_repair: { label: 'In Repair', className: 'border-blue-200 bg-blue-50 text-blue-700 font-semibold' },

  // Fallback / legacy statuses
  draft: { label: 'Draft', className: 'border-slate-200 bg-slate-50 text-slate-600 font-medium' },
  cancel: { label: 'Cancel', className: 'border-red-200 bg-red-50 text-red-700 font-medium' },
  rejected: { label: 'Rejected', className: 'border-red-200 bg-red-50 text-red-700 font-medium' },
  prepare: { label: 'Prepare', className: 'border-amber-200 bg-amber-50 text-amber-700 font-medium' },
  inbound_purcase_order: { label: 'Purchase Order', className: 'border-blue-200 bg-blue-50 text-blue-700 font-medium' },
  inbound_incoming_goods: { label: 'In Transit', className: 'border-blue-200 bg-blue-50 text-blue-700 font-medium' },
  inbound_receipt: { label: 'Available', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold' },
  inbound_return: { label: 'Refund', className: 'border-orange-200 bg-orange-50 text-orange-700 font-medium' },
  outbound_reserved: { label: 'Reserved', className: 'border-orange-200 bg-orange-50 text-orange-700 font-medium' },
  outbound_in_transit: { label: 'In Transit', className: 'border-indigo-200 bg-indigo-50 text-indigo-700 font-medium' },
  outbound_delivered: { label: 'Delivered', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium' },
  outbound_return: { label: 'Return', className: 'border-rose-200 bg-rose-50 text-rose-700 font-medium' },
};

const renderStatus = (status: string) => {
  const config = statusConfig[status] ?? {
    label: status ? status.replace(/_/g, ' ') : '-',
    className: 'border-slate-200 bg-slate-50 text-slate-700 font-medium',
  };

  return (
    <Badge variant="outline" className={cn('capitalize', config.className)}>
      {config.label}
    </Badge>
  );
};

export default function StockUnitTable({
  data,
  isLoading,
  page,
  perPage,
  totalData,
  statusTabs,
  onPageChange,
  onPerPageChange,
  search,
  onSearchChange,
}: Props) {
  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const columns: ColumnDef<StockUnit>[] = [
    {
      header: 'Nama Unit',
      accessorKey: 'namaUnit',
      sortable: true,
      alignment: 'left',
      cell: (item) => (
        <ReferenceLink href={`/dashboard/${slugStr}/master/type-unit?search=${item?.namaUnit}`}>
          {item.namaUnit}
        </ReferenceLink>
      ),
    },
    {
      header: 'Warna',
      accessorKey: 'warna',
      sortable: true,
      alignment: 'left',
    },
    {
      header: 'Nomor Mesin',
      accessorKey: 'noMesin',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.noMesin} />,
    },
    {
      header: 'Nomor Rangka',
      accessorKey: 'noRangka',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.noRangka} />,
    },
    {
      header: 'Status Stok',
      accessorKey: 'status',
      sortable: true,
      alignment: 'center',
      cell: (item) => item?.inStock ? <Badge variant="outline" className={cn('capitalize', 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold')}>Tersedia</Badge> : <Badge variant="outline" className={cn('capitalize', 'border-rose-200 bg-rose-50 text-rose-700 font-semibold')}>Tidak Tersedia</Badge>
    },
    {
      header: 'Kondisi Stok',
      accessorKey: 'status',
      sortable: true,
      alignment: 'center',
      cell: (item) => renderStatus(item.status),
    },
  ];

  const meta = {
    currentPage: page,
    perPage,
    lastPage: Math.max(1, Math.ceil(totalData / perPage)),
    total: totalData,
  };

  console.log(data);

  return (
    <BaseTable
      data={data}
      columns={columns}
      loading={isLoading}
      searchPlaceholder="Search here"
      search={search}
      onSearchChange={onSearchChange}
      showLimitChange
      perPage={perPage}
      onPerPageChange={onPerPageChange}
      meta={meta}
      onPageChange={onPageChange}
      headerActions={statusTabs}
    />
  );
}
