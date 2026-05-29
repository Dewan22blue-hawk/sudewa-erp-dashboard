import type { KasHarianListItem } from '@/@types/kas-harian.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ArrowUpDown, MoreVertical } from 'lucide-react';

interface Props {
  data: KasHarianListItem[];
  meta: PaginationMeta;
  hasNextPage: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onView: (item: KasHarianListItem) => void;
  onPay: (item: KasHarianListItem) => void;
  onEdit: (item: KasHarianListItem) => void;
  onDelete: (item: KasHarianListItem) => void;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd/MM/yyyy');
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-200">
    {Array.from({ length: 8 }).map((_, index) => (
      <td key={index} className="px-6 py-5">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default function KasHarianTable({
  data,
  meta,
  hasNextPage,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onRetry,
  onView,
  onPay,
  onEdit,
  onDelete,
  onPageChange,
}: Props) {
  const page = meta.currentPage;
  const hasData = data.length > 0;
  const startIndex = hasData ? (page - 1) * meta.perPage + 1 : 0;
  const endIndex = hasData ? startIndex + data.length - 1 : 0;
  const canGoPrevious = page > 1;
  const canGoNext = hasNextPage || page < meta.lastPage;

  const pageNumbers = (() => {
    if (meta.lastPage <= 5) return Array.from({ length: meta.lastPage }, (_, index) => index + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', meta.lastPage];
    if (page >= meta.lastPage - 2) return [1, '...', meta.lastPage - 3, meta.lastPage - 2, meta.lastPage - 1, meta.lastPage];
    return [1, '...', page - 1, page, page + 1, '...', meta.lastPage];
  })();

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        {isFetching && !isLoading ? (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">Memperbarui data...</div>
        ) : null}

        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-[#f3f6fb] text-[13px] font-semibold uppercase text-slate-800">
            <tr>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  TANGGAL
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </th>
              <th className="px-6 py-4 text-left">NOTA REFF</th>
              <th className="px-6 py-4 text-left">KETERANGAN</th>
              <th className="px-6 py-4 text-left">DEBET</th>
              <th className="px-6 py-4 text-left">KREDIT</th>
              <th className="px-6 py-4 text-left">AKUN</th>
              <th className="px-6 py-4 text-left">KAS</th>
              <th className="px-6 py-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
            ) : isError ? (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center">
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
                <td colSpan={8} className="px-6 py-14 text-center text-slate-500">
                  Belum ada data transaksi kas harian.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={`${item.source}-${item.id}`} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/60">
                  <td className="px-6 py-4 text-slate-700">{formatDate(item.date)}</td>
                  <td className="px-6 py-4 text-slate-800">{item.code}</td>
                  <td className="px-6 py-4 text-slate-700">{item.note || '-'}</td>
                  <td className="px-6 py-4 font-medium text-emerald-500">{formatCurrency(item.debet)}</td>
                  <td className="px-6 py-4 font-medium text-red-500">{formatCurrency(item.credit)}</td>
                  <td className="px-6 py-4 text-slate-700">{item.accountName}</td>
                  <td className="px-6 py-4 text-slate-700">{item.cashName || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[170px] rounded-2xl p-2">
                        {item.source === 'billing' ? (
                          <DropdownMenuItem onClick={() => onPay(item)} className="cursor-pointer rounded-xl px-3 py-2.5">
                            Bayar
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer rounded-xl px-3 py-2.5">
                          Detail
                        </DropdownMenuItem>
                        {item.source === 'manual' ? (
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer rounded-xl px-3 py-2.5">
                            Edit
                          </DropdownMenuItem>
                        ) : null}
                        {item.source === 'manual' ? (
                          <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:text-red-700">
                            Hapus
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {startIndex}-{endIndex} of {meta.total} data
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={!canGoPrevious}>
            Previous
          </Button>
          {pageNumbers.map((pageNumber, index) =>
            typeof pageNumber === 'number' ? (
              <Button
                key={`${pageNumber}-${index}`}
                type="button"
                variant="outline"
                size="sm"
                className={pageNumber === page ? 'border-slate-300 bg-white shadow-sm' : 'border-transparent'}
                onClick={() => onPageChange(pageNumber)}
                disabled={pageNumber === page}
              >
                {pageNumber}
              </Button>
            ) : (
              <span key={`${pageNumber}-${index}`} className="px-2">
                ...
              </span>
            ),
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={!canGoNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
