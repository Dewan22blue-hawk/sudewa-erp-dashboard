import React from 'react';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiDetailCard } from '@/components/features/do-ekspedisi/DOEkspedisiDetailCard';
import { DOEkspedisiDetailTable } from '@/components/features/do-ekspedisi/DOEkspedisiDetailTable';
import { DeleteDOEkspedisiModal } from '@/components/features/do-ekspedisi/DeleteDOEkspedisiModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DoEkspedisiItem } from '@/@types/do-ekspedisi.types';
import { useDeleteDoEkspedisiItem, useDoEkspedisiDetail, useDoEkspedisiItems } from '@/hooks/useDoEkspedisi';

const renderPagination = (page: number, totalPages: number): Array<number | string> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, '...', totalPages];
  if (page >= totalPages - 3) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', page - 1, page, page + 1, '...', totalPages];
};

export default function DetailDOEkspedisiPage() {
  const router = useRouter();
  const { slug, id } = router.query;

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [selectedItem, setSelectedItem] = React.useState<DoEkspedisiItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const detailQuery = useDoEkspedisiDetail(id ? String(id) : null);
  const itemQuery = useDoEkspedisiItems({
    page,
    perPage,
    do_expedition_id: id ? String(id) : undefined,
    loading_in: search,
    loading_out: search,
    destination: search,
    order_by: 'created_at',
    order_sort: 'desc',
    enabled: !!id,
  });
  const deleteItemMutation = useDeleteDoEkspedisiItem();

  const handleDeleteItem = async () => {
    if (!selectedItem || !id) return;

    try {
      await deleteItemMutation.mutateAsync({
        id: selectedItem.id,
        doExpeditionId: String(id),
      });
      toast.success('Item DO berhasil dihapus');
      setDeleteOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus item DO');
    }
  };

  if (detailQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">Memuat detail DO Ekspedisi...</div>
      </DashboardLayout>
    );
  }

  if (!detailQuery.data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-red-500">Gagal memuat detail DO Ekspedisi</div>
      </DashboardLayout>
    );
  }

  const detailItemMap = new Map((detailQuery.data.items ?? []).map((item) => [item.id, item]));
  const tableData = (itemQuery.data?.data ?? []).map((item) => {
    const detailItem = detailItemMap.get(item.id);

    if (!detailItem) {
      return item;
    }

    return {
      ...item,
      destination: item.destination || detailItem.destination,
      driverNote: item.driverNote || detailItem.driverNote,
      mapsUrl: item.mapsUrl || detailItem.mapsUrl,
      destinations: item.destinations?.length ? item.destinations : detailItem.destinations,
    };
  });

  const totalData = itemQuery.data?.meta.total ?? 0;
  const totalPages = itemQuery.data?.meta.lastPage ?? 1;
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <button onClick={() => slug && router.push(`/dashboard/${slug}/do-ekspedisi`)} className="rounded-md p-1 transition-colors hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 md:text-[20px]">Detail DO Expedisi</h1>
            <p className="text-sm text-slate-500">Kode DO <span className="font-medium text-[#2563EB]">{detailQuery.data.doCode}</span></p>
          </div>
        </div>

        <DOEkspedisiDetailCard data={detailQuery.data} />

        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search here"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] bg-white pl-11"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <Select value={String(perPage)} onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}>
                <SelectTrigger className="h-12 w-[88px] rounded-xl border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-600">Page</span>
            </div>
          </div>

          <Button onClick={() => slug && id && router.push(`/dashboard/${slug}/do-ekspedisi/detail/${id}/create`)} className="h-12 rounded-xl bg-[#1E3A5F] px-5 hover:bg-[#18314F]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <DOEkspedisiDetailTable
          data={tableData}
          page={page}
          perPage={perPage}
          isLoading={itemQuery.isLoading}
          onView={(item) => slug && id && router.push(`/dashboard/${slug}/do-ekspedisi/detail/${id}/item/${item.id}`)}
          onEdit={(item) => slug && id && router.push(`/dashboard/${slug}/do-ekspedisi/detail/${id}/item/${item.id}/edit`)}
          onDelete={(item) => {
            setSelectedItem(item);
            setDeleteOpen(true);
          }}
        />

        <div className="flex flex-col gap-4 px-1 pt-1 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-500">
            Showing {startData}-{endData} of {totalData} data
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="text-slate-600">
                Previous
              </Button>
              {renderPagination(page, totalPages).map((item, index) => (
                <Button
                  key={`${item}-${index}`}
                  variant={item === page ? 'outline' : 'ghost'}
                  size="sm"
                  disabled={item === '...'}
                  onClick={() => typeof item === 'number' && setPage(item)}
                  className={item === page ? 'border-[#D7DEE7] bg-white' : 'text-slate-600'}
                >
                  {item}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages} className="text-slate-600">
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <DeleteDOEkspedisiModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteItem}
        isDeleting={deleteItemMutation.isPending}
        itemName={selectedItem?.customerName}
      />
    </DashboardLayout>
  );
}
