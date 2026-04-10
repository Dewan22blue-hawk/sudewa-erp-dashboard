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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { getStockDetailData, PaginatedResponse, StockItem } from '@/services/laporan-warehouse.service';

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

export default function StockDetailTab({ perPage, machineNumber, onActionsChange }: StockDetailTabProps) {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<StockItem>>({
    current_page: 1,
    data: [],
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getStockDetailData({
        warehouse_id: 1,
        page,
        per_page: perPage,
        machine_number: machineNumber || undefined,
      });
      setRows(result.data);
      setPagination(result);
    } catch {
      toast.error('Gagal memuat data stock detail');
    } finally {
      setIsLoading(false);
    }
  }, [machineNumber, page, perPage]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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
          item.unit_type.name || '-',
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

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-16 text-center">NO</TableHead>
                <TableHead>SUPPLIER</TableHead>
                <TableHead>TIPE UNIT</TableHead>
                <TableHead>WARNA</TableHead>
                <TableHead>NO MESIN</TableHead>
                <TableHead>NO RANGKA</TableHead>
                <TableHead className="text-right">HARGA BELI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                    Data tidak tersedia
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((item, index) => (
                    <TableRow key={`${item.id}-${index}`}>
                      <TableCell className="text-center">
                        {(pagination.from > 0 ? pagination.from - 1 : 0) + index + 1}
                      </TableCell>
                      <TableCell>{item.person || '-'}</TableCell>
                      <TableCell>{item.unit_type.name || '-'}</TableCell>
                      <TableCell>{item.color || '-'}</TableCell>
                      <TableCell>{item.machine_number || '-'}</TableCell>
                      <TableCell>{item.chassis_number || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.purchase_price)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-100/70 font-semibold">
                    <TableCell colSpan={6} className="text-center">
                      GRAND TOTAL
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(grandTotalPurchase)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isLoading && pagination.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <div>
            Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total} data
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              {pagination.current_page} / {pagination.last_page}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
