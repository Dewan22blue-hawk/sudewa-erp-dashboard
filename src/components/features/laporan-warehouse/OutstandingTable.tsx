"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetWarehouseOutstanding } from '@/hooks/useLaporanWarehouse';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';

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

  // The outstanding API responds with single rows directly mapped, no manual group summary needed.
  // We compute grand totals from all rows across the page.
  const summary = useMemo(
    () =>
      rows.reduce(
        (accumulator, item) => {
          accumulator.order += item.qty_total || 0;
          if (type === 'purchase') {
            accumulator.processed += item.qty_received || 0;
          } else {
            accumulator.processed += item.qty_outstanding !== undefined ? item.qty_total - item.qty_outstanding : 0;
          }
          accumulator.remaining += item.qty_outstanding || 0;
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
          item.transaction_code || '-',
          formatDateLabel(item.transaction_date),
          item.person_name || '-',
          item.unit_type_name || '-',
          item.qty_total || 0,
          type === 'purchase' ? (item.qty_received || 0) : ((item.qty_total || 0) - (item.qty_outstanding || 0)),
          item.qty_outstanding || 0,
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

  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: type === 'purchase' ? 'KODE PEMBELIAN' : 'KODE PENJUALAN',
        accessorKey: 'transaction_code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item?.transaction_code ?? '-'} />
      },
      {
        header: type === 'purchase' ? 'TGL PEMBELIAN' : 'TGL JUAL',
        accessorKey: 'transaction_date',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatDateLabel(item.transaction_date),
      },
      {
        header: type === 'purchase' ? 'SUPPLIER' : 'CUSTOMER',
        accessorKey: 'person_name',
        sortable: true,
        alignment: 'left',
        cell: (item) => {
          const val = item.person_name || '';
          return <ReferenceLink href={`/dashboard/${slugStr}/master/${type === 'purchase' ? 'supplier' : 'customer'}?search=${val}`}>{val || '-'}</ReferenceLink>;
        }
      },
      {
        header: 'TIPE UNIT',
        accessorKey: 'unit_type_name',
        sortable: true,
        alignment: 'left',
        cell: (item) => {
          const val = item?.unit_type_name || '';
          return <ReferenceLink href={`/dashboard/${slugStr}/master/unit-type?search=${val}`}>{val || '-'}</ReferenceLink>;
        }
      },
      {
        header: type === 'purchase' ? 'QTY BELI' : 'QTY JUAL',
        accessorKey: 'qty_total',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatNumber(item.qty_total || 0),
      },
      {
        header: type === 'purchase' ? 'QTY TERIMA' : 'QTY KIRIM',
        alignment: 'center',
        cell: (item) => formatNumber(type === 'purchase' ? (item.qty_received || 0) : ((item.qty_total || 0) - (item.qty_outstanding || 0))),
      },
      {
        header: 'KURANG',
        accessorKey: 'qty_outstanding',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatNumber(item.qty_outstanding || 0),
      },
    ],
    [type, slugStr]
  );

  const footerRow = useMemo(
    () => (
      <TableRow className="group bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200 font-semibold print-hide-pagination">
        <TableCell colSpan={5} className="px-4 py-4 text-center text-slate-900">
          GRAND TOTAL
        </TableCell>
        <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(summary.order)}</TableCell>
        <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(summary.processed)}</TableCell>
        <TableCell className="px-4 py-4 text-center text-slate-900">{formatNumber(summary.remaining)}</TableCell>
      </TableRow>
    ),
    [summary]
  );

  return (
    <div className="space-y-4">
      {isError ? (
        <div className="flex flex-col items-center justify-center text-red-500 py-16 bg-white rounded-md border border-gray-200">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">Gagal memuat data outstanding</p>
        </div>
      ) : (
        <div className="space-y-4">
          <BaseTable
            data={pagedRows}
            columns={columns}
            loading={isLoading}
            footer={footerRow}
            meta={{
              currentPage: safeTablePage,
              perPage: ROWS_PER_PAGE,
              lastPage: lastTablePage,
              total: rows.length,
            }}
            onPageChange={setTablePage}
          />

          {/* API pagination (load more pages) */}
          {!isLoading && pagination.total > 0 && pagination.last_page > 1 && (
            <div className="flex justify-between items-center px-4 py-2.5 border rounded-md bg-slate-50 text-xs text-slate-500 no-print">
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
      )}
    </div>
  );
}
