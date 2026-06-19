import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Search, Plus, Download } from 'lucide-react';
import type { WithholdingTaxItem } from '@/@types/withholding-tax.types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import WithholdingTaxTable from '@/components/features/finance/withholding-tax/WithholdingTaxTable';
import WithholdingTaxFormModal from '@/components/features/finance/withholding-tax/WithholdingTaxFormModal';
import WithholdingTaxDetailModal from '@/components/features/finance/withholding-tax/WithholdingTaxDetailModal';
import WithholdingTaxDeleteDialog from '@/components/features/finance/withholding-tax/WithholdingTaxDeleteDialog';
import { useCompany } from '@/contexts/CompanyContext';
import { useWithholdingTaxes } from '@/hooks/useWithholdingTax';

export default function BuktiPotongPage() {
  const { companyId } = useCompany();
  // Ensure we use the active companyId. The prompt mentions companyId 4 for Transindo.
  const companyNumber = Number(companyId || 4);

  const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('created_at');
  const [orderSort, setOrderSort] = useState<'asc' | 'desc'>('desc');
  const [sourceFilter, setSourceFilter] = useState<'internal' | 'client_supplier'>('internal');
  // the api uses 'internal' filter by default based on the prompt "source=internal" but the UI shows all or lets user tab? 
  // We'll fetch all by default or pass 'internal' if we strictly want only internal, but let's fetch without strict source unless required. 
  // Actually, the prompt says "Tampilkan semua data Bukti Potong... source=internal". I will add a filter state if needed, or just let backend handle it if omitted.
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WithholdingTaxItem | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch } = useWithholdingTaxes({
    source: sourceFilter,
    company_id: companyNumber,
    page,
    perPage: perPage,
    ...(searchValue ? { withholding_number: searchValue } : {}),
    order_by: orderBy,
    order_dir: orderSort,
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

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: WithholdingTaxItem) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleView = (item: WithholdingTaxItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (item: WithholdingTaxItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Laporan Bukti Potong - PT Wajira Transindo</title>
      </Head>

      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Bukti Potong</h1>
          <p className="text-sm text-slate-500">Kelola bukti potong dengan mudah</p>
        </div>

        {/* Tabs for Source Filter */}
        <div className="flex space-x-1 border-b border-slate-200">
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              sourceFilter === 'internal'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => { setSourceFilter('internal'); setPage(1); }}
          >
            Internal
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              sourceFilter === 'client_supplier'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => { setSourceFilter('client_supplier'); setPage(1); }}
          >
            Client / Supplier
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
            
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search here"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white pl-9 border-slate-200"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-700 bg-white">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </div>

        <WithholdingTaxTable
          data={data?.data ?? []}
          meta={data?.meta ?? null}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error ? 'Terjadi kesalahan saat memuat data.' : undefined}
          onRetry={() => refetch()}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          currentSortBy={orderBy}
          currentSortDirection={orderSort}
        />

        <WithholdingTaxFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          companyId={companyNumber}
        />

        <WithholdingTaxDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedItem(null);
          }}
          itemId={selectedItem?.id ?? null}
        />

        <WithholdingTaxDeleteDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          itemId={selectedItem?.id ?? null}
          withholdingNumber={selectedItem?.withholding_number ?? null}
        />
      </div>
    </DashboardLayout>
  );
}
