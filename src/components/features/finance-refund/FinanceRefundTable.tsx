import { useMemo, useState } from 'react';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, CheckCircle2 } from 'lucide-react';
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
    () => [
      {
        accessorKey: 'transactionCode',
        header: 'Transaksi',
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium text-slate-900">{row.original.transactionCode}</p>
            <p className="text-xs text-slate-500">{row.original.partnerName}</p>
          </div>
        ),
      },
      {
        accessorKey: 'refundCode',
        header: 'Kode Refund',
        cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.refundCode}</span>,
      },
      {
        accessorKey: 'refundDate',
        header: 'Tanggal',
        cell: ({ row }) => <span>{formatDate(row.original.refundDate)}</span>,
      },
      {
        accessorKey: 'refundAmount',
        header: 'Nominal Refund',
        cell: ({ row }) => <span className="font-medium text-slate-900">{formatCurrency(row.original.refundAmount)}</span>,
      },
      {
        id: 'paidAmount',
        header: 'Histori Bayar',
        accessorFn: (row) => row.payments.reduce((total, payment) => total + Number(payment.amount), 0),
        cell: ({ row }) => {
          const paidAmount = row.original.payments.reduce((total, payment) => total + Number(payment.amount), 0);
          return <span>{formatCurrency(paidAmount)}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <RefundStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button size="sm" className="gap-2" onClick={() => setSelectedRefund(row.original)}>
              <CheckCircle2 className="h-4 w-4" />
              Approval
            </Button>
          </div>
        ),
      },
    ],
    [],
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-slate-50 hover:bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={`flex items-center gap-2 ${header.id === 'actions' ? 'ml-auto' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={header.id === 'actions'}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.id !== 'actions' ? <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" /> : null}
                        </button>
                      )}
                    </TableHead>
                  ))}
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
                  <TableRow key={row.id} className="hover:bg-slate-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
