import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompany } from '@/contexts/CompanyContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { useGoodsTransactionStockMaterial } from '@/hooks/warehouse/useGoodsTransactionStockMaterial';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';

type StockTab = 'diterima' | 'keluar';

const DEFAULT_COMPANY_ID = 3;

const tabOptions: Array<{ label: string; value: StockTab }> = [
  { label: 'Diterima', value: 'diterima' },
  { label: 'Keluar', value: 'keluar' },
];

const formatUnitLabel = (value?: string) => {
  if (!value) return '-';
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export default function StockPerlengkapanPage() {
  const { companyId, isLoading: isCompanyLoading } = useCompany();
  const { page, perPage, search, setPage, setPerPage, getParam, updateQuery } = useQueryParamsTable({ defaultPerPage: 25 });

  const activeTab = getParam('tab', 'diterima') === 'keluar' ? 'keluar' : 'diterima';
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!isCompanyLoading && debouncedSearch !== search) {
      updateQuery({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, isCompanyLoading, search, updateQuery]);

  const activeCompanyId = useMemo(() => {
    const numericCompanyId = Number(companyId);
    return Number.isFinite(numericCompanyId) && numericCompanyId > 0 ? numericCompanyId : DEFAULT_COMPANY_ID;
  }, [companyId]);

  const stockQuery = useGoodsTransactionStockMaterial(
    {
      company_id: activeCompanyId,
      in_stock: activeTab === 'diterima',
      search: search || undefined,
      page,
      per_page: perPage,
    },
    {
      enabled: !isCompanyLoading,
    },
  );

  const materials = stockQuery.data?.data ?? [];
  const meta = stockQuery.data?.meta;
  const totalData = meta?.total ?? 0;
  const totalPages = meta?.lastPage ?? 1;
  const startData = meta?.from ?? (totalData === 0 ? 0 : (page - 1) * perPage + 1);
  const endData = meta?.to ?? Math.min(page * perPage, totalData);
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);

  const handleTabChange = (nextTab: StockTab) => {
    updateQuery({ tab: nextTab, page: 1 });
  };

  const renderPagination = () => {
    const showLastPage = totalPages > 5 && !pageNumbers.includes(totalPages);

    return (
      <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
          disabled={page <= 1 || stockQuery.isLoading}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
              pageNumber === page
                ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
            )}
            disabled={stockQuery.isLoading}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        {showLastPage && <span className="px-1 text-slate-500">...</span>}
        {showLastPage && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 min-w-9 rounded-xl border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
            disabled={stockQuery.isLoading}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
          disabled={page >= totalPages || totalData === 0 || stockQuery.isLoading}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Stock Material - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Data Stock Material</h1>
          <p className="text-sm text-muted-foreground">Kelola dan lacak semua stock material</p>
        </div>

        <div className="space-y-4">
          {/* Filters, Search, and Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search here"
                  className="pl-9 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                <span>Show</span>
                <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <span className="text-sm font-medium text-slate-900">Status Perlengkapan:</span>
              <div className="inline-flex w-fit items-center rounded-2xl bg-[#f3f3f3] p-1">
                {tabOptions.map((tab) => {
                  const isActive = tab.value === activeTab;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => handleTabChange(tab.value)}
                      className={isActive ? 'rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm' : 'rounded-xl px-4 py-2 text-sm text-slate-700'}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <Table className={activeTab === 'keluar' ? 'min-w-[860px]' : 'min-w-[720px]'}>
                <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="w-[60px] px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                    <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE MATERIAL</TableHead>
                    <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NAMA BARANG</TableHead>
                    <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">QTY</TableHead>
                    <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">SATUAN</TableHead>
                    {activeTab === 'keluar' ? <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">CUSTOMER</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockQuery.isLoading || isCompanyLoading ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === 'keluar' ? 6 : 5} className="h-28 px-4 py-4 text-center text-sm text-slate-500">
                        Memuat data stock material...
                      </TableCell>
                    </TableRow>
                  ) : stockQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === 'keluar' ? 6 : 5} className="h-28 px-4 py-4 text-center">
                        <div className="space-y-3">
                          <p className="text-sm text-red-500">Gagal memuat data stock material.</p>
                          <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => stockQuery.refetch()}>
                            Coba Lagi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === 'keluar' ? 6 : 5} className="h-28 px-4 py-4 text-center text-sm text-slate-500">
                        Belum ada data stock material.
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((item, index) => (
                      <TableRow key={item.id} className="border-slate-200 hover:bg-gray-50 transition-colors">
                        <TableCell className="px-4 py-4 text-left text-sm text-slate-500">{startData + index}</TableCell>
                        <TableCell className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code || '-'}</TableCell>
                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700">{item.name || '-'}</TableCell>
                        <TableCell className="px-4 py-4 text-center text-sm text-slate-700">{activeTab === 'diterima' ? item.stockIn : item.stockOut}</TableCell>
                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700">{formatUnitLabel(item.type)}</TableCell>
                        {activeTab === 'keluar' ? <TableCell className="px-4 py-4 text-left text-sm text-slate-700">{item.customerName || '-'}</TableCell> : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer Info & Pagination */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
            {renderPagination()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
