'use client';

import { MoreVertical, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { PengeluaranUnit } from '@/@types/pengeluaran-unit.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaginationMeta } from '@/@types/pagination.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  data: PengeluaranUnit[];
  meta: PaginationMeta;
  search: string;
  perPage: number;
  page: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onRetry: () => void;
}

const formatDate = (value: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd MMMM yyyy', { locale: id });
};

export default function PengeluaranUnitTable({
  data,
  meta,
  search,
  perPage,
  page,
  isLoading,
  isError,
  errorMessage,
  onSearchChange,
  onPerPageChange,
  onPageChange,
  onRetry,
}: Props) {
  const router = useRouter();
  const slugValue = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
  const slug = slugValue ? String(slugValue) : '';
  const resolveBasePath = (): string => {
    if (slug) {
      return `/dashboard/${slug}/warehouse/pengeluaran-unit`;
    }

    const cleanPath = router.asPath.split('?')[0];
    if (cleanPath.includes('/warehouse/pengeluaran-unit')) {
      return cleanPath.replace(/\/+$/, '');
    }

    return '/dashboard/warehouse/pengeluaran-unit';
  };

  const navigateToDetail = (id: number): void => {
    const base = resolveBasePath();
    void router.push(`${base}/${id}`);
  };

  const navigateToEdit = (id: number): void => {
    const base = resolveBasePath();
    void router.push(`${base}/${id}/edit`);
  };

  const totalPages = Math.max(1, meta.lastPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let index = 1; index <= totalPages; index += 1) pages.push(index);
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }

    return pages;
  };

  const startIndex = meta.total === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1;
  const endIndex = meta.total === 0 ? 0 : Math.min(startIndex + data.length - 1, meta.total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(event) => onSearchChange(event.target.value)} className="pl-9 bg-white" />
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
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
        <Table className="w-full text-sm">
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-[#f8f9fa]">
              <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO PENGELUARAN</TableHead>
              <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL</TableHead>
              <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">CUSTOMER</TableHead>
              <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">WAREHOUSE</TableHead>
              <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KETERANGAN</TableHead>
              <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-15 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
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
                <TableCell colSpan={100} className="text-center px-4 py-16 sticky right-0 bg-white  z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
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
                  <TableCell className="px-4 py-4 text-gray-900 font-medium text-left text-sm">{item.activityNumber}</TableCell>
                  <TableCell className="px-4 py-4 text-slate-700 text-left text-sm">{formatDate(item.activityDate)}</TableCell>
                  <TableCell className="px-4 py-4 text-slate-700 text-left text-sm">{item.person?.name ?? '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-slate-700 text-left text-sm">{item.warehouse?.name ?? '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-slate-700 text-left text-sm">{item.description || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-center sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                        <DropdownMenuItem onClick={() => navigateToDetail(item.id)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateToEdit(item.id)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                          Edit
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
        <div>
          Showing {startIndex === 0 && endIndex === 0 ? '0' : `${startIndex}-${endIndex}`} of {meta.total} data
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          {getPageNumbers().map((pageNumber, index) => (
            <Button
              key={`${String(pageNumber)}-${index}`}
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                pageNumber === page
                  ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                  : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
              )}
              onClick={() => {
                if (typeof pageNumber === 'number') onPageChange(pageNumber);
              }}
              disabled={typeof pageNumber !== 'number'}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            disabled={page >= totalPages || meta.total === 0}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
