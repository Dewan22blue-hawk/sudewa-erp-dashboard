import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import type { DoInvoice } from '@/@types/create-invoice.types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FinanceInvoiceTable from '@/components/features/finance/invoice/FinanceInvoiceTable';
import FinanceInvoicePaymentModal from '@/components/features/finance/invoice/FinanceInvoicePaymentModal';
import { useCompany } from '@/contexts/CompanyContext';
import { useDoInvoices } from '@/hooks/useDoInvoice';

export default function FinanceInvoicePage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const companyNumber = Number(companyId || 0);

  const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('created_at');
  const [orderSort, setOrderSort] = useState<'asc' | 'desc'>('desc');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DoInvoice | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch } = useDoInvoices({
    page,
    perPage: perPage,
    search: searchValue,
    order_by: orderBy,
    order_sort: orderSort,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const handleSortChange = (key: string) => {
    if (orderBy === key) {
      setOrderSort(orderSort === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(key);
      setOrderSort('desc');
    }
    setPage(1);
  };

  const handlePay = (item: DoInvoice) => {
    setSelectedItem(item);
    setIsPaymentModalOpen(true);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Invoice Terbuat - PT Wajira Transindo</title>
      </Head>

      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoice Terbuat</h1>
          <p className="text-sm text-slate-500">Kelola invoice ekspedisi dengan mudah</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search here"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white pl-9 border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Show</span>
              <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[80px] bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-500">Page</span>
            </div>
          </div>
          {/* Export button placeholder matching existing UI patterns */}
          <button type="button" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
            Export
          </button>
        </div>

        <FinanceInvoiceTable
          data={data?.data ?? []}
          meta={data?.meta ?? null}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error ? 'Terjadi kesalahan saat memuat data.' : undefined}
          onRetry={() => refetch()}
          onPay={handlePay}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          currentSortBy={orderBy}
          currentSortDirection={orderSort}
        />

        <FinanceInvoicePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          item={selectedItem}
          companyId={companyNumber}
        />
      </div>
    </DashboardLayout>
  );
}
