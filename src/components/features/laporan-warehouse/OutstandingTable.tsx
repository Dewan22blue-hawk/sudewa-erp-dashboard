"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
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
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetWarehouseOutstanding } from '@/hooks/useLaporanWarehouse';
import { OrderOutstandingItem } from '@/services/laporan-warehouse.service';

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
  return format(parsed, 'dd/MM/yyyy');
};

const toCsvLine = (cells: Array<string | number>): string =>
  cells
    .map((cell) => {
      const safe = String(cell).replace(/"/g, '""');
      return `"${safe}"`;
    })
    .join(',');

const ROWS_PER_PAGE = 50;

export default function OutstandingTable({ type, perPage, dateRange, onActionsChange }: OutstandingTableProps) {
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

  const rows = response?.data || [];
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

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-12 text-center font-semibold">NO</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">{type === 'purchase' ? 'KODE PEMBELIAN' : 'KODE PENJUALAN'}</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">{type === 'purchase' ? 'TGL PEMBELIAN' : 'TGL JUAL'}</TableHead>
                <TableHead className="font-semibold">{type === 'purchase' ? 'SUPPLIER' : 'CUSTOMER'}</TableHead>
                <TableHead className="font-semibold">TIPE UNIT</TableHead>
                <TableHead className="text-right font-semibold">{type === 'purchase' ? 'QTY BELI' : 'QTY JUAL'}</TableHead>
                <TableHead className="text-right font-semibold">{type === 'purchase' ? 'QTY TERIMA' : 'QTY KIRIM'}</TableHead>
                <TableHead className="text-right font-semibold">KURANG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p>Gagal memuat data outstanding</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                    Data tidak tersedia
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {pagedRows.map((item, index) => (
                    <TableRow key={`${item.code}-${item.unit_type}-${index}`} className="hover:bg-gray-50">
                      <TableCell className="text-center">
                        {(safeTablePage - 1) * ROWS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{item.code}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateLabel(item.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{(type === 'purchase' ? item.supplier_name : item.customer_name) || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.unit_type || '-'}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.order_qty)}</TableCell>
                      <TableCell className="text-right">{formatNumber(type === 'purchase' ? (item.received_qty ?? 0) : (item.delivered_qty ?? 0))}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.remaining_qty)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50 font-semibold print-hide-pagination">
                    <TableCell colSpan={5} className="text-center">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(summary.order)}</TableCell>
                    <TableCell className="text-right">{formatNumber(summary.processed)}</TableCell>
                    <TableCell className="text-right">{formatNumber(summary.remaining)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && !isError && rows.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t no-print">
            <div className="text-sm text-gray-500">
              Showing {showingFrom} to {showingTo} of {rows.length} data
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={safeTablePage === 1}
                onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button variant="default" size="sm" className="bg-primary pointer-events-none">
                {safeTablePage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safeTablePage === lastTablePage}
                onClick={() => setTablePage((prev) => Math.min(lastTablePage, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* API pagination (load more pages) */}
        {!isLoading && !isError && pagination.total > 0 && pagination.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 no-print">
            <span>
              Halaman API: {pagination.current_page} / {pagination.last_page} &nbsp;·&nbsp; Total record: {pagination.total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
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
