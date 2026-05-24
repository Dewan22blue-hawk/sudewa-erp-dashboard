import * as React from 'react';
import { CalendarDays, Eye, MoreVertical, Plus, Printer, RefreshCw, Search, Trash2 } from 'lucide-react';
import type { DoInvoiceTableRow } from '@/@types/create-invoice.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDisplayDate } from './create-invoice.utils';

interface Props {
  rows: DoInvoiceTableRow[];
  search: string;
  isLoading?: boolean;
  page: number;
  perPage: number;
  totalData: number;
  sortOrder: 'asc' | 'desc';
  printFilter: '' | '0' | '1';
  dateFilter?: string;
  selectedIds: number[];
  isProcessing?: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (value: number) => void;
  onPerPageChange: (value: number) => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onPrintFilterChange: (value: '' | '0' | '1') => void;
  onDateFilterChange: (value: string) => void;
  onResetFilters: () => void;
  onAdd: () => void;
  onDetail: (row: DoInvoiceTableRow) => void;
  onPrint: (row: DoInvoiceTableRow) => void;
  onDelete: (row: DoInvoiceTableRow) => void;
  onToggleRow: (id: number, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onProcessSelected: () => void;
}

export function CreateInvoiceTable({
  rows,
  search,
  isLoading = false,
  page,
  perPage,
  totalData,
  sortOrder,
  printFilter,
  dateFilter,
  selectedIds,
  isProcessing = false,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onSortOrderChange,
  onPrintFilterChange,
  onDateFilterChange,
  onResetFilters,
  onAdd,
  onDetail,
  onPrint,
  onDelete,
  onToggleRow,
  onToggleAll,
  onProcessSelected,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const visiblePages = getVisiblePageNumbers(totalPages, page, 5);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  const partialSelected = rows.some((row) => selectedIds.includes(row.id)) && !allSelected;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[38px] font-semibold tracking-[-0.03em] text-slate-950">Data Invoice</h1>
          <p className="mt-1 text-base text-slate-500">Buat faktur dengan informasi penagihan yang diperlukan.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={onResetFilters} className="h-11 rounded-xl border-slate-200">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Filter
          </Button>
          <Button type="button" onClick={onAdd} className="h-11 rounded-xl bg-[#1f4163] px-5 text-sm font-medium hover:bg-[#183552]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto_auto] xl:items-center">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="h-11 rounded-xl border-slate-200 bg-white pl-11 text-sm" />
        </div>

        <DatePicker
          value={dateFilter}
          onChange={(date) => onDateFilterChange(date ? date.toISOString().slice(0, 10) : '')}
          placeholder="Filter tanggal"
          className="h-11 min-w-[180px] rounded-xl border-slate-200 bg-white"
        />

        <Select value={printFilter || 'all'} onValueChange={(value) => onPrintFilterChange(value === 'all' ? '' : (value as '0' | '1'))}>
          <SelectTrigger className="h-11 min-w-[170px] rounded-xl border-slate-200 bg-white">
            <SelectValue placeholder="Status print" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="0">Belum diprint</SelectItem>
            <SelectItem value="1">Sudah diprint</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as 'asc' | 'desc')}>
          <SelectTrigger className="h-11 min-w-[150px] rounded-xl border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">Show</span>
          <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
            <SelectTrigger className="h-11 w-[90px] rounded-xl border-slate-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-700">Page</span>
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Badge className="bg-emerald-600 text-white">{selectedIds.length} invoice terpilih</Badge>
          <Button type="button" onClick={onProcessSelected} disabled={isProcessing} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700">
            {isProcessing ? 'Memproses...' : 'Proses Invoice'}
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#eef3f8]">
              <TableRow className="border-slate-200">
                <TableHead className="w-[56px] px-4 py-4 text-center">
                  <Checkbox checked={allSelected ? true : partialSelected ? 'indeterminate' : false} onCheckedChange={(checked) => onToggleAll(Boolean(checked))} />
                </TableHead>
                {['KODE INVOICE', 'KODE ORDER', 'NAMA CUSTOMER', 'TANGGAL', 'STATUS', 'ACTION'].map((header) => (
                  <TableHead key={header} className="whitespace-nowrap px-4 py-4 text-center text-sm font-semibold text-slate-900">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: Math.min(perPage, 5) }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="border-slate-100">
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex} className="px-4 py-4">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="h-8 w-8 text-slate-300" />
                      <p>Belum ada data invoice yang sesuai filter.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading &&
                rows.map((row) => (
                  <TableRow key={row.id} className="border-slate-100 transition-colors hover:bg-slate-50/70">
                    <TableCell className="px-4 py-4 text-center">
                      <Checkbox checked={selectedIds.includes(row.id)} onCheckedChange={(checked) => onToggleRow(row.id, Boolean(checked))} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700">{row.code}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{row.orderCode}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{row.customerName}</TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatDisplayDate(row.date)}</TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <Badge className={cn('rounded-full border px-3 py-1 text-xs font-medium', row.isPrinted ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-red-400 bg-red-50 text-red-500')}>
                        {row.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] rounded-xl">
                          <DropdownMenuItem onSelect={() => onDetail(row)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onPrint(row)} className="cursor-pointer">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onDelete(row)} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="text-slate-600">Previous</Button>
          {visiblePages[0] > 1 ? <span className="px-2 text-sm text-slate-500">1 ...</span> : null}
          {visiblePages.map((value) => (
            <Button key={value} variant={value === page ? 'outline' : 'ghost'} size="sm" onClick={() => onPageChange(value)} className={cn(value === page ? 'rounded-xl border-slate-200 bg-white' : 'text-slate-600')}>
              {value}
            </Button>
          ))}
          {visiblePages[visiblePages.length - 1] < totalPages ? <span className="px-2 text-sm text-slate-500">... {totalPages}</span> : null}
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="text-slate-600">Next</Button>
        </div>
      </div>
    </div>
  );
}
