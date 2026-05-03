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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getPurchaseOrderOutstanding,
  OrderOutstandingItem,
  PaginatedResponse,
} from '@/services/laporan-warehouse.service';

type PurchaseOrderTabProps = {
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

export default function PurchaseOrderTab({ perPage, dateRange, onActionsChange }: PurchaseOrderTabProps) {
  const [rows, setRows] = useState<OrderOutstandingItem[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<OrderOutstandingItem>>({
    current_page: 1,
    data: [],
    last_page: 1,
    per_page: ROWS_PER_PAGE,
    total: 0,
    from: 0,
    to: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);

  const appliedStartDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const appliedEndDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : appliedStartDate;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPurchaseOrderOutstanding({
        page,
        per_page: perPage,
        start_date: appliedStartDate,
        end_date: appliedEndDate,
      });
      setRows(result.data);
      setPagination(result);
      setTablePage(1);
    } catch {
      toast.error('Gagal memuat data purchase order outstanding');
    } finally {
      setIsLoading(false);
    }
  }, [appliedEndDate, appliedStartDate, page, perPage]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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
          accumulator.received += item.received_qty ?? 0;
          accumulator.remaining += item.remaining_qty;
          return accumulator;
        },
        { order: 0, received: 0, remaining: 0 },
      ),
    [rows],
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
      'KODE PEMBELIAN',
      'TGL PEMBELIAN',
      'SUPPLIER',
      'TIPE UNIT',
      'QTY BELI',
      'QTY TERIMA',
      'KURANG',
    ];
    const lines = [toCsvLine(header)];

    rows.forEach((item, index) => {
      lines.push(
        toCsvLine([
          index + 1,
          item.code,
          formatDateLabel(item.date),
          item.supplier_name || '-',
          item.unit_type || '-',
          item.order_qty,
          item.received_qty ?? 0,
          item.remaining_qty,
        ]),
      );
    });

    lines.push(toCsvLine(['', '', '', '', 'GRAND TOTAL', summary.order, summary.received, summary.remaining]));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `warehouse-po-outstanding-page-${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success('Data purchase order berhasil diunduh');
  }, [page, rows, summary]);

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
                <TableHead className="font-semibold whitespace-nowrap">KODE PEMBELIAN</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">TGL PEMBELIAN</TableHead>
                <TableHead className="font-semibold">SUPPLIER</TableHead>
                <TableHead className="font-semibold">TIPE UNIT</TableHead>
                <TableHead className="text-right font-semibold">QTY BELI</TableHead>
                <TableHead className="text-right font-semibold">QTY TERIMA</TableHead>
                <TableHead className="text-right font-semibold">KURANG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
                      <TableCell className="whitespace-nowrap">{item.supplier_name || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.unit_type || '-'}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.order_qty)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.received_qty ?? 0)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.remaining_qty)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50 font-semibold print-hide-pagination">
                    <TableCell colSpan={5} className="text-center">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(summary.order)}</TableCell>
                    <TableCell className="text-right">{formatNumber(summary.received)}</TableCell>
                    <TableCell className="text-right">{formatNumber(summary.remaining)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && rows.length > 0 && (
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
        {!isLoading && pagination.total > 0 && pagination.last_page > 1 && (
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
