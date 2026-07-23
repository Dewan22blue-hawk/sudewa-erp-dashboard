"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import { useGetWarehouseStock } from '@/hooks/useLaporanWarehouse';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';

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

  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const columns = useMemo<ColumnDef<GroupedStockRow>[]>(
    () => [
      {
        header: 'MERK UNIT',
        accessorKey: 'brand',
        sortable: true,
        alignment: 'center',
        cell: (item) => item?.brand ? <ReferenceLink href={`/dashboard/${slugStr}/master/brand?search=${item?.brand}`}>{item?.brand}</ReferenceLink> : '-'
      },
      {
        header: 'TIPE UNIT',
        accessorKey: 'unit',
        sortable: true,
        alignment: 'center',
        cell: (item) => item?.unit ? <ReferenceLink href={`/dashboard/${slugStr}/master/type-unit?search=${item?.unit}`}>{item?.unit}</ReferenceLink> : '-'
      },
      {
        header: 'QTY',
        accessorKey: 'qty',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatNumber(item.qty),
      },
    ],
    []
  );

  const footerRow = useMemo(
    () => (
      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200 font-semibold">
        <TableCell colSpan={3} className="px-4 py-4 text-center text-slate-900">
          GRAND TOTAL
        </TableCell>
        <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(grandTotal)}</TableCell>
      </TableRow>
    ),
    [grandTotal]
  );

  const selectFilter = useMemo(
    () => (
      <div className="flex justify-end no-print">
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unprocessed">Unprocessed</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="all">Semua</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ),
    [status]
  );

  return (
    <div className="space-y-4">
      {isError ? (
        <div className="flex flex-col items-center justify-center text-red-500 py-16 bg-white rounded-md border border-gray-200">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">Gagal memuat data stock</p>
        </div>
      ) : (
        <BaseTable
          data={groupedRows}
          columns={columns}
          loading={isLoading}
          footer={footerRow}
          headerActions={selectFilter}
          meta={{
            currentPage: pagination.current_page,
            perPage: pagination.per_page,
            lastPage: pagination.last_page,
            total: pagination.total,
          }}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
