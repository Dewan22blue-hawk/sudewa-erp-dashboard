import type { ReactNode } from 'react';
import { StockStatus, StockUnit } from '@/@types/stock-unit.types';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { cn } from '@/lib/utils';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';

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

const statusLabel: Record<StockStatus, string> = {
  draft: 'draft',
  cancel: 'cancel',
  rejected: 'rejected',
  prepare: 'prepare',
  inbound_purcase_order: 'purchase order',
  inbound_incoming_goods: 'in transit',
  inbound_receipt: 'available',
  inbound_return: 'refund',
  outbound_reserved: 'reserved',
  outbound_in_transit: 'in transit',
  outbound_delivered: 'delivered',
  outbound_return: 'return',
};

const statusTextClasses: Record<StockStatus, string> = {
  draft: 'text-gray-500 font-medium',
  cancel: 'text-red-600 font-medium',
  rejected: 'text-red-600 font-medium',
  prepare: 'text-amber-600 font-medium',
  inbound_purcase_order: 'text-blue-600 font-medium',
  inbound_incoming_goods: 'text-blue-600 font-medium',
  inbound_receipt: 'text-emerald-600 font-medium',
  inbound_return: 'text-orange-600 font-medium',
  outbound_reserved: 'text-orange-600 font-medium',
  outbound_in_transit: 'text-indigo-600 font-medium',
  outbound_delivered: 'text-emerald-600 font-medium',
  outbound_return: 'text-rose-600 font-medium',
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
  const renderStatus = (status: StockStatus) => (
    <span className={cn('text-sm', statusTextClasses[status] ?? 'text-gray-600')}>
      {statusLabel[status] ?? status}
    </span>
  );

  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const columns: ColumnDef<StockUnit>[] = [
    {
      header: 'No',
      alignment: 'left',
      cell: (_item, index) => (page - 1) * perPage + index + 1,
    },
    {
      header: 'Nama Unit',
      accessorKey: 'namaUnit',
      sortable: true,
      alignment: 'left',
      cell: (item) =>
        <ReferenceLink href={`/dashboard/${slugStr}/master/type-unit?search=${item?.namaUnit}`}>
          {item.namaUnit}
        </ReferenceLink>,
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
      header: 'Status',
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
