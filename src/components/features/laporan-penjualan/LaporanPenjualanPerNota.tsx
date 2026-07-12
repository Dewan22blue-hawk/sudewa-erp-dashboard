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

export default function LaporanPenjualanPerNota({ data, pagination, isLoading, onPageChange }: Props) {
  // Flatten data: setiap item bisa memiliki multiple unit_transaction_items
  const flattenedData = data.flatMap((item) =>
    (item.unit_transaction_items || []).map((unit, idx) => ({
      id: `${item.id}-${idx}`,
      noPenjualan: item.code,
      tanggal: item.created_at,
      tipeUnit: unit.unit_type.name,
      qty: unit.qty_total,
      hargaJual: unit.price,
      biayaBbn: unit.bbn_price,
      biayaEkspedisi: unit.expedition_fee,
      biayaLainnya: unit.other_fee,
      hpp: unit.hpp_total_price,
      dpp: unit.dpp_total_price,
      ppn: unit.ppn_total_price,
      jumlah: item.transaction_bruto_total,
    }))
  );

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
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">HARGA JUAL</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA BBN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA EKSPEDISI</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">BIAYA LAINNYA</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">HPP</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">DPP</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">PPN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">JUMLAH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedData.map((item, idx) => (
                <TableRow key={item.id} className="border-b border-slate-200 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{idx + 1 + (pagination.currentPage - 1) * pagination.perPage}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left whitespace-nowrap">{item.noPenjualan}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatDate(item.tanggal)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left whitespace-nowrap">{item.tipeUnit}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{item.qty}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.hargaJual)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.biayaBbn)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.biayaEkspedisi)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.biayaLainnya)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.hpp)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.dpp)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">{formatCurrency(item.ppn)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-900 text-center whitespace-nowrap">{formatCurrency(item.jumlah)}</TableCell>
                </TableRow>
              ))}
              {flattenedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="px-4 py-10 text-center text-sm text-gray-500">
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
