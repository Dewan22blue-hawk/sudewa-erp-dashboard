import * as React from 'react';
import { MoreVertical, Plus, Search } from 'lucide-react';
import type { BBNBill } from '@/@types/bbn-bill.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { calculateOutstanding, formatBillCode, formatCurrency, formatShortDate } from '@/components/features/tagihan-bbn/utils';

interface Props {
  items: BBNBill[];
  search: string;
  isLoading?: boolean;
  page: number;
  perPage: number;
  totalData: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  onAdd: () => void;
  onDetail: (item: BBNBill) => void;
  onEdit: (item: BBNBill) => void;
  onPay: (item: BBNBill) => void;
  onPrint: (item: BBNBill) => void;
  onDelete: (item: BBNBill) => void;
}

export function BBNBillTable({
  items,
  search,
  isLoading = false,
  page,
  perPage,
  totalData,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onAdd,
  onDetail,
  onEdit,
  onPay,
  onPrint,
  onDelete,
}: Props) {
  void onEdit;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);
  const pages = getVisiblePageNumbers(totalPages, page, 5);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[314px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search here"
              className="rounded-xl border-slate-200 bg-white pl-10 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="w-[70px] bg-white rounded-xl border-slate-200 shadow-sm cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-700">Page</span>
          </div>
        </div>

        <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Data
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">s*<Table>
        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
          <TableRow className="border-slate-200">
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NOMOR TAGIHAN</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">KODE DITLANTAS</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">TGL TAGIHAN</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NAMA DEALER</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">TGL BAYAR</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">TOTAL TAGIHAN</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">TERBAYAR</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">KURANG BAYAR</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: Math.min(perPage, 6) }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className="group animate-pulse border-slate-100">
                {Array.from({ length: 9 }).map((__, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                    <div className="h-4 rounded bg-slate-100" />
                  </TableCell>
                ))}
              </TableRow>
            ))
            : null}
          {!isLoading && items.length === 0 ? (
            <TableRow className="group">
              <TableCell colSpan={100} className="h-32 text-center text-sm text-slate-500 px-4 py-16">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="rounded-full bg-slate-50 p-4 mb-2">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                  <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading
            ? items.map((item) => (
              <TableRow key={item.id} className="group border-b border-slate-100 hover:bg-gray-50/70 transition-colors">
                <TableCell className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code || formatBillCode(item.id)}</TableCell>
                <TableCell className="px-4 py-4 text-left text-sm text-slate-700">{item.ditlantasProcess?.code || '-'}</TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatShortDate(item.billDate)}</TableCell>
                <TableCell className="px-4 py-4 text-left text-sm uppercase text-slate-700">{item.ditlantasProcess?.vendor?.name || item.dealer?.name || '-'}</TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatShortDate(item.paidDate)}</TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.bruttoAmount)}</TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatCurrency(item.paidAmount)}</TableCell>
                <TableCell className="px-4 py-4 text-center text-sm font-semibold text-slate-700">{formatCurrency(item.remainingAmount !== undefined ? item.remainingAmount : calculateOutstanding(item.bruttoAmount, item.paidAmount))}</TableCell>
                <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <MoreVertical className="h-4 w-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] rounded-xl bg-white shadow-md border border-slate-100">
                      <DropdownMenuItem onClick={() => onDetail(item)} className="cursor-pointer text-slate-700 hover:bg-slate-50">Detail</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPay(item)} className="cursor-pointer text-slate-700 hover:bg-slate-50">Bayar Tagihan</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPrint(item)} className="cursor-pointer text-slate-700 hover:bg-slate-50">Print</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-slate-50">
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
            : null}
        </TableBody>
      </Table>
      </div>

      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="text-slate-600">
            Previous
          </Button>
          {pages[0] > 1 ? <span className="px-2 text-sm text-slate-500">1 ...</span> : null}
          {pages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={pageNumber === page ? 'rounded-xl border-slate-200 bg-white' : 'text-slate-600'}
            >
              {pageNumber}
            </Button>
          ))}
          {pages[pages.length - 1] < totalPages ? <span className="px-2 text-sm text-slate-500">... {totalPages}</span> : null}
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="text-slate-600">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
