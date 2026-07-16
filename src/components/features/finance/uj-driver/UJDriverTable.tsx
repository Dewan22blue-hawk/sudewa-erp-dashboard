import { useState } from 'react';
import type { UJDriverItem, UJDriverPaginationResponse } from '@/@types/uj-driver.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, Search } from 'lucide-react';

interface Props {
  data: UJDriverItem[];
  meta: UJDriverPaginationResponse<UJDriverItem>['data'] | null;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onPay: (item: UJDriverItem) => void;
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
    {Array.from({ length: 14 }).map((_, index) => (
      <td key={index} className="px-6 py-5">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default function UJDriverTable({
  data,
  meta,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onPay,
  onPageChange,
  onSortChange,
  currentSortBy,
  currentSortDirection,
}: Props) {
  const page = meta?.current_page ?? 1;
  const hasData = data.length > 0;
  const startIndex = meta?.from ?? 0;
  const endIndex = meta?.to ?? 0;
  const total = meta?.total ?? 0;
  const lastPage = meta?.last_page ?? 1;

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

  const getKasMasukAmount = (item: UJDriverItem) => {
    const payment = item.uj_driver_billing_payment;
    if (!payment) return null;
    return payment.amount ?? payment.total_paid ?? null;
  };

  const getUJLainnyaAmount = (item: UJDriverItem) => {
    const payment = item.uj_driver_billing_payment;
    if (!payment) return null;
    return payment.other_amount ?? payment.uj_lainnya ?? null;
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1600px] text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">NO</th>
              <th className="p-0 text-left">{renderSortHeader('KODE DO', 'code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TANGGAL', 'date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('NO POLISI', 'vehicle_registration_number', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TIPE', 'vehicle_type', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('DRIVER', 'driver_name', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('CUSTOMER', 'customer_name', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('LOADING IN', 'loading_in', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TUJUAN', 'do_delivery_destination', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('LOADING OUT', 'loading_out', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('UJ DRIVER', 'uj_driver', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('UJ LAINNYA', 'other_amount', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('KAS MASUK', 'amount', 'right')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={100} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium text-slate-500">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={14} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{errorMessage ?? 'Gagal memuat data'}</p>
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
                <td colSpan={100} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const noUrut = startIndex + index;
                const kasMasuk = getKasMasukAmount(item);
                const ujLainnya = getUJLainnyaAmount(item);
                const ujDriver = item.order_list?.uj_driver;

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                    <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{noUrut}</td>
                    <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code || '-'}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.date)}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.vehicle?.registration_number || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.vehicle?.type || item.order_list?.vehicle_type || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.driver?.name || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.order_list?.customer?.name || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.order_list?.loading_in || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.order_list?.do_delivery_destination || '-'}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.order_list?.loading_out || '-'}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                      {ujDriver != null ? formatCurrency(ujDriver) : '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                      {ujLainnya != null ? formatCurrency(ujLainnya) : '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-emerald-600">
                      {kasMasuk != null ? formatCurrency(kasMasuk) : <span className="text-slate-500 font-normal">Belum Bayar</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {kasMasuk != null ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium">
                          Lunas
                        </Badge>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={() => onPay(item)}>
                          Bayar
                        </Button>
                      )}
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
