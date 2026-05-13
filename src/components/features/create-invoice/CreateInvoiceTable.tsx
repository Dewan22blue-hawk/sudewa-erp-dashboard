import * as React from 'react';
import { Eye, FilePenLine, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import type { CreateInvoiceTableRow } from '@/@types/create-invoice.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { formatDisplayDate, formatMoney } from './create-invoice.utils';

interface Props {
  rows: CreateInvoiceTableRow[];
  search: string;
  isLoading?: boolean;
  page: number;
  perPage: number;
  totalData: number;
  selectedIds: number[];
  onSearchChange: (value: string) => void;
  onPageChange: (value: number) => void;
  onPerPageChange: (value: number) => void;
  onToggleSelect: (id: number, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onAdd: () => void;
  onProcess: () => void;
  onDetail: (row: CreateInvoiceTableRow) => void;
  onEdit: (row: CreateInvoiceTableRow) => void;
  onDelete: (row: CreateInvoiceTableRow) => void;
}

const headers = [
  'KODE DO',
  'TANGGAL',
  'CUSTOMER',
  'LOADING IN',
  'TUJUAN KIRIM',
  'LOADING OUT',
  'KETERANGAN',
  'UJ DRIVER',
  'UJ LAINNYA',
  'INVOICE',
  'INVOICE TAMBAHAN',
  'PPN',
  'ACTION',
];

export function CreateInvoiceTable({
  rows,
  search,
  isLoading = false,
  page,
  perPage,
  totalData,
  selectedIds,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onToggleSelect,
  onToggleSelectAll,
  onAdd,
  onProcess,
  onDetail,
  onEdit,
  onDelete,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const visiblePages = getVisiblePageNumbers(totalPages, page, 5);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);
  const pageSelectionState = rows.length > 0 && rows.every((row) => selectedIds.includes(row.invoice.id));
  const hasPartialSelection = rows.some((row) => selectedIds.includes(row.invoice.id)) && !pageSelectionState;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[38px] font-semibold tracking-[-0.03em] text-slate-950">Data Invoice</h1>
        <p className="mt-1 text-base text-slate-500">Kelola data datainvoice dengan mudah</p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-[310px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search here"
              className="h-11 rounded-xl border-slate-200 bg-white pl-11 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-11 w-[92px] rounded-xl border-slate-200 bg-white">
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onProcess}
            disabled={selectedIds.length === 0}
            className="h-11 rounded-xl border-slate-200 px-5 text-sm font-medium text-slate-900"
          >
            Proses Invoice
          </Button>
          <Button onClick={onAdd} className="h-11 rounded-xl bg-[#1f4163] px-5 text-sm font-medium hover:bg-[#183552]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#eef3f8]">
              <TableRow className="border-slate-200">
                <TableHead className="w-[52px] px-4 py-4 text-center">
                  <Checkbox
                    checked={pageSelectionState ? true : hasPartialSelection ? 'indeterminate' : false}
                    onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
                    aria-label="Pilih semua data"
                  />
                </TableHead>
                {headers.map((header) => (
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
                      <TableCell className="px-4 py-5"><div className="h-4 rounded bg-slate-100" /></TableCell>
                      {headers.map((header) => (
                        <TableCell key={header} className="px-4 py-5">
                          <div className="h-4 min-w-[90px] animate-pulse rounded bg-slate-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length + 1} className="h-28 text-center text-sm text-slate-500">
                    Belum ada data create invoice.
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading
                ? rows.map((row) => {
                    const isChecked = selectedIds.includes(row.invoice.id);

                    return (
                      <TableRow key={row.invoice.id} className="border-slate-100">
                        <TableCell className="px-4 py-4 text-center">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => onToggleSelect(row.invoice.id, Boolean(checked))}
                            aria-label={`Pilih invoice ${row.doCode}`}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-slate-700">{row.doCode}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{formatDisplayDate(row.date)}</TableCell>
                        <TableCell className="min-w-[160px] px-4 py-4 text-center text-sm text-slate-700">{row.customer}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{row.loadingIn}</TableCell>
                        <TableCell className="min-w-[160px] px-4 py-4 text-center text-sm text-slate-700">{row.destination}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{row.loadingOut}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{row.description}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatMoney(row.driverFee)}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatMoney(row.otherFee)}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatMoney(row.invoiceFee)}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatMoney(row.additionalFee)}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatMoney(row.ppnFee)}</TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                <MoreVertical className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[190px] rounded-xl">
                              <DropdownMenuItem onSelect={() => onDetail(row)} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onEdit(row)} className="cursor-pointer">
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => onDelete(row)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="text-slate-600">
            Previous
          </Button>
          {visiblePages[0] > 1 ? <span className="px-2 text-sm text-slate-500">1 ...</span> : null}
          {visiblePages.map((value) => (
            <Button
              key={value}
              variant={value === page ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(value)}
              className={cn(value === page ? 'rounded-xl border-slate-200 bg-white' : 'text-slate-600')}
            >
              {value}
            </Button>
          ))}
          {visiblePages[visiblePages.length - 1] < totalPages ? <span className="px-2 text-sm text-slate-500">... {totalPages}</span> : null}
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="text-slate-600">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
