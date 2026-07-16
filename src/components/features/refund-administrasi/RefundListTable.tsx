import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Loader2, Search } from 'lucide-react';
import type { PaginationMeta } from '@/@types/pagination.types';
import type { UnitTransactionRefund } from '@/@types/refund.type';
import { RefundStatusBadge } from '@/components/features/refund/RefundStatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { getVisiblePageNumbers } from '@/lib/api/pagination';

interface RefundListTableProps {
  data: UnitTransactionRefund[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  slug: string;
  transactionId: string;
  basePath: string;
  page: number;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function RefundListTable({ data, meta, isLoading = false, slug, transactionId, basePath, page, onPageChange }: RefundListTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<UnitTransactionRefund>[]>(
    () => [
      {
        header: 'Tanggal Refund',
        accessorKey: 'refund_date',
        cell: ({ row }) => <span className="font-medium text-slate-900">{formatDate(row.original.refund_date)}</span>,
      },
      {
        header: 'Kode Refund',
        accessorKey: 'code',
        cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.code}</span>,
      },
      {
        header: 'Qty Unit',
        id: 'qty',
        cell: ({ row }) => <span>{row.original.total_qty ?? row.original.items?.length ?? 0}</span>,
      },
      {
        header: 'Nominal Refund',
        accessorKey: 'refund_amount',
        cell: ({ row }) => <span className="font-medium text-slate-900">{formatCurrency(row.original.refund_amount)}</span>,
      },
      {
        header: 'Total Dibayar',
        id: 'paid_amount',
        cell: ({ row }) => {
          const totalPaid = row.original.total_paid ?? (row.original.payments ?? []).reduce((total, item) => total + Number(item.amount), 0);
          return <span>{formatCurrency(totalPaid)}</span>;
        },
      },
      {
        header: 'Sisa Bayar',
        id: 'remaining_amount',
        cell: ({ row }) => {
          const remainingAmount = row.original.remaining_payment ?? Math.max(0, row.original.refund_amount - (row.original.total_paid ?? 0));
          return <span className="font-medium text-amber-700">{formatCurrency(remainingAmount)}</span>;
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <RefundStatusBadge status={row.original.status === 'approve' || row.original.status === 'reject' ? row.original.status : 'waiting'} />,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => router.push(`/dashboard/${slug}/${basePath}/${transactionId}/refund/${row.original.id}`)}
            >
              <Eye className="h-4 w-4" />
              Detail
            </Button>
          </div>
        ),
      },
    ],
    [basePath, router, slug, transactionId],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const total = meta?.total ?? data.length;
  const perPage = meta?.perPage ?? (data.length || 10);
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(page * perPage, total);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50 hover:bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div className={header.id === 'actions' ? 'text-right' : 'flex items-center gap-2'}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.id !== 'actions' ? <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" /> : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="group">
                <TableCell colSpan={columns.length} className="py-16 h-40 text-center text-slate-500">
    <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <span className="text-sm font-medium text-slate-500">Memuat data...</span>
    </div>
</TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="group">
                <TableCell colSpan={100} className="py-16 h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Menampilkan {start}-{end} dari {total} data
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Sebelumnya
          </Button>
          {getVisiblePageNumbers(meta?.lastPage ?? 1, page).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'outline' : 'ghost'}
              size="sm"
              className="w-9"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button variant="ghost" size="sm" disabled={meta ? page >= meta.lastPage : true} onClick={() => onPageChange(page + 1)}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
