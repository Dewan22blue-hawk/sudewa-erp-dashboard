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
import { formatCurrency } from '@/lib/utils/currency';
import { useGetWarehouseStockDetail } from '@/hooks/useLaporanWarehouse';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

type StockDetailTabProps = {
  perPage: number;
  machineNumber: string;
  onActionsChange?: (actions: { print: () => void; download: () => void }) => void;
};

const toCsvLine = (cells: Array<string | number>): string =>
  cells
    .map((cell) => {
      const safe = String(cell).replace(/"/g, '""');
      return `"${safe}"`;
    })
    .join(',');

export default function StockDetailTab({ perPage, machineNumber: initialMachineNumber, onActionsChange }: StockDetailTabProps) {
  const [page, setPage] = useState(1);
  const [machineNumber, setMachineNumber] = useState(initialMachineNumber || '');
  const [chassisNumber, setChassisNumber] = useState('');
  const [color, setColor] = useState('');
  const [stockState, setStockState] = useState('');
  const [inStock, setInStock] = useState('true');

  const debouncedMachineNumber = useDebouncedValue(machineNumber, 500);
  const debouncedChassisNumber = useDebouncedValue(chassisNumber, 500);
  const debouncedColor = useDebouncedValue(color, 500);

  const {
    data: response,
    isLoading,
    isError,
  } = useGetWarehouseStockDetail({
    warehouse_id: 1,
    page,
    per_page: perPage,
    machine_number: debouncedMachineNumber || undefined,
    chassis_number: debouncedChassisNumber || undefined,
    color: debouncedColor || undefined,
    stock_state: stockState === 'all' ? undefined : stockState || undefined,
    in_stock: inStock === 'all' ? undefined : inStock,
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

  const grandTotalPurchase = useMemo(
    () => rows.reduce((total, item) => total + item.purchase_price, 0),
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

    const header = ['NO', 'SUPPLIER', 'TIPE UNIT', 'WARNA', 'NO MESIN', 'NO RANGKA', 'HARGA BELI'];
    const lines = [toCsvLine(header)];

    rows.forEach((item, index) => {
      lines.push(
        toCsvLine([
          (pagination.from > 0 ? pagination.from - 1 : 0) + index + 1,
          item.person || '-',
          item.unit_type?.name || '-',
          item.color || '-',
          item.machine_number || '-',
          item.chassis_number || '-',
          item.purchase_price,
        ]),
      );
    });

    lines.push(toCsvLine(['', '', '', '', '', 'GRAND TOTAL', grandTotalPurchase]));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `warehouse-stock-detail-page-${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success('Data stock detail berhasil diunduh');
  }, [grandTotalPurchase, page, pagination.from, rows]);

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
      <div className="flex flex-wrap items-center gap-3 no-print">
        <Input
          placeholder="Cari No Mesin..."
          value={machineNumber}
          onChange={(e) => {
            setMachineNumber(e.target.value);
            setPage(1);
          }}
          className="w-40"
        />
        <Input
          placeholder="Cari No Rangka..."
          value={chassisNumber}
          onChange={(e) => {
            setChassisNumber(e.target.value);
            setPage(1);
          }}
          className="w-40"
        />
        <Input
          placeholder="Warna..."
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setPage(1);
          }}
          className="w-32"
        />
        <Select value={stockState || 'all'} onValueChange={(val) => { setStockState(val); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stock State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua State</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="bad">Bad</SelectItem>
          </SelectContent>
        </Select>
        <Select value={inStock || 'all'} onValueChange={(val) => { setInStock(val); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="In Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="true">In Stock</SelectItem>
            <SelectItem value="false">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="w-16 text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">NO</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">SUPPLIER</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">TIPE UNIT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">WARNA</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO MESIN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO RANGKA</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-4">HARGA BELI</TableHead>
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
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 px-4">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p className="text-sm">Gagal memuat data stock detail</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    Data tidak tersedia
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((item, index) => (
                    <TableRow key={`${item.id}-${index}`} className="hover:bg-gray-50/50 border-b border-gray-100 bg-white">
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                        {(pagination.from > 0 ? pagination.from - 1 : 0) + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.person || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left">{item.unit_type?.name || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.color || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.machine_number || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.chassis_number || '-'}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 text-right">{formatCurrency(item.purchase_price)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200 font-semibold">
                    <TableCell colSpan={6} className="px-4 py-4 text-center text-slate-900">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right text-slate-900">{formatCurrency(grandTotalPurchase)}</TableCell>
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
            Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total} data
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
