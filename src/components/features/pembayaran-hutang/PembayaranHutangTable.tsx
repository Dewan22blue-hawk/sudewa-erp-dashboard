import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical, Search, Loader2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/currency';
import type { LiabilityListItem, LiabilityListMeta } from '@/types/pembayaran-hutang.types';

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
  onDelete?: (item: LiabilityListItem) => void;
  onRetry?: () => void;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function PembayaranHutangTable({ data, meta, loading, error, search, perPage, currentPage, onSearchChange, onPerPageChange, onPageChange, onDelete, onRetry }: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const showActions = typeof onDelete === 'function';

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
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari kode transaksi atau supplier"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 md:shrink-0">
          <span>Show</span>
          <Select
            value={String(perPage)}
            onValueChange={(val) => {
              onPerPageChange(Number(val));
            }}
          >
            <SelectTrigger className="h-9 w-20">
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

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">No</th>
              <th className="p-0 text-left">{renderSortHeader('No. Transaksi', 'code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('Tanggal', 'date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('Supplier', 'supplier_name', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('Total Hutang', 'grand_total', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('Total Dibayar', 'total_paid', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('Sisa Hutang', 'remaining_payment', 'center')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
              {showActions ? <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">Aksi</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 9 : 8} className="px-4 py-12 text-center text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat data...
                  </span>
                </td>
              </tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((item, index) => {
                const percentage = Math.max(0, Math.min(100, item.paid_percentage));

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                    <td className="px-4 py-4 text-center text-sm text-slate-500">{startIndex + index}</td>
                    <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">{formatDate(item.date)}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.supplier_name}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.grand_total)}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-emerald-600">{formatCurrency(item.total_paid)}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-rose-600">{formatCurrency(item.remaining_payment)}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{percentage.toFixed(0)}% terbayar</span>
                          <span>{item.remaining_payment <= 0 ? 'Lunas' : 'Belum lunas'}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </td>
                    {showActions ? (
                      <td className="px-4 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5">
                              {slug ? <Link href={`/dashboard/${slug}/finance/data-pembayaran-hutang/${item.id}`}>Detail</Link> : <span className="cursor-not-allowed text-slate-400">Detail</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDelete?.(item)} className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:text-red-700">
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showActions ? 9 : 8} className="px-4 py-12 text-center text-gray-500">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <div>
          Menampilkan {totalItems > 0 ? startIndex : 0}-{endIndex} dari {totalItems} data
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
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

          <Button variant="outline" size="sm" disabled={currentPage >= totalPages || totalPages === 0} onClick={() => onPageChange(currentPage + 1)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
