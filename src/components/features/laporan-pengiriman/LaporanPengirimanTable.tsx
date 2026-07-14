import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PengirimanItem } from '@/services/laporan-pengiriman.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  data: PengirimanItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

import { cn } from '@/lib/utils';

export default function LaporanPengirimanTable({
  data,
  pagination,
  isLoading,
  onPageChange,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">Tidak ada data pengiriman</p>
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
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center w-12">NO</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO PENGIRIMAN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">TGL KIRIM</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NAMA CUSTOMER</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">TIPE UNIT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">WARNA</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO MESIN</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left">NO RANGKA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow key={item.id} className="group border-b border-slate-200 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                    {idx + 1 + (pagination.currentPage - 1) * pagination.perPage}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left">{item.transaction_code}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">{formatDate(item.receipt_date)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.person}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.unit_type.name}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.color}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.machine_number}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">{item.chassis_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="print-hide-pagination flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
          <div>
            Showing {pagination.from}-{pagination.to} of {pagination.total} data
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
