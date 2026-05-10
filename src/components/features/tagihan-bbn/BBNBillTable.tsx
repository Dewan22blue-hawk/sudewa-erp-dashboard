import * as React from 'react';
import { MoreVertical, Plus, Printer, Search } from 'lucide-react';
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
              className="h-11 rounded-xl border-slate-200 bg-white pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-11 w-[68px] rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-700">Page</span>
          </div>
        </div>

        <Button onClick={onAdd} className="h-11 rounded-xl bg-[#1f4163] px-5 text-sm font-medium hover:bg-[#183552]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#edf2f7]">
              <TableRow className="border-slate-200">
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">NOMOR TAGIHAN</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">TGL TAGIHAN</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">NAMA DEALER</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">TGL BAYAR</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">TOTAL TAGIHAN</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">TERBAYAR</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">KURANG BAYAR</TableHead>
                <TableHead className="px-5 py-4 text-center text-sm font-semibold text-slate-900">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: Math.min(perPage, 6) }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse border-slate-100">
                      {Array.from({ length: 8 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex} className="px-5 py-4">
                          <div className="h-4 rounded bg-slate-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}
              {!isLoading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-slate-500">
                    Belum ada data tagihan BBN.
                  </TableCell>
                </TableRow>
              ) : null}
              {!isLoading
                ? items.map((item) => (
                    <TableRow key={item.id} className="border-slate-100">
                      <TableCell className="px-5 py-4 text-center text-sm text-slate-700">{formatBillCode(item.id)}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-sm text-slate-700">{formatShortDate(item.billDate)}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-sm uppercase text-slate-700">{item.dealer?.name || '-'}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-sm text-slate-700">{formatShortDate(item.paidDate)}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-sm text-slate-700">{formatCurrency(item.bruttoAmount)}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-sm text-slate-700">{formatCurrency(item.paidAmount)}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-sm text-slate-700">{formatCurrency(calculateOutstanding(item.bruttoAmount, item.paidAmount))}</TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                              <MoreVertical className="h-4 w-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[190px] rounded-xl">
                            <DropdownMenuItem onClick={() => onDetail(item)} className="cursor-pointer">Detail</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPay(item)} className="cursor-pointer">Bayar Tagihan</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPrint(item)} className="cursor-pointer">
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600">
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
      </Card>

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
