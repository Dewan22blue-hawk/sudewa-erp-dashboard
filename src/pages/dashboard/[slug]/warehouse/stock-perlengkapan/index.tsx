import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompany } from '@/contexts/CompanyContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { useGoodsTransactionStockMaterial } from '@/hooks/warehouse/useGoodsTransactionStockMaterial';
import { getVisiblePageNumbers } from '@/lib/api/pagination';

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
      <div className="flex flex-wrap items-center justify-end gap-2 text-[15px] text-slate-800">
        <Button variant="ghost" className="h-10 rounded-xl px-3" disabled={page <= 1 || stockQuery.isLoading} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? 'outline' : 'ghost'}
            className={pageNumber === page ? 'h-10 min-w-10 rounded-xl border-slate-200 bg-white shadow-none' : 'h-10 min-w-10 rounded-xl'}
            disabled={stockQuery.isLoading}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        {showLastPage ? <span className="px-1 text-slate-500">...</span> : null}
        {showLastPage ? (
          <Button variant="ghost" className="h-10 min-w-10 rounded-xl" disabled={stockQuery.isLoading} onClick={() => setPage(totalPages)}>
            {totalPages}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          className="h-10 rounded-xl px-3"
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
      <div className="space-y-6 px-1">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">Data Stock Material</h1>
          <p className="mt-1 text-[18px] text-slate-500">Kelola dan lacak semua stock material</p>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-[296px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search here"
                className="h-[42px] rounded-xl border-slate-200 pl-10 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 text-[16px] text-slate-800">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
                <SelectTrigger className="h-[42px] w-[58px] rounded-xl border-slate-200 shadow-none">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <span className="text-[16px] font-medium text-slate-950">Status Perlengkapan:</span>
            <div className="inline-flex w-fit items-center rounded-2xl bg-[#f3f3f3] p-1">
              {tabOptions.map((tab) => {
                const isActive = tab.value === activeTab;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleTabChange(tab.value)}
                    className={isActive ? 'rounded-xl bg-white px-4 py-2 text-[16px] font-medium text-slate-950 shadow-sm' : 'rounded-xl px-4 py-2 text-[16px] text-slate-700'}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-none">
          <div className="overflow-x-auto">
            <Table className={activeTab === 'keluar' ? 'min-w-[860px]' : 'min-w-[720px]'}>
              <TableHeader className="bg-slate-100/90">
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[56px] px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">NO</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE MATERIAL</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NAMA BARANG</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">QTY</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">SATUAN</TableHead>
                  {activeTab === 'keluar' ? <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">CUSTOMER</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockQuery.isLoading || isCompanyLoading ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === 'keluar' ? 6 : 5} className="h-28 px-5 text-center text-[15px] text-slate-500">
                      Memuat data stock material...
                    </TableCell>
                  </TableRow>
                ) : stockQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === 'keluar' ? 6 : 5} className="h-28 px-5 text-center">
                      <div className="space-y-3">
                        <p className="text-[15px] text-red-500">Gagal memuat data stock material.</p>
                        <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => stockQuery.refetch()}>
                          Coba Lagi
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === 'keluar' ? 6 : 5} className="h-28 px-5 text-center text-[15px] text-slate-500">
                      Belum ada data stock material.
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((item, index) => (
                    <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/60">
                      <TableCell className="px-5 py-3 text-center text-[14px] text-slate-800">{startData + index}</TableCell>
                      <TableCell className="px-5 py-3 text-[14px] text-slate-800">{item.code || '-'}</TableCell>
                      <TableCell className="px-5 py-3 text-[14px] text-slate-800">{item.name || '-'}</TableCell>
                      <TableCell className="px-5 py-3 text-[14px] text-slate-800">{activeTab === 'diterima' ? item.stockIn : item.stockOut}</TableCell>
                      <TableCell className="px-5 py-3 text-[14px] text-slate-800">{formatUnitLabel(item.type)}</TableCell>
                      {activeTab === 'keluar' ? <TableCell className="px-5 py-3 text-[14px] text-slate-800">{item.customerName || '-'}</TableCell> : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[14px] text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
          {renderPagination()}
        </div>
      </div>
    </DashboardLayout>
  );
}
