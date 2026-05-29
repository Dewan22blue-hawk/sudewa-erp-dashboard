import { useMemo, useState } from 'react';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import type { FinanceRefundRecord, RefundTransactionType } from '@/@types/finance-refund.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import FinanceRefundApprovalModal from '@/components/features/finance-refund/FinanceRefundApprovalModal';
import { RefundStatusBadge } from '@/components/features/refund/RefundStatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { getVisiblePageNumbers } from '@/lib/api/pagination';

interface FinanceRefundTableProps {
  data: FinanceRefundRecord[];
  meta?: PaginationMeta & { from?: number; to?: number };
  page: number;
  isLoading?: boolean;
  transactionType: RefundTransactionType;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function FinanceRefundTable({ data, meta, page, isLoading = false, transactionType, onPageChange }: FinanceRefundTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'refundDate', desc: true }]);
  const [selectedRefund, setSelectedRefund] = useState<FinanceRefundRecord | null>(null);

  const columns = useMemo<ColumnDef<FinanceRefundRecord>[]>(
    () => {
      const baseColumns: ColumnDef<FinanceRefundRecord>[] = [
        {
          accessorKey: 'refundCode',
          header: 'KODE REFUND',
          cell: ({ row }) => <span className="text-slate-800 font-normal">{row.original.refundCode}</span>,
        },
        {
          accessorKey: 'transactionCode',
          header: transactionType === 'sales' ? 'NO PENJUALAN' : 'NO PEMBELIAN',
          cell: ({ row }) => <span className="text-slate-800 font-normal">{row.original.transactionCode}</span>,
        },
        {
          accessorKey: 'refundDate',
          header: 'TANGGAL',
          cell: ({ row }) => <span className="text-slate-800 font-normal">{formatDate(row.original.refundDate)}</span>,
        },
        {
          accessorKey: 'partnerName',
          header: transactionType === 'sales' ? 'NAMA CUSTOMER' : 'NAMA SUPPLIER',
          cell: ({ row }) => <span className="text-slate-800 font-normal">{row.original.partnerName}</span>,
        },
        {
          accessorKey: 'totalTransaction',
          header: transactionType === 'sales' ? 'TOTAL PENJUALAN' : 'TOTAL PEMBELIAN',
          cell: ({ row }) => (
            <span className="text-slate-800 font-normal">
              {formatCurrency(row.original.totalTransaction ?? 0)}
            </span>
          ),
        },
        {
          accessorKey: 'refundAmount',
          header: 'TOTAL REFUND',
          cell: ({ row }) => <span className="text-slate-800 font-normal">{formatCurrency(row.original.refundAmount)}</span>,
        },
        {
          accessorKey: 'cashName',
          header: transactionType === 'sales' ? 'KAS KELUAR' : 'KAS MASUK',
          cell: ({ row }) => <span className="text-slate-800 font-normal">{row.original.cashName || '-'}</span>,
        },
        {
          accessorKey: 'note',
          header: 'KETERANGAN',
          cell: ({ row }) => <span className="text-slate-500 font-normal text-xs line-clamp-2 max-w-xs">{row.original.note || '-'}</span>,
        },
      ];

      if (transactionType === 'purchase') {
        baseColumns.push(
          {
            accessorKey: 'status',
            header: 'STATUS',
            cell: ({ row }) => <RefundStatusBadge status={row.original.status} />,
          },
          {
            id: 'actions',
            header: 'ACTION',
            cell: ({ row }) => (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold px-3 font-sans border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRefund(row.original);
                }}
              >
                Approval
              </Button>
            ),
          }
        );
      }

      return baseColumns;
    },
    [transactionType],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const total = meta?.total ?? data.length;
  const perPage = meta?.perPage ?? (data.length || 10);
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(page * perPage, total);

  return (
    <>
      <div className="space-y-4">
        <div className="text-sm overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-200">
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <TableHead key={header.id} className="py-3 px-4 text-sm font-semibold uppercase tracking-wider text-gray-900 bg-gray-50/50">
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="flex items-center gap-1.5 font-semibold text-gray-900 cursor-pointer disabled:cursor-default"
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!isSortable}
                          >
                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            {isSortable ? (
                              isSorted === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                              ) : isSorted === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-50 text-slate-400" />
                              )
                            ) : null}
                          </button>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center text-slate-500">
                    Memuat data refund finance...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50/80 cursor-pointer transition-all duration-150 active:bg-slate-100"
                    onClick={() => setSelectedRefund(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center text-slate-500">
                    Tidak ada data refund finance.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between py-2">
          <div>
            Showing {start}-{end} of {total} data
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="font-semibold text-slate-600">
              Previous
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
            <Button variant="ghost" size="sm" disabled={meta ? page >= meta.lastPage : true} onClick={() => onPageChange(page + 1)} className="font-semibold text-slate-600">
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedRefund ? (
        <FinanceRefundApprovalModal
          open={Boolean(selectedRefund)}
          onClose={() => setSelectedRefund(null)}
          refund={selectedRefund}
          transactionType={transactionType}
        />
      ) : null}
    </>
  );
}
