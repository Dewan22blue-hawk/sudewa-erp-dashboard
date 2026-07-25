import { useMemo } from 'react';
import type { PPNPenjualan } from '@/@types/ppn-penjualan.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { formatDateUI } from '@/lib/utils/date';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { CopyBox } from '@/components/ui/copy-box';

interface Props {
  data: PPNPenjualan[];
  meta: PaginationMeta;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  hasNextPage: boolean;
  isTotalExact: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onEdit: (item: PPNPenjualan) => void;
  onSortChange: (sortBy: string) => void;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDateUI(parsed);
};

const renderStatusBadge = (hasValue: boolean, readyLabel: string, emptyLabel: string) => (
  <Badge className={hasValue ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none' : 'bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none'}>
    {hasValue ? readyLabel : emptyLabel}
  </Badge>
);

export default function PPNPenjualanTable({
  data,
  meta,
  sortBy,
  sortDirection,
  hasNextPage,
  isTotalExact,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onRetry,
  onEdit,
  onSortChange,
  onPageChange,
}: Props) {

  const columns = useMemo<ColumnDef<PPNPenjualan>[]>(
    () => [
      {
        header: 'Kode Invoice',
        accessorKey: 'code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <span className="font-medium text-blue-600 whitespace-nowrap">{item.code}</span>
      },
      {
        header: 'Tanggal Jual',
        accessorKey: 'sales_date',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="text-slate-500 whitespace-nowrap">{formatDate(item.sales_date)}</span>,
      },
      {
        header: 'Customer',
        accessorKey: 'customer',
        sortable: true,
        alignment: 'left',
        cell: (item) => <span className="text-slate-700">{item.customer}</span>
      },
      {
        header: 'Tanggal FPM',
        accessorKey: 'fpm_date',
        sortable: true,
        alignment: 'center',
        cell: (item) => {
          const hasFpm = Boolean(item.fpm_date);
          return (
            <div className="space-y-1">
              <div>{formatDate(item.fpm_date)}</div>
              {renderStatusBadge(hasFpm, 'FPM Terisi', 'Belum FPM')}
            </div>
          );
        },
      },
      {
        header: 'MASA NSFPM',
        accessorKey: 'nsfpm_age',
        sortable: true,
        alignment: 'center',
        cell: (item) => {
          const hasNsfpmAge = Boolean(item.nsfpm_age);
          return (
            <div className="space-y-1">
              <div>{formatDate(item.nsfpm_age)}</div>
              {renderStatusBadge(hasNsfpmAge, 'NSFPM Terisi', 'Belum NSFPM')}
            </div>
          );
        },
      },
      {
        header: 'Nomor NSFP',
        alignment: 'center',
        cell: (item) => {
          const hasNsfpNumber = Boolean(item.nsfp_number && item.nsfp_number.trim() !== '');
          return (
            <div className="space-y-1 flex flex-col items-center">
              <div>{item.nsfp_number || '-'}</div>
              {renderStatusBadge(hasNsfpNumber, 'Sudah Input', 'Belum Input')}
            </div>
          );
        },
      },
      {
        header: 'QTY',
        accessorKey: 'qty',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="text-slate-700">{item.qty}</span>,
      },
      {
        header: 'Tipe Unit',
        accessorKey: 'unit_type.name',
        sortable: true,
        alignment: 'left',
        cell: (item) => (
          <div>
            <div className="font-medium text-slate-900">{item.unit_type.name}</div>
            <div className="text-xs text-slate-500">{item.unit_type.code}</div>
          </div>
        ),
      },
      {
        header: 'No Mesin',
        alignment: 'left',
        cell: (item) => (
          <span className="text-slate-700">{item.unit_transaction_item_detail?.machine_number ?? '-'}</span>
        ),
      },
      {
        header: 'No Rangka',
        alignment: 'left',
        cell: (item) => (
          <span className="text-slate-700">{item.unit_transaction_item_detail?.chassis_number ?? '-'}</span>
        ),
      },
      {
        header: 'Harga Unit',
        accessorKey: 'unit_price',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="font-medium text-slate-900">{currenciesFormat('idr', item.unit_price)}</span>,
      },
      {
        header: 'DPP',
        accessorKey: 'dpp_amount',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="font-medium text-slate-900">{currenciesFormat('idr', item.dpp_amount)}</span>,
      },
      {
        header: 'PPN 11%',
        accessorKey: 'ppn_11',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="font-medium text-slate-900">{currenciesFormat('idr', item.ppn_11)}</span>,
      },
      {
        header: 'Total Bayar',
        accessorKey: 'payment_amount',
        sortable: true,
        alignment: 'center',
        cell: (item) => <span className="font-medium text-slate-900">{currenciesFormat('idr', item.payment_amount)}</span>,
      },
      {
        header: 'Action',
        alignment: 'center',
        sticky: 'right',
        cell: (item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[100px] rounded-md p-2">
              <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer rounded-md px-3 py-2.5">
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <div className="space-y-4">
      {isFetching && !isLoading && (
        <div className="rounded-md border border-blue-200 bg-blue-50/50 px-4 py-2 text-xs text-blue-700">
          Memperbarui data...
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600 mb-2">{errorMessage ?? 'Gagal memuat data PPN penjualan'}</p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      )}

      <BaseTable
        data={data}
        columns={columns}
        loading={isLoading}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(key) => onSortChange(key)}
        meta={{
          currentPage: meta.currentPage,
          perPage: meta.perPage,
          lastPage: isTotalExact ? meta.lastPage : (hasNextPage ? meta.currentPage + 1 : meta.currentPage),
          total: isTotalExact ? meta.total : (hasNextPage ? (meta.currentPage * meta.perPage) + 1 : meta.currentPage * meta.perPage),
        }}
        onPageChange={onPageChange}
      />
    </div>
  );
}
