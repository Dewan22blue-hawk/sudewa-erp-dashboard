"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useGetWarehouseStock } from '@/hooks/useLaporanWarehouse';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface GroupedStockRow {
  brand: string;
  unit: string;
  qty: number;
}

const formatNumber = (value: number): string => value.toLocaleString('id-ID');

const toCsvLine = (cells: Array<string | number>): string =>
  cells
    .map((cell) => {
      const safe = String(cell).replace(/"/g, '""');
      return `"${safe}"`;
    })
    .join(',');

type StockTabProps = {
  perPage: number;
  onActionsChange?: (actions: { print: () => void; download: () => void }) => void;
};

export default function StockTab({ perPage, onActionsChange }: StockTabProps) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('unprocessed');

  const {
    data: response,
    isLoading,
    isError,
  } = useGetWarehouseStock({
    company_id: 1,
    page,
    per_page: perPage,
    status,
  });

  const rows = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response || {
    current_page: 1,
    data: [],
    last_page: 1,
    per_page: perPage,
    total: 0,
    from: 0,
    to: 0,
  };

  const groupedRows = useMemo(() => {
    const grouped = rows.reduce<Record<string, GroupedStockRow>>((accumulator, item) => {
      const brandName = item.unit_type.brand?.name || '-';
      const unitName = item.unit_type.name || '-';
      const key = `${brandName}|${unitName}`;

      if (!accumulator[key]) {
        accumulator[key] = {
          brand: brandName,
          unit: unitName,
          qty: 0,
        };
      }

      accumulator[key].qty += item.stock_available + item.stock_forecast;
      return accumulator;
    }, {});

    return Object.values(grouped);
  }, [rows]);

  const grandTotal = useMemo(
    () => groupedRows.reduce((total, item) => total + item.qty, 0),
    [groupedRows],
  );
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (groupedRows.length === 0) {
      toast.error('Tidak ada data untuk diunduh');
      return;
    }

    const header = ['NO', 'MERK UNIT', 'TIPE UNIT', 'QTY'];
    const lines = [toCsvLine(header)];

    groupedRows.forEach((item, index) => {
      lines.push(toCsvLine([index + 1, item.brand, item.unit, item.qty]));
    });

    lines.push(toCsvLine(['', 'GRAND TOTAL', '', grandTotal]));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `warehouse-stock-page-${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success('Data stock berhasil diunduh');
  }, [groupedRows, grandTotal, page]);

  useEffect(() => {
    onActionsChange?.({ print: handlePrint, download: handleDownload });
  }, [handleDownload, handlePrint, onActionsChange]);

  // Generate pagination items
  const pages: (number | string)[] = [];
  const currentPage = pagination.current_page;
  const lastPage = pagination.last_page;
  
  if (lastPage <= 5) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', lastPage);
    } else if (currentPage >= lastPage - 2) {
      pages.push(1, '...', lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 no-print">
        <Select value={status} onValueChange={(val) => {
          setStatus(val);
          setPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unprocessed">Unprocessed</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="all">Semua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="w-16 text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">NO</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">MERK UNIT</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">TIPE UNIT</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">QTY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 px-4">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p className="text-sm">Gagal memuat data stock</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : groupedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                    Data tidak tersedia
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {groupedRows.map((item, index) => (
                    <TableRow key={`${item.brand}-${item.unit}-${index}`} className="hover:bg-gray-50/50 border-b border-gray-100 bg-white">
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{index + 1}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.brand}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.unit}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{formatNumber(item.qty)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200 font-semibold">
                    <TableCell colSpan={3} className="px-4 py-4 text-center text-slate-900">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(grandTotal)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isLoading && !isError && pagination.total > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1 no-print">
          <div>
            Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total} data
          </div>
          {lastPage > 1 && (
            <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
              <Button
                variant="ghost"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
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
                      p === currentPage
                        ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                        : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                    )}
                    onClick={() => setPage(Number(p))}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={currentPage >= lastPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
