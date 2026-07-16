import { useState } from 'react';
import type { DoInvoice, DoInvoiceListResponse } from '@/@types/create-invoice.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, Search } from 'lucide-react';
import { useOrderListDetail } from '@/hooks/useOrderList';

interface Props {
  data: DoInvoice[];
  meta: DoInvoiceListResponse['meta'] | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onPay: (item: DoInvoice) => void;
  onPageChange: (page: number) => void;
  onSortChange: (key: string) => void;
  currentSortBy?: string;
  currentSortDirection?: 'asc' | 'desc';
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd MMM yyyy');
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-200">
    {Array.from({ length: 13 }).map((_, index) => (
      <td key={index} className="px-6 py-5">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

interface TableRowProps {
  item: DoInvoice;
  noUrut: number;
  kasMasuk: number | null;
  onPay: (item: DoInvoice) => void;
}

const FinanceInvoiceTableRow = ({ item, noUrut, kasMasuk, onPay }: TableRowProps) => {
  const { data: orderListDetail, isLoading: isLoadingDetail } = useOrderListDetail(item.orderList?.id ?? null);
  
  const firstExp = item.expeditions?.[0];
  const orderList = item.orderList ?? firstExp?.orderList;
  
  // Fallbacks from nested structures and order_list detail
  const vehicleReg = firstExp?.vehicle?.registrationNumber ?? item.vehicle?.registrationNumber ?? orderListDetail?.vehicles?.[0]?.registrationNumber ?? '-';
  const vehicleType = firstExp?.vehicle?.type ?? item.vehicle?.type ?? orderList?.vehicleType ?? orderListDetail?.vehicleType ?? '-';
  const driverName = firstExp?.driver?.name ?? item.driver?.name ?? '-'; // Driver is usually not in order_list but from expedition
  const loadingIn = firstExp?.tarif?.loadingIn ?? orderList?.loadingIn ?? orderListDetail?.loadingIn ?? '-';
  const destination = orderList?.doDeliveryDestination ?? firstExp?.destination ?? orderListDetail?.tarifs?.[0]?.deliveryDestination ?? '-';
  const loadingOut = firstExp?.tarif?.loadingOut ?? orderList?.loadingOut ?? orderListDetail?.loadingOut ?? '-';
  
  // Calculations
  const invoiceEkspedisi = firstExp?.invoiceExpedition ?? orderList?.billInvoice ?? orderListDetail?.billInvoice ?? 0;
  const additionalFee = (item.additional_fee ?? 0) + (item.other_fee ?? 0);

  return (
    <tr className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
      <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{noUrut}</td>
      <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code || '-'}</td>
      <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.date)}</td>
      <td className="px-4 py-4 text-left text-sm text-slate-700">
        {isLoadingDetail ? <Skeleton className="h-4 w-20" /> : vehicleReg}
      </td>
      <td className="px-4 py-4 text-left text-sm text-slate-700">
        {isLoadingDetail ? <Skeleton className="h-4 w-16" /> : vehicleType}
      </td>
      <td className="px-4 py-4 text-left text-sm text-slate-700">{driverName}</td>
      <td className="px-4 py-4 text-left text-sm text-slate-700">
        {isLoadingDetail ? <Skeleton className="h-4 w-20" /> : loadingIn}
      </td>
      <td className="px-4 py-4 text-left text-sm text-slate-700">
        {isLoadingDetail ? <Skeleton className="h-4 w-24" /> : destination}
      </td>
      <td className="px-4 py-4 text-left text-sm text-slate-700">
        {isLoadingDetail ? <Skeleton className="h-4 w-20" /> : loadingOut}
      </td>
      <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
        {isLoadingDetail ? <Skeleton className="h-4 w-24 ml-auto" /> : formatCurrency(invoiceEkspedisi)}
      </td>
      <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
        {formatCurrency(additionalFee)}
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
};

export default function FinanceInvoiceTable({
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

  const getKasMasukAmount = (item: DoInvoice) => {
    const payment = item.finance_billing_payment;
    if (!payment) return null;
    return payment.amount ?? payment.total_paid ?? null;
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1600px] text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">NO</th>
              <th className="p-0 text-left">{renderSortHeader('NO SURAT INVOICE', 'code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TANGGAL', 'date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('NO POLISI', 'vehicle_registration_number', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TIPE', 'vehicle_type', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('DRIVER', 'driver_name', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('LOADING IN', 'loading_in', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('TUJUAN', 'do_delivery_destination', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('LOADING OUT', 'loading_out', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('INVOICE EKSPEDISI', 'invoice_amount', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('BIAYA TAMBAHAN', 'additional_fee', 'right')}</th>
              <th className="p-0 text-left">{renderSortHeader('KAS MASUK', 'amount', 'right')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">ACTION</th>
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
                <td colSpan={13} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{errorMessage ?? 'Gagal memuat data invoice'}</p>
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
                
                return (
                  <FinanceInvoiceTableRow 
                    key={item.id} 
                    item={item} 
                    noUrut={noUrut} 
                    kasMasuk={kasMasuk} 
                    onPay={onPay} 
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between py-2">
        <p>Showing {startIndex}-{endIndex} of {total} data</p>
        <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          {pageNumbers.map((pageNumber, index) =>
            typeof pageNumber === 'number' ? (
              <Button
                key={`${pageNumber}-${index}`}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                  pageNumber === page
                    ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                    : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white'
                )}
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
