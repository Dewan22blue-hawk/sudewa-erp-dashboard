"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useGetWarehouseOutstanding } from '@/hooks/useLaporanWarehouse';
import { cn } from '@/lib/utils';

type OutstandingTableProps = {
  type: 'purchase' | 'sales';
  perPage: number;
  dateRange?: { from?: Date; to?: Date };
  onActionsChange?: (actions: { print: () => void; download: () => void }) => void;
};

const formatNumber = (value: number): string => value.toLocaleString('id-ID');

const formatDateLabel = (value: string): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, 'dd MMMM yyyy', { locale: id });
};

const toCsvLine = (cells: Array<string | number>): string =>
  cells
    .map((cell) => {
      const safe = String(cell).replace(/"/g, '""');
      return `"${safe}"`;
    })
    .join(',');

const ROWS_PER_PAGE = 50;

export default function OutstandingTable({ type, perPage, onActionsChange }: OutstandingTableProps) {
  const [page, setPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);

  // In Next.js, we don't have start_date/end_date explicitly mapped to API if the backend expects different params. 
  // For now, I'll keep the date logic here in case backend adds it, but the new endpoint only has page/per_page/order_by/etc.
  const { data: response, isLoading, isError } = useGetWarehouseOutstanding({
    warehouse_id: 1,
    type,
    page,
    per_page: perPage,
  });

  const rows = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response || {
    current_page: 1,
    data: [],
    last_page: 1,
    per_page: ROWS_PER_PAGE,
    total: 0,
    from: 0,
    to: 0,
  };

  useEffect(() => {
    if (!isLoading) {
      setTablePage(1);
    }
  }, [isLoading]);

  // Local table pagination (50 rows per page display)
  const lastTablePage = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const safeTablePage = Math.min(tablePage, lastTablePage);
  const pagedRows = useMemo(() => {
    const start = (safeTablePage - 1) * ROWS_PER_PAGE;
    return rows.slice(start, start + ROWS_PER_PAGE);
  }, [rows, safeTablePage]);

  const showingFrom = rows.length === 0 ? 0 : (safeTablePage - 1) * ROWS_PER_PAGE + 1;
  const showingTo = Math.min(safeTablePage * ROWS_PER_PAGE, rows.length);

  const summary = useMemo(
    () =>
      rows.reduce(
        (accumulator, item) => {
          accumulator.order += item.order_qty;
          if (type === 'purchase') {
            accumulator.processed += item.received_qty ?? 0;
          } else {
            accumulator.processed += item.delivered_qty ?? 0;
          }
          accumulator.remaining += item.remaining_qty;
          return accumulator;
        },
        { order: 0, processed: 0, remaining: 0 },
      ),
    [rows, type],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (rows.length === 0) {
      toast.error('Tidak ada data untuk diunduh');
      return;
    }

    const header = [
      'NO',
      type === 'purchase' ? 'KODE PEMBELIAN' : 'KODE PENJUALAN',
      type === 'purchase' ? 'TGL PEMBELIAN' : 'TGL JUAL',
      type === 'purchase' ? 'SUPPLIER' : 'CUSTOMER',
      'TIPE UNIT',
      type === 'purchase' ? 'QTY BELI' : 'QTY JUAL',
      type === 'purchase' ? 'QTY TERIMA' : 'QTY KIRIM',
      'KURANG',
    ];
    const lines = [toCsvLine(header)];

    rows.forEach((item, index) => {
      lines.push(
        toCsvLine([
          index + 1,
          item.code,
          formatDateLabel(item.date),
          (type === 'purchase' ? item.supplier_name : item.customer_name) || '-',
          item.unit_type || '-',
          item.order_qty,
          type === 'purchase' ? (item.received_qty ?? 0) : (item.delivered_qty ?? 0),
          item.remaining_qty,
        ]),
      );
    });

    lines.push(toCsvLine(['', '', '', '', 'GRAND TOTAL', summary.order, summary.processed, summary.remaining]));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `warehouse-${type === 'purchase' ? 'po' : 'so'}-outstanding-page-${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success(`Data ${type === 'purchase' ? 'purchase' : 'sales'} order berhasil diunduh`);
  }, [page, rows, summary, type]);

  useEffect(() => {
    onActionsChange?.({ print: handlePrint, download: handleDownload });
  }, [handleDownload, handlePrint, onActionsChange]);

  // Generate pagination items
  const pages: (number | string)[] = [];
  if (lastTablePage <= 5) {
    for (let i = 1; i <= lastTablePage; i++) pages.push(i);
  } else {
    if (safeTablePage <= 3) {
      pages.push(1, 2, 3, 4, '...', lastTablePage);
    } else if (safeTablePage >= lastTablePage - 2) {
      pages.push(1, '...', lastTablePage - 3, lastTablePage - 2, lastTablePage - 1, lastTablePage);
    } else {
      pages.push(1, '...', safeTablePage - 1, safeTablePage, safeTablePage + 1, '...', lastTablePage);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">NO</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">{type === 'purchase' ? 'KODE PEMBELIAN' : 'KODE PENJUALAN'}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center whitespace-nowrap">{type === 'purchase' ? 'TGL PEMBELIAN' : 'TGL JUAL'}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">{type === 'purchase' ? 'SUPPLIER' : 'CUSTOMER'}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">TIPE UNIT</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">{type === 'purchase' ? 'QTY BELI' : 'QTY JUAL'}</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">{type === 'purchase' ? 'QTY TERIMA' : 'QTY KIRIM'}</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">KURANG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="group">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow className="group">
                  <TableCell colSpan={8} className="py-16 px-4">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p className="text-sm">Gagal memuat data outstanding</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pagedRows.length === 0 ? (
                <TableRow className="group">
                  <TableCell colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    Data tidak tersedia
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {pagedRows.map((item, index) => (
                    <TableRow key={`${item.code}-${item.unit_type}-${index}`} className="group border-b border-slate-200 hover:bg-gray-50 transition-colors">
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                        {(safeTablePage - 1) * ROWS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left whitespace-nowrap">{item.code}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatDateLabel(item.date)}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-left whitespace-nowrap">{(type === 'purchase' ? item.supplier_name : item.customer_name) || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-left whitespace-nowrap">{item.unit_type || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{formatNumber(item.order_qty)}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{formatNumber(type === 'purchase' ? (item.received_qty ?? 0) : (item.delivered_qty ?? 0))}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{formatNumber(item.remaining_qty)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="group bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200 font-semibold print-hide-pagination">
                    <TableCell colSpan={5} className="px-4 py-4 text-center text-slate-900">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(summary.order)}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(summary.processed)}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(summary.remaining)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Local Pagination */}
        {!isLoading && !isError && rows.length > 0 && (
          <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between p-4 border-t no-print">
            <div>
              Showing {showingFrom} to {showingTo} of {rows.length} data
            </div>
            {lastTablePage > 1 && (
              <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                <Button
                  variant="ghost"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                  onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                  disabled={safeTablePage <= 1}
                >
                  Previous
                </Button>

                {pages.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-500">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant="ghost"
                      className={cn(
                        'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                        p === safeTablePage
                          ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                          : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                      )}
                      onClick={() => setTablePage(Number(p))}
                    >
                      {p}
                    </Button>
                  )
                )}

                <Button
                  variant="ghost"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                  onClick={() => setTablePage((prev) => Math.min(lastTablePage, prev + 1))}
                  disabled={safeTablePage >= lastTablePage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* API pagination (load more pages) */}
        {!isLoading && !isError && pagination.total > 0 && pagination.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-2.5 border-t bg-slate-50 text-xs text-slate-500 no-print">
            <span>
              Halaman API: {pagination.current_page} / {pagination.last_page} &nbsp;·&nbsp; Total record: {pagination.total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                className="h-8 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                className="h-8 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
