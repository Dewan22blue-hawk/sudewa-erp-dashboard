import type { WithholdingTaxItem, WithholdingTaxListResponse } from '@/@types/withholding-tax.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

interface Props {
  data: WithholdingTaxItem[];
  meta: WithholdingTaxListResponse['meta'] | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onView: (item: WithholdingTaxItem) => void;
  onEdit: (item: WithholdingTaxItem) => void;
  onDelete: (item: WithholdingTaxItem) => void;
  onPageChange: (page: number) => void;
  onSortChange: (key: string) => void;
  currentSortBy?: string;
  currentSortDirection?: 'asc' | 'desc';
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd/MM/yyyy');
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-200">
    {Array.from({ length: 12 }).map((_, index) => (
      <td key={index} className="px-6 py-5">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default function WithholdingTaxTable({
  data,
  meta,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onSortChange,
  currentSortBy,
  currentSortDirection,
}: Props) {
  const page = meta?.currentPage ?? 1;
  const hasData = data.length > 0;
  const perPage = meta?.perPage ?? 10;
  const startIndex = hasData ? (page - 1) * perPage + 1 : 0;
  const endIndex = hasData ? startIndex + data.length - 1 : 0;
  const total = meta?.total ?? 0;
  const lastPage = meta?.lastPage ?? 1;

  const canGoPrevious = page > 1;
  const canGoNext = page < lastPage;

  const pageNumbers = (() => {
    if (lastPage <= 5) return Array.from({ length: lastPage }, (_, index) => index + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', lastPage];
    if (page >= lastPage - 2) return [1, '...', lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, '...', page - 1, page, page + 1, '...', lastPage];
  })();

  const renderSortHeader = (title: string, sortKey: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isSorted = currentSortBy === sortKey;
    const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
    
    return (
      <button
        type="button"
        className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase ${isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'} ${justifyClass}`}
        onClick={() => onSortChange(sortKey)}
      >
        <span>{title}</span>
        {isSorted ? (
          currentSortDirection === 'asc' ? (
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
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1500px] text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-16">NO</th>
              <th className="p-0 text-left">{renderSortHeader('TGL INVOICE', 'do_invoice.date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('NO INVOICE', 'do_invoice.code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('NAMA CUSTOMER', 'customer.name', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('NO BUKPOT', 'withholding_number', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('MASA BUKPOT', 'withholding_age', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('NOMINAL INVOICE', 'do_invoice.total_amount', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('PPH', 'pph_amount', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('UANG MUKA PPH', 'pph_description', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('JUMLAH PEMBAYARAN', 'payment_amount', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('TGL DIBAYAR', 'payment_date', 'center')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
            ) : isError ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{errorMessage ?? 'Gagal memuat data bukti potong'}</p>
                    {onRetry ? (
                      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                        Retry
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : !hasData ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-slate-500">
                  Belum ada data bukti potong.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const noUrut = startIndex + index;
                const customerName = item.do_invoice?.customer?.name ?? '-';
                const nominalInvoice = item.do_invoice?.total_amount ?? item.do_invoice?.invoice_amount ?? item.do_invoice?.bill_invoice ?? 0;
                
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                    <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{noUrut}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.do_invoice?.date)}</td>
                    <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.do_invoice?.code || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{customerName}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.withholding_number || '-'}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{item.withholding_age || '-'}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                      {formatCurrency(nominalInvoice)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                      {formatCurrency(item.pph_amount || 0)}
                    </td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">
                      {item.pph_description || '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-emerald-600">
                      {formatCurrency(item.payment_amount || 0)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.payment_date)}</td>
                    <td className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {startIndex}-{endIndex} of {total} data
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
