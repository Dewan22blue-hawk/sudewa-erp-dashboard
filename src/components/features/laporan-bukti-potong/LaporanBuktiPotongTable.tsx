import React, { useMemo } from 'react';
import { Loader2, MoreVertical, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/currency';
import type { WithholdingTaxReport } from '@/@types/laporan-bukti-potong.types';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
  }
  return dateStr;
};

type Props = {
  data: WithholdingTaxReport[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  } | null;
  loading?: boolean;
  search: string;
  perPage: number;
  currentPage: number;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onEdit: (item: WithholdingTaxReport) => void;
  onDelete: (item: WithholdingTaxReport) => void;
};

export default function LaporanBuktiPotongTable({
  data,
  meta,
  loading,
  search,
  perPage,
  currentPage,
  onSearchChange,
  onPerPageChange,
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  const totalPages = meta?.last_page ?? 1;
  const pages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const startIndex = meta?.from ?? 0;
  const endIndex = meta?.to ?? 0;
  const totalItems = meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Bukti Potong</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola bukti potong dengan mudah</p>
      </div>

      <div className="flex justify-start items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-medium">Show</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-10 w-[70px] bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="font-medium">Page</span>
        </div>

        <div className="relative w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search here"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 h-10 bg-white border-slate-200 rounded-lg w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">NO</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">TGL INVOICE</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NO INVOICE</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NAMA CUSTOMER</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NO BUKPOT</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">MASA BUKPOT</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">NOMINAL INVOICE</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">PPH</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">UANG MUKA PPH</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    <span className="inline-flex items-center justify-center gap-2 w-full">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      Memuat data...
                    </span>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                    <td className="px-4 py-4 text-center text-sm text-slate-500">{startIndex + index}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">{formatDate(item.tgl_invoice)}</td>
                    <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.no_invoice}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.nama_customer}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.no_bukpot || '-'}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">{item.masa_bukpot || '-'}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.nominal_invoice)}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.pph)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">{item.uang_muka_pph || '-'}</td>
                    <td className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
                          <DropdownMenuItem
                            onSelect={() => onEdit(item)}
                            className="cursor-pointer rounded-xl px-3 py-2.5"
                          >
                            <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium">Edit Bukpot</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => onDelete(item)}
                            className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span className="text-sm font-medium">Hapus Data</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-base font-medium text-slate-900">Data Tidak Ditemukan</p>
                      <p className="text-sm mt-1">Belum ada data laporan bukti potong untuk ditampilkan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
        <div>
          Showing {totalItems > 0 ? startIndex : 0}-{endIndex} of {totalItems} data
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="text-slate-600 disabled:opacity-50"
          >
            Previous
          </Button>

          {pages.map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? 'outline' : 'ghost'}
              size="sm"
              className={`min-w-[32px] ${page === currentPage ? 'bg-white border-slate-200 text-slate-900' : 'text-slate-600'}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number'}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="text-slate-600 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
