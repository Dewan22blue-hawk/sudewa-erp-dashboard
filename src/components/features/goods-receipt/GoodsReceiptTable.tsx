import Link from 'next/link';
import { useMemo } from 'react';
import { MoreVertical, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GoodsReceipt } from '@/@types/goods-receipt.types';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getReceiptStatusLabel } from './goods-receipt.utils';

interface GoodsReceiptTableProps {
  slug: string;
  data: GoodsReceipt[];
  totalData: number;
  page: number;
  perPage: number;
  search: string;
  isLoading?: boolean;
  canAdd?: boolean;
  onPageChange: (value: number) => void;
  onPerPageChange: (value: number) => void;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  onPay: (item: GoodsReceipt) => void;
  onUpload: (item: GoodsReceipt) => void;
  onDelete?: (item: GoodsReceipt) => void;
}

export function GoodsReceiptTable({
  slug,
  data,
  totalData,
  page,
  perPage,
  search,
  isLoading = false,
  canAdd = false,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onAdd,
  onPay,
  onUpload,
  onDelete,
}: GoodsReceiptTableProps) {
  const totalPages = Math.max(1, Math.ceil((totalData || 0) / perPage));
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Penerimaan Material</h1>
        <p className="text-sm text-muted-foreground">Kelola dan lacak semua data penerimaan stock material</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="pl-9 bg-white" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                <SelectTrigger className="w-[70px] bg-white">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>

          <Button onClick={() => onAdd?.()} disabled={!canAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow className="hover:bg-[#f8f9fa]">
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE BELI</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">SUPPLIER</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">HARGA BELI</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">STATUS</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="group">
                  <TableCell colSpan={6} className="text-center px-4 py-4 sticky right-0 bg-white  z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
    <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <span className="text-sm font-medium text-slate-500">Memuat data...</span>
    </div>
</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow className="group">
                  <TableCell colSpan={100} className="py-16 h-28 text-center text-slate-500 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="group bg-white hover:bg-slate-50 transition-colors">
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.code}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatDate(item.transactionDate)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.supplier?.name ?? '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatCurrency(item.totalBrutto)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{getReceiptStatusLabel(item)}</TableCell>
                    <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            <Link href={`/dashboard/${slug}/warehouse/penerimaan-material/${item.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            <Link href={`/dashboard/${slug}/warehouse/penerimaan-material/${item.id}`}>Detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPay(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Bayar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpload(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Upload Nota
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete?.(item)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <p>Showing {startData}-{endData} of {totalData} data</p>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                  pageNumber === page
                    ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                    : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                )}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            {totalPages > 5 && !pageNumbers.includes(totalPages) && <span className="px-1 text-slate-500">...</span>}
            {totalPages > 5 && !pageNumbers.includes(totalPages) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 min-w-9 rounded-xl border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
