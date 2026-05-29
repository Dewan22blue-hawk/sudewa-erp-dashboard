import * as React from 'react';
import { Eye, FilePenLine, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import type { OrderList } from '@/@types/order-list.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  formatOrderCurrency,
  getOrderVehicleTypeLabel,
  getOrderStatusBadgeClassName,
  getOrderStatusLabel,
  getPrimaryTarifItem,
} from './order-list.utils';

interface OrderListTableProps {
  data: OrderList[];
  search: string;
  page: number;
  perPage: number;
  totalData: number;
  isLoading?: boolean;
  isRefetching?: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (value: number) => void;
  onPerPageChange: (value: number) => void;
  onAdd: () => void;
  onDetail: (item: OrderList) => void;
  onEdit: (item: OrderList) => void;
  onDelete: (item: OrderList) => void;
}

const headers = [
  'KODE ORDER',
  'NAMA CUSTOMER',
  'LOADING IN',
  'TUJUAN KIRIM',
  'LOADING OUT',
  'TIPE',
  'UJ DRIVER',
  'INV EKSPEDISI',
  'PPN',
  'STATUS',
  'ACTION',
];

export const OrderListTable = React.memo(function OrderListTable({
  data,
  search,
  page,
  perPage,
  totalData,
  isLoading = false,
  isRefetching = false,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onAdd,
  onDetail,
  onEdit,
  onDelete,
}: OrderListTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const visiblePages = getVisiblePageNumbers(totalPages, page, 5);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[38px] font-semibold tracking-[-0.03em] text-slate-950">Order List</h1>
        <p className="mt-1 text-base text-slate-500">Lihat dan kelola pesanan pelanggan dengan mudah.</p>
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
          {isRefetching ? <span className="text-xs font-medium text-slate-500">Memperbarui data...</span> : null}

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

        <Button type="button" onClick={onAdd} className="h-11 cursor-pointer rounded-xl bg-[#1f4163] px-5 text-sm font-medium hover:bg-[#183552]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1180px]">
            <TableHeader className="bg-[#eef3f8]">
              <TableRow className="border-slate-200">
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
                      {headers.map((header) => (
                        <TableCell key={header} className="px-4 py-5">
                          <div className="h-4 min-w-[90px] animate-pulse rounded bg-slate-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length} className="h-28 text-center text-sm text-slate-500">
                    Belum ada data order list.
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading
                ? data.map((item) => {
                    const primaryTarif = getPrimaryTarifItem(item);

                    return (
                      <TableRow key={item.id} className="border-slate-100 transition-colors hover:bg-slate-50/70">
                        <TableCell className="px-4 py-4 text-sm text-slate-700">{item.code || '-'}</TableCell>
                        <TableCell className="min-w-[180px] px-4 py-4 text-center text-sm text-slate-700">{item.customer?.name || '-'}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{primaryTarif?.loadingIn || item.loadingIn || '-'}</TableCell>
                        <TableCell className="min-w-[180px] px-4 py-4 text-center text-sm text-slate-700">
                          {primaryTarif?.deliveryDestination || '-'}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{primaryTarif?.loadingOut || item.loadingOut || '-'}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{getOrderVehicleTypeLabel(item, primaryTarif)}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatOrderCurrency(primaryTarif?.driverFee || item.ujDriver)}</TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">
                          {formatOrderCurrency(primaryTarif?.expeditionInvoice || item.billInvoice)}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-right text-sm text-slate-700">{formatOrderCurrency(item.ppn)}</TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <Badge variant="outline" className={cn('rounded-full px-3 py-1 font-medium', getOrderStatusBadgeClassName(item.status))}>
                            {getOrderStatusLabel(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 cursor-pointer rounded-full">
                                <MoreVertical className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[190px] rounded-xl">
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  onDetail(item);
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  onEdit(item);
                                }}
                                className="cursor-pointer"
                              >
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  onDelete(item);
                                }}
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
          <Button type="button" variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="cursor-pointer text-slate-600">
            Previous
          </Button>
          {visiblePages[0] > 1 ? <span className="px-2 text-sm text-slate-500">1 ...</span> : null}
          {visiblePages.map((value) => (
            <Button
              key={value}
              variant={value === page ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(value)}
              className={cn('cursor-pointer', value === page ? 'rounded-xl border-slate-200 bg-white' : 'text-slate-600')}
            >
              {value}
            </Button>
          ))}
          {visiblePages[visiblePages.length - 1] < totalPages ? <span className="px-2 text-sm text-slate-500">... {totalPages}</span> : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="cursor-pointer text-slate-600">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
});
