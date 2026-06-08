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
        <h1 className="text-[24px] font-semibold text-slate-900">Data Pengeluaran Material</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola dan lacak semua data pengeluaran stock material</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[335px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search here" className="h-11 rounded-xl border-slate-200 bg-white pl-11 shadow-sm" />
          </div>
          <div className="flex items-center gap-3 text-[16px] text-slate-700">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-11 w-[68px] rounded-xl border-slate-200 bg-white shadow-sm">
                <SelectValue />
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

        <Button onClick={onAdd} className="h-11 rounded-xl bg-[#1f4163] px-6 text-[18px] font-medium hover:bg-[#183552]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow className="border-slate-200">
              <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">KODE PENGELUARAN</TableHead>
              <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">TANGGAL</TableHead>
              <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">CUSTOMER</TableHead>
              <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">HARGA JUAL</TableHead>
              <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">STATUS</TableHead>
              <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-900">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-slate-500">Memuat data pengeluaran material...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-slate-500">Tidak ada data pengeluaran material.</TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                  <TableCell className="px-5 py-4 text-[16px] text-slate-800">{item.code}</TableCell>
                  <TableCell className="px-5 py-4 text-[16px] text-slate-800">{formatDate(item.transactionDate)}</TableCell>
                  <TableCell className="px-5 py-4 text-[16px] text-slate-800">{item.customer?.name ?? '-'}</TableCell>
                  <TableCell className="px-5 py-4 text-[16px] text-slate-800">{formatCurrency(item.totalBrutto)}</TableCell>
                  <TableCell className="px-5 py-4 text-[16px] text-slate-800">{getIssueStatusLabel(item)}</TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                          <MoreVertical className="h-4 w-4 text-slate-700" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-2xl border-slate-200 p-2 shadow-lg">
                        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                          <Link href={`/dashboard/${slug}/warehouse/pengeluaran-material/${item.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                          <Link href={`/dashboard/${slug}/warehouse/pengeluaran-material/${item.id}`}>Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPay(item)} className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">Bayar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpload(item)} className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">Upload Nota</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600">Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-[14px] text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
        <div className="flex items-center gap-1 text-[16px]">
          <Button variant="ghost" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="text-slate-700">Previous</Button>
          {pageNumbers.map((pageNumber) => (
            <Button key={pageNumber} variant={pageNumber === page ? 'outline' : 'ghost'} onClick={() => onPageChange(pageNumber)} className={pageNumber === page ? 'h-10 min-w-10 rounded-xl border-slate-200 bg-white' : 'h-10 min-w-10 rounded-xl text-slate-700'}>
              {pageNumber}
            </Button>
          ))}
          {totalPages > 5 && page < totalPages - 2 ? <span className="px-2 text-slate-500">...</span> : null}
          {totalPages > 5 && !pageNumbers.includes(totalPages) ? <Button variant="ghost" onClick={() => onPageChange(totalPages)} className="h-10 min-w-10 rounded-xl text-slate-700">{totalPages}</Button> : null}
          <Button variant="ghost" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="text-slate-700">Next</Button>
        </div>
      </div>
    </div>
  );
}
