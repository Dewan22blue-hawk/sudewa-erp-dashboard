import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SalesTransactionItem } from '@/services/laporan-penjualan.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  data: SalesTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

import { cn } from '@/lib/utils';

export default function LaporanPenjualanPerTipe({ data, pagination, isLoading, onPageChange }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Generate pagination items
  const pages: (number | string)[] = [];
  const currentPage = pagination.currentPage;
  const lastPage = pagination.lastPage;
  
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
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center w-16">NO</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO PENJUALAN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">TGL JUAL</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">TIPE UNIT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">QTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">HARGA</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA BBN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA EKSPEDISI</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA LAIN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">TOTAL JUAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => {
                const items = item.unit_transaction_items || [];
                const unitTypes = Array.from(new Set(items.map(u => u.unit_type?.name).filter(Boolean))).join(', ');
                const qty = items.reduce((acc, curr) => acc + curr.qty_total, 0);
                const harga = items.reduce((acc, curr) => acc + (curr.price * curr.qty_total), 0);
                const biayaBbn = items.reduce((acc, curr) => acc + (curr.bbn_price * curr.qty_total), 0);
                const biayaEkspedisi = items.reduce((acc, curr) => acc + curr.expedition_fee, 0);
                const biayaLain = items.reduce((acc, curr) => acc + curr.other_fee, 0);

                return (
                  <TableRow key={item.id} className="border-b border-slate-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</TableCell>
                    <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left whitespace-nowrap">{item.code}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left whitespace-nowrap max-w-[200px] truncate" title={unitTypes || '-'}>
                      {unitTypes || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{qty}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(harga)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(biayaBbn)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(biayaEkspedisi)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(biayaLain)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm font-semibold text-slate-900 text-center whitespace-nowrap">{formatCurrency(item.transaction_bruto_total)}</TableCell>
                  </TableRow>
                );
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="px-4 py-10 text-center text-sm text-gray-500">
                    Tidak ada data penjualan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1 no-print">
          <div>
            Showing {pagination.from} to {pagination.to} of {pagination.total} data
          </div>
          {lastPage > 1 && (
            <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
              <Button
                variant="ghost"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                onClick={() => onPageChange(currentPage - 1)}
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
                    onClick={() => onPageChange(Number(p))}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                onClick={() => onPageChange(currentPage + 1)}
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
