import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, RotateCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { KasHarian } from '@/@types/kas-harian.types';
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

  const query = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: searchValue || undefined,
      company_id: companyNumber || undefined,
    }),
    [companyNumber, page, perPage, searchValue],
  );

  const kasHarianQuery = useKasHarian(query, { enabled: !isCompanyLoading && companyNumber > 0 });

  const errorMessage = useMemo(() => {
    const error = kasHarianQuery.error;
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return 'Gagal memuat data transaksi kas harian';
    }

    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : 'Gagal memuat data transaksi kas harian';
  }, [kasHarianQuery.error]);

  useEffect(() => {
    if (kasHarianQuery.isError) {
      toast.error(errorMessage);
    }
  }, [errorMessage, kasHarianQuery.isError]);

  const meta = kasHarianQuery.data?.meta ?? {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
  };

  useEffect(() => {
    if (page > meta.lastPage) {
      setPage(meta.lastPage || 1);
    }
  }, [meta.lastPage, page]);

  const handleEdit = (item: KasHarian) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleDelete = (item: KasHarian) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const pushTo = (path: string) => {
    if (typeof slug !== 'string') return;
    void router.push(`/dashboard/${slug}${path}`);
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

          <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-200" onClick={() => void kasHarianQuery.refetch()} disabled={kasHarianQuery.isFetching}>
            <RotateCw className={`mr-2 h-4 w-4 ${kasHarianQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <KasHarianTable
          data={kasHarianQuery.data?.data ?? []}
          meta={meta}
          hasNextPage={kasHarianQuery.data?.hasNextPage ?? false}
          isLoading={kasHarianQuery.isLoading || isCompanyLoading}
          isFetching={kasHarianQuery.isFetching}
          isError={kasHarianQuery.isError}
          errorMessage={errorMessage}
          onRetry={() => void kasHarianQuery.refetch()}
          onView={(item) => pushTo(`/finance/transaksi-kas-harian/${item.id}`)}
          onPay={(item) => pushTo(`/finance/transaksi-kas-harian/${item.id}/bayar`)}
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
