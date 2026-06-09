import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, RotateCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { KasHarian, KasHarianListItem } from '@/@types/kas-harian.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddKasHarianDialog from '@/components/features/kas-harian/AddKasHarianDialog';
import DeleteKasHarianDialog from '@/components/features/kas-harian/DeleteKasHarianDialog';
import EditKasHarianDialog from '@/components/features/kas-harian/EditKasHarianDialog';
import KasHarianTable from '@/components/features/kas-harian/KasHarianTable';
import { useCompany } from '@/contexts/CompanyContext';
import { useKasHarian } from '@/hooks/useKasHarian';

const LIVE_UPDATE_INTERVAL = 5000;

const mapManualCashFlow = (item: KasHarian): KasHarianListItem => ({
  id: item.id,
  source: item.finance_billing?.id ? 'billing' : 'manual',
  date: item.date,
  code: item.code,
  note: item.note || 'Transaksi kas harian',
  debet: Number(item.debet || 0),
  credit: Number(item.credit || 0),
  accountName: item.account ? `${item.account.code ?? '-'} - ${item.account.name ?? '-'}` : '-',
  cashName: item.cash?.description || item.cash?.code || '-',
  cashFlowId: item.id,
  financeBillingId: item.finance_billing?.id,
  transaction_category: item.transaction_category,
});

export default function KasHarianPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { companyId, isLoading: isCompanyLoading } = useCompany();
  const companyNumber = Number(companyId || 0);

  const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KasHarian | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const kasHarianQuery = useKasHarian(
    {
      page: 1,
      per_page: 1000,
      company_id: companyNumber || undefined,
    },
    {
      enabled: !isCompanyLoading && companyNumber > 0,
      refetchInterval: !isAddOpen && !isEditOpen && !isDeleteOpen ? LIVE_UPDATE_INTERVAL : false,
    },
  );

  const queryError = kasHarianQuery.error;

  const errorMessage = useMemo(() => {
    const error = queryError;
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return 'Gagal memuat data transaksi kas harian';
    }

    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : 'Gagal memuat data transaksi kas harian';
  }, [queryError]);

  useEffect(() => {
    if (kasHarianQuery.isError) {
      toast.error(errorMessage);
    }
  }, [errorMessage, kasHarianQuery.isError]);

  const mergedData = useMemo(() => {
    return (kasHarianQuery.data?.data ?? [])
      .map(mapManualCashFlow)
      .filter((item) => {
        if (!searchValue) return true;
        const query = searchValue.toLowerCase();
        return [item.code, item.note, item.accountName, item.cashName ?? '', item.transaction_category ?? ''].some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [kasHarianQuery.data?.data, searchValue]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return mergedData.slice(start, start + perPage);
  }, [mergedData, page, perPage]);

  const meta: PaginationMeta = useMemo(() => {
    const total = mergedData.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    return {
      currentPage: Math.min(page, lastPage),
      perPage,
      total,
      lastPage,
    };
  }, [mergedData.length, page, perPage]);

  useEffect(() => {
    if (page > meta.lastPage) {
      setPage(meta.lastPage || 1);
    }
  }, [meta.lastPage, page]);

  const isFetching = kasHarianQuery.isFetching;
  const isLoading = kasHarianQuery.isLoading || isCompanyLoading;
  const isError = kasHarianQuery.isError;

  const handleEdit = (item: KasHarianListItem) => {
    const manualItem = (kasHarianQuery.data?.data ?? []).find((cashFlow) => cashFlow.id === item.cashFlowId);
    if (!manualItem) return;
    setSelectedItem(manualItem);
    setIsEditOpen(true);
  };

  const handleDelete = (item: KasHarianListItem) => {
    const manualItem = (kasHarianQuery.data?.data ?? []).find((cashFlow) => cashFlow.id === item.cashFlowId);
    if (!manualItem) return;
    setSelectedItem(manualItem);
    setIsDeleteOpen(true);
  };

  const pushTo = (item: KasHarianListItem, path?: 'bayar') => {
    if (typeof slug !== 'string') return;
    const targetId = item.cashFlowId;
    if (!targetId) return;
    const suffix = path === 'bayar' ? '/bayar' : '';
    void router.push(`/dashboard/${slug}/finance/transaksi-kas-harian/${targetId}${suffix}?source=${item.source}`);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Transaksi Kas Harian - Wajira Dashboard</title>
      </Head>

      <div className="space-y-8 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[40px] font-semibold tracking-tight text-slate-950">Arus Transaksi Kas Harian</h1>
            <p className="mt-1 text-lg text-slate-500">Kelola arus transaksi kas harian</p>
          </div>

          <Button type="button" onClick={() => setIsAddOpen(true)} className="h-12 rounded-2xl bg-[#18385b] px-6 text-base hover:bg-[#102843]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-[332px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search here"
                className="h-12 rounded-2xl border-slate-200 bg-white pl-11"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 text-lg text-slate-700">
              <span>Show</span>
              <Select
                value={String(perPage)}
                onValueChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-12 w-[92px] rounded-2xl border-slate-200 bg-white">
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

          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200"
            onClick={() => {
              void kasHarianQuery.refetch();
            }}
            disabled={isFetching}
          >
            <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <RotateCw className="mr-2 h-4 w-4" />
            Live Update
          </Button>
        </div>

        <KasHarianTable
          data={paginatedData}
          meta={meta}
          hasNextPage={page < meta.lastPage}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={() => {
            void kasHarianQuery.refetch();
          }}
          onView={(item) => pushTo(item)}
          onPay={(item) => pushTo(item, 'bayar')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={setPage}
        />
      </div>

      <AddKasHarianDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditKasHarianDialog open={isEditOpen} onOpenChange={setIsEditOpen} data={selectedItem} />
      <DeleteKasHarianDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} data={selectedItem} />
    </DashboardLayout>
  );
}
