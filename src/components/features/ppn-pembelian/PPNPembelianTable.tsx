import { useMemo } from 'react';
import type { PPNPembelian } from '@/@types/ppn-pembelian.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { formatDateUI } from '@/lib/utils/date';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';

interface Props {
  data: PPNPembelian[];
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
  onEdit: (item: PPNPembelian) => void;
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

export default function PPNPembelianTable({
  data,
  meta,
  sortBy,
  sortDirection,
  hasNextPage,
  isTotalExact,
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  onRetry,
  onEdit,
  onSortChange,
  onPageChange,
}: Props) {
  const router = useRouter();
  const { slug } = router.query;

  const columns = useMemo<ColumnDef<PPNPembelian>[]>(
    () => [
      {
        header: 'Tanggal Beli',
        accessorKey: 'buy_date',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatDate(item.buy_date),
      },
      {
        header: 'Kode Pembelian',
        accessorKey: 'code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item?.code ?? '-'} />
      },
      {
        header: 'Tipe Unit',
        accessorKey: 'unit_type.name',
        sortable: true,
        alignment: 'left',
        cell: (item) => (
          <div>
            <div className="font-medium text-slate-900">
              <ReferenceLink href={`/dashboard/${slug}/master/type-unit?search=${item?.unit_type?.name}`}>
                {item.unit_type.name}
              </ReferenceLink>
            </div>
            <div className="text-xs text-slate-500">{item.unit_type.code}</div>
          </div>
        ),
      },
      {
        header: 'Supplier',
        accessorKey: 'supplier',
        sortable: true,
        alignment: 'left',
        cell: (item) => (
          <ReferenceLink href={`/dashboard/${slug}/master/supplier?search=${item?.supplier}`}>
            {item?.supplier}
          </ReferenceLink>
        )
      },
      {
        header: 'Tanggal FPM',
        accessorKey: 'fp_date',
        sortable: true,
        alignment: 'center',
        cell: (item) => {
          const hasFp = Boolean(item.fp_date);
          return (
            <div className="space-y-1">
              <div>{formatDate(item.fp_date)}</div>
              {renderStatusBadge(hasFp, 'FP Terisi', 'Belum FP')}
            </div>
          );
        },
      },
      {
        header: 'Masa NSFPM',
        accessorKey: 'nsfp_age',
        sortable: true,
        alignment: 'center',
        cell: (item) => {
          const hasNsfpAge = Boolean(item.nsfp_age);
          return (
            <div className="space-y-1">
              <div>{formatDate(item.nsfp_age)}</div>
              {renderStatusBadge(hasNsfpAge, 'NSFPM Terisi', 'Belum NSFPM')}
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
              {hasNsfpNumber ? <CopyBox text={item.nsfp_number ?? '-'} /> : renderStatusBadge(false, 'Sudah Input', 'Belum Input')}
            </div>
          );
        },
      },
      {
        header: 'No Mesin',
        alignment: 'left',
        cell: (item) => (
          <CopyBox text={item.unit_transaction_item_detail?.machine_number ?? '-'} />
        ),
      },
      {
        header: 'No Rangka',
        alignment: 'left',
        cell: (item) => (
          <CopyBox text={item.unit_transaction_item_detail?.chassis_number ?? '-'} />
        ),
      },
      {
        header: 'Harga Unit',
        accessorKey: 'unit_price',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.unit_price),
      },
      {
        header: 'Total Harga',
        accessorKey: 'total_price',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.total_price),
      },
      {
        header: 'DPP',
        accessorKey: 'dpp_amount',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.dpp_amount),
      },
      {
        header: 'PPN 11%',
        accessorKey: 'ppn_11',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.ppn_11),
      },
      {
        header: 'Total Bayar',
        accessorKey: 'payment_amount',
        sortable: true,
        alignment: 'center',
        cell: (item) => currenciesFormat('idr', item.payment_amount),
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
            <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
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
          <p className="text-sm text-red-600 mb-2">{errorMessage ?? 'Gagal memuat data PPN pembelian'}</p>
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
