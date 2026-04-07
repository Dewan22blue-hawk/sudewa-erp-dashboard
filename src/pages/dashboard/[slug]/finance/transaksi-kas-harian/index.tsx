import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Plus, RotateCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useKasHarian } from '@/hooks/useKasHarian';
import KasHarianTable from '@/components/features/kas-harian/KasHarianTable';
import AddKasHarianDialog from '@/components/features/kas-harian/AddKasHarianDialog';
import EditKasHarianDialog from '@/components/features/kas-harian/EditKasHarianDialog';
import DeleteKasHarianDialog from '@/components/features/kas-harian/DeleteKasHarianDialog';
import type { KasHarian } from '@/@types/kas-harian.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function KasHarianPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KasHarian | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchCode(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const query = useMemo(
    () => ({
      page,
      per_page: perPage,
      code: searchCode || undefined,
    }),
    [page, perPage, searchCode],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useKasHarian(query);

  const errorMessage = useMemo(() => {
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return 'Gagal memuat data transaksi kas harian';
    }

    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : 'Gagal memuat data transaksi kas harian';
  }, [error]);

  useEffect(() => {
    if (isError) {
      toast.error(errorMessage);
    }
  }, [errorMessage, isError]);

  const meta = data?.meta ?? {
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

  return (
    <DashboardLayout>
      <Head>
        <title>Transaksi Kas Harian - Wajira Dashboard</title>
      </Head>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arus Transaksi Kas Harian</h1>
            <p className="text-gray-500">Kelola arus transaksi kas harian dari API finance.</p>
          </div>


        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder="Cari kode transaksi" className="pl-10 bg-white" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
            </div>

            {searchInput ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearchCode('');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <Select
                value={String(perPage)}
                onValueChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] bg-white">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">Page</span>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 xl:w-auto">
            <Button type="button" variant="outline" className="w-full xl:w-auto" onClick={() => void refetch()} disabled={isFetching}>
              <RotateCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="w-full gap-2 bg-[#1e293b] hover:bg-[#0f172a] xl:w-auto"
            >
              <Plus size={18} />
              Tambah
            </Button>
          </div>
        </div>

        <KasHarianTable
          data={data?.data ?? []}
          meta={meta}
          hasNextPage={data?.hasNextPage ?? false}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={() => void refetch()}
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
