import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/contexts/CompanyContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { useMaintenance } from '@/hooks/warehouse/useMaintenance';
import { MaintenanceTable } from '@/components/features/warehouse/maintenance/MaintenanceTable';
import { MaintenanceDetailModal } from '@/components/features/warehouse/maintenance/MaintenanceDetailModal';
import type { MaintenanceItem } from '@/@types/maintenance.types';

export default function MaintenanceListPage() {
  const { isLoading: isCompanyLoading } = useCompany();

  // PT Wajira Transindo company ID is 4
  const activeCompanyId = 4;

  const { page, perPage, search, setPage, setPerPage, updateQuery } = useQueryParamsTable({ defaultPerPage: 25 });
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // Sync search input when search query param changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL params when debounced search input changes
  useEffect(() => {
    if (!isCompanyLoading && debouncedSearch !== search) {
      updateQuery({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, isCompanyLoading, search, updateQuery]);

  const maintenanceQuery = useMaintenance(
    {
      company_id: activeCompanyId,
      search: search || undefined,
      page,
      per_page: perPage,
    },
    {
      enabled: !isCompanyLoading,
    }
  );

  // Modal State
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const transactions = maintenanceQuery.data?.data ?? [];
  const meta = maintenanceQuery.data?.meta;
  const totalData = meta?.total ?? 0;
  const totalPages = meta?.lastPage ?? 1;
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);

  const handleViewDetail = (item: MaintenanceItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const renderPagination = () => {
    const showLastPage = totalPages > 5 && !pageNumbers.includes(totalPages);

    return (
      <div className="flex flex-wrap items-center justify-end gap-2 text-[15px] text-slate-800">
        <Button
          variant="ghost"
          className="h-10 rounded-xl px-3"
          disabled={page <= 1 || maintenanceQuery.isLoading}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? 'outline' : 'ghost'}
            className={
              pageNumber === page
                ? 'h-10 min-w-10 rounded-xl border-slate-200 bg-white shadow-none font-semibold'
                : 'h-10 min-w-10 rounded-xl'
            }
            disabled={maintenanceQuery.isLoading}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        {showLastPage ? <span className="px-1 text-slate-500">...</span> : null}
        {showLastPage ? (
          <Button
            variant="ghost"
            className="h-10 min-w-10 rounded-xl"
            disabled={maintenanceQuery.isLoading}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          className="h-10 rounded-xl px-3"
          disabled={page >= totalPages || totalData === 0 || maintenanceQuery.isLoading}
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
        <title>Maintenance - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">Data Maintenance</h1>
          <p className="mt-1 text-[16px] text-slate-500">Kelola dan lacak semua armada yang membutuhkan maintenance</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-[296px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search here"
              className="h-[42px] rounded-xl border-slate-200 pl-10 shadow-none bg-white"
            />
          </div>

          <div className="flex items-center gap-3 text-[16px] text-slate-800">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
              <SelectTrigger className="h-[42px] w-[58px] rounded-xl border-slate-200 shadow-none bg-white">
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

        {/* Table Card */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-none">
          <div className="overflow-x-auto">
            <MaintenanceTable
              data={transactions}
              isLoading={maintenanceQuery.isLoading}
              onViewDetail={handleViewDetail}
              startIndex={startData}
            />
          </div>
        </Card>

        {/* Pagination Info & Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[14px] text-slate-500">
            Showing {startData}-{endData} of {totalData} data
          </p>
          {renderPagination()}
        </div>
      </div>

      {/* Detail Modal */}
      <MaintenanceDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        data={selectedItem}
      />
    </DashboardLayout>
  );
}
