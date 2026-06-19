import Link from 'next/link';
import { useMemo } from 'react';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GoodsIssue } from '@/@types/goods-issue.types';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getIssueStatusLabel } from './goods-issue.utils';

interface GoodsIssueTableProps {
  slug: string;
  data: GoodsIssue[];
  totalData: number;
  page: number;
  perPage: number;
  search: string;
  isLoading?: boolean;
  onPageChange: (value: number) => void;
  onPerPageChange: (value: number) => void;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onPay: (item: GoodsIssue) => void;
  onUpload: (item: GoodsIssue) => void;
  onDelete: (item: GoodsIssue) => void;
}

export function GoodsIssueTable({
  slug,
  data,
  totalData,
  page,
  perPage,
  search,
  isLoading = false,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onAdd,
  onPay,
  onUpload,
  onDelete,
}: GoodsIssueTableProps) {
  const totalPages = Math.max(1, Math.ceil((totalData || 0) / perPage));
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Pengeluaran Material</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola dan lacak semua data pengeluaran stock material</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="pl-9 bg-white" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                <SelectTrigger className="w-[70px] bg-white">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>

          <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow className="hover:bg-[#f8f9fa]">
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE PENGELUARAN</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">CUSTOMER</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">HARGA JUAL</TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">STATUS</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24 whitespace-nowrap">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-slate-500 text-sm">Memuat data pengeluaran material...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-slate-500 text-sm">Tidak ada data pengeluaran material.</TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.code}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatDate(item.transactionDate)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.customer?.name ?? '-'}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatCurrency(item.totalBrutto)}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{getIssueStatusLabel(item)}</TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            <Link href={`/dashboard/${slug}/warehouse/pengeluaran-material/${item.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            <Link href={`/dashboard/${slug}/warehouse/pengeluaran-material/${item.id}`}>Detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPay(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">Bayar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpload(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">Upload Nota</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">Hapus</DropdownMenuItem>
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
