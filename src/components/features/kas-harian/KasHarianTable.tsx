import type { KasHarian } from '@/@types/kas-harian.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { MoreVertical, ArrowUpDown } from 'lucide-react';

interface Props {
  data: KasHarian[];
  meta: PaginationMeta;
  hasNextPage: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onEdit: (item: KasHarian) => void;
  onDelete: (item: KasHarian) => void;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd MMM yyyy');
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-200">
    {Array.from({ length: 7 }).map((_, index) => (
      <td key={index} className="px-4 py-4">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default function KasHarianTable({ data, meta, hasNextPage, isLoading, isFetching, isError, errorMessage, onRetry, onEdit, onDelete, onPageChange }: Props) {
  const balances = data.reduce<number[]>((accumulator, item, index) => {
    const previousBalance = index === 0 ? 0 : accumulator[index - 1];
    accumulator.push(previousBalance + item.debet - item.credit);
    return accumulator;
  }, []);

  const page = meta.currentPage;
  const hasData = data.length > 0;
  const startIndex = hasData ? (page - 1) * meta.perPage + 1 : 0;
  const endIndex = hasData ? startIndex + data.length - 1 : 0;
  const canGoPrevious = page > 1;
  const canGoNext = hasNextPage || page < meta.lastPage;
  const pageNumbers = Array.from({ length: Math.min(5, meta.lastPage) }, (_, index) => {
    if (meta.lastPage <= 5) return index + 1;
    if (page <= 3) return index + 1;
    if (page >= meta.lastPage - 2) return meta.lastPage - 4 + index;
    return page - 2 + index;
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {isFetching && !isLoading ? (
          <div className="border-b bg-blue-50 px-4 py-2 text-xs text-blue-700">Memperbarui data...</div>
        ) : null}

        <table className="min-w-[1400px] w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase tracking-wide font-medium">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 cursor-pointer">
                  TANGGAL
                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </th>
              <th className="px-4 py-3 text-left">NOTA REFF</th>
              <th className="px-4 py-3 text-left">KETERANGAN</th>
              <th className="px-4 py-3 text-left">DEBET</th>
              <th className="px-4 py-3 text-left">KREDIT</th>
              <th className="px-4 py-3 text-left">AKUN</th>
              <th className="px-4 py-3 text-center w-[80px]">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 7 }).map((_, index) => <SkeletonRow key={index} />)
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{errorMessage ?? 'Gagal memuat data transaksi kas harian'}</p>
                    {onRetry ? (
                      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                        Retry
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Belum ada data transaksi
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="border-b last:border-none hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">{item.code}</td>
                  <td className="px-4 py-3">{item.note}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(item.debet)}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{formatCurrency(item.credit)}</td>
                  <td className="px-4 py-3">{item.account?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-700">
                          Hapus
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

      <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <div>Showing {startIndex}-{endIndex} of {meta.total} data</div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={!canGoPrevious}>
            First
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={!canGoPrevious}>
            Previous
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button key={pageNumber} type="button" variant="outline" size="sm" className={pageNumber === page ? 'bg-gray-100' : ''} onClick={() => onPageChange(pageNumber)} disabled={pageNumber === page}>
              {pageNumber}
            </Button>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={!canGoNext}>
            Next
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(meta.lastPage)} disabled={!canGoNext}>
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
