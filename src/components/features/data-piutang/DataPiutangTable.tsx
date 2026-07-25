import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {  MoreVertical, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import type { LiabilityListItem, LiabilityListMeta } from '@/types/pembayaran-hutang.types';
import { LoadingState } from '@/components/ui/loading-state';

interface Props {
  data: LiabilityListItem[];
  meta: LiabilityListMeta | null;
  loading?: boolean;
  error?: string | null;
  search: string;
  perPage: number;
  currentPage: number;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onRetry?: () => void;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function DataPiutangTable({ data, meta, loading, error, search, perPage, currentPage, onSearchChange, onPerPageChange, onPageChange, onRetry }: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      let aVal = (a as any)[sortBy];
      let bVal = (b as any)[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortDirection]);

  const totalPages = meta?.lastPage ?? 1;
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const startIndex = meta?.from ?? (data.length > 0 ? (currentPage - 1) * perPage + 1 : 0);
  const endIndex = meta?.to ?? (data.length > 0 ? startIndex + data.length - 1 : 0);
  const totalItems = meta?.total ?? 0;

  const renderSortHeader = (title: string, sortKey: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isSorted = sortBy === sortKey;
    const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
    return (
      <button
        type="button"
        className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase ${isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'} ${justifyClass}`}
        onClick={() => handleSort(sortKey)}
      >
        <span>{title}</span>
        {isSorted ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
          ) : (
            <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0 text-slate-400" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search here"
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <Select
              value={String(perPage)}
              onValueChange={(val) => {
                onPerPageChange(Number(val));
              }}
            >
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

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Coba Lagi
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-md border border-slate-200 overflow-x-auto shadow-none">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">NO</th>
              <th className="p-0 text-left">{renderSortHeader('NO PENJUALAN', 'code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TANGGAL', 'date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('NAMA CUSTOMER', 'supplier_name', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TOTAL JUAL', 'grand_total', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('TOTAL BAYAR', 'total_paid', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('AMOUNT PIUTANG', 'remaining_payment', 'center')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  <LoadingState variant="section" text="Memuat data..." />
                </td>
              </tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((item, i) => (
                <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                  <td className="px-4 py-4 text-center text-sm text-slate-500">{startIndex + i}</td>
                  <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code}</td>
                  <td className="px-4 py-4 text-center text-sm text-slate-500">{formatDate(item.date)}</td>
                  <td className="px-4 py-4 text-left text-sm text-slate-700">{item.supplier_name}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{currenciesFormat('idr', item.grand_total)}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-emerald-600">{currenciesFormat('idr', item.total_paid)}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-orange-600">{currenciesFormat('idr', item.remaining_payment)}</td>
                  <td className="px-4 py-4 text-center sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
                        <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2.5">
                          {slug ? <Link href={`/dashboard/${slug}/finance/data-piutang/${item.id}`}>Detail</Link> : <span className="text-slate-400 cursor-not-allowed">Detail</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={100} className="px-4 py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {totalItems > 0 ? startIndex : 0}-{endIndex} of {totalItems} data
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
            Previous
          </Button>

          {pages.map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? 'outline' : 'ghost'}
              size="sm"
              className={page === currentPage ? 'bg-gray-100' : ''}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number'}
            >
              {page}
            </Button>
          ))}

          <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => onPageChange(currentPage + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}