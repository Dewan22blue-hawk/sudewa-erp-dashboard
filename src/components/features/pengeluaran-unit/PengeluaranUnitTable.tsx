'use client';

import { MoreVertical, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { PengeluaranUnit } from '@/@types/pengeluaran-unit.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaginationMeta } from '@/@types/pagination.types';

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
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
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
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-60 sm:w-64 text-gray-400 focus-within:text-gray-900">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search here" value={search} onChange={(event) => onSearchChange(event.target.value)} className="pl-9 h-10 border-gray-200 rounded-lg text-gray-900" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-10 w-20 border-gray-200 rounded-lg bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Page</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f7fa] text-xs font-medium text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">NO PENGELUARAN</th>
              <th className="px-4 py-3 text-left">TANGGAL</th>
              <th className="px-4 py-3 text-left">CUSTOMER</th>
              <th className="px-4 py-3 text-left">WAREHOUSE</th>
              <th className="px-4 py-3 text-left">KETERANGAN</th>
              <th className="px-4 py-3 text-center w-15">ACTION</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-600">
                  <div className="space-y-2">
                    <p>{errorMessage ?? 'Gagal memuat data pengeluaran unit'}</p>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Coba Lagi
                    </Button>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-gray-900 font-medium">{item.activityNumber}</td>
                  <td className="px-4 py-4 text-gray-600">{formatDate(item.activityDate)}</td>
                  <td className="px-4 py-4 text-gray-600">{item.person?.name ?? '-'}</td>
                  <td className="px-4 py-4 text-gray-600">{item.warehouse?.name ?? '-'}</td>
                  <td className="px-4 py-4 text-gray-600">{item.description || '-'}</td>
                  <td className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="p-1 outline-none text-gray-400 hover:text-gray-700 transition" aria-label="Aksi data pengeluaran unit">
                          <MoreVertical size={18} className="mx-auto" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-lg shadow-lg border-gray-100 p-1 font-medium text-[13px]">
                        <DropdownMenuItem onClick={() => navigateToDetail(item.id)} className="cursor-pointer text-gray-700 hover:bg-gray-50 rounded-md py-2.5 px-3">
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateToEdit(item.id)} className="cursor-pointer text-gray-700 hover:bg-gray-50 rounded-md py-2.5 px-3">
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mt-4 px-1">
        <div>
          Showing {startIndex === 0 && endIndex === 0 ? '0' : `${startIndex}-${endIndex}`} of {meta.total} data
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-gray-600 font-medium hover:bg-transparent hover:text-gray-900 px-3 disabled:opacity-50" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          {getPageNumbers().map((pageNumber, index) => (
            <Button
              key={`${String(pageNumber)}-${index}`}
              variant={pageNumber === page ? 'outline' : 'ghost'}
              size="sm"
              className={`w-9 h-9 p-0 rounded-lg border-gray-200 font-medium ${pageNumber === page ? 'text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'}`}
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
            className="text-gray-600 font-medium hover:bg-transparent hover:text-gray-900 px-3 disabled:opacity-50"
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
