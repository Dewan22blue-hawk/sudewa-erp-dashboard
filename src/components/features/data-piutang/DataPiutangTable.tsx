import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, Loader2, MoreVertical, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="space-y-4">
      <div className="flex justify-start items-center gap-4">
        <div className="relative w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search here"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <Select
            value={String(perPage)}
            onValueChange={(val) => {
              onPerPageChange(Number(val));
            }}
          >
            <SelectTrigger className="h-9 w-[70px]">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900 leading-normal">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">NO</th>
              <th className="py-2 text-left">NO PENJUALAN</th>
              <th className="py-2 text-left">TANGGAL</th>
              <th className="py-2 text-left">NAMA CUSTOMER</th>
              <th className="py-2 text-right">TOTAL JUAL</th>
              <th className="py-2 text-right">TOTAL BAYAR</th>
              <th className="py-2 text-right">AMOUNT PIUTANG</th>
              <th className="px-4 py-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat data...
                  </span>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{startIndex + i}</td>
                  <td className="px-4 py-3 font-medium">{item.code}</td>
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">{item.supplier_name}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.grand_total)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(item.total_paid)}</td>
                  <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(item.remaining_payment)}</td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          {slug ? <Link href={`/dashboard/${slug}/finance/data-piutang/${item.id}`}>Detail</Link> : <span className="text-gray-400 cursor-not-allowed">Detail</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data yang ditemukan.
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