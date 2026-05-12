import { useMemo, useState } from 'react';
import { MoreVertical, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MaterialFormModal, type MaterialFormData } from '@/components/features/material/MaterialFormModal';
import { EditMaterialModal } from '@/components/features/material/EditMaterialModal';
import { DeleteMaterialModal } from '@/components/features/material/DeleteMaterialModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Material } from '@/@types/material.types';
import { useCreateMaterial, useDeleteMaterial, useMaterials, useUpdateMaterial } from '@/hooks/useMaterial';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { getVisiblePageNumbers } from '@/lib/api/pagination';

const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function StockPerlengkapanPage() {
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 25 });
  const materialsQuery = useMaterials({ page, perPage, search, sort_order: 'asc', has_transaction: true });
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const materials = materialsQuery.data?.data ?? [];
  const totalData = materialsQuery.data?.meta.total ?? 0;
  const totalPages = materialsQuery.data?.meta.lastPage ?? 1;
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);

  const handleSave = async (data: MaterialFormData) => {
    try {
      if (selectedMaterial) {
        await updateMutation.mutateAsync({ id: selectedMaterial.id, data });
        toast.success('Data stock perlengkapan berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Data stock perlengkapan berhasil ditambahkan');
      }

      setIsFormOpen(false);
      setSelectedMaterial(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data stock perlengkapan');
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    try {
      await deleteMutation.mutateAsync(selectedMaterial.id);
      toast.success('Data stock perlengkapan berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedMaterial(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data stock perlengkapan');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">Data Stock Perlengkapan</h1>
          <p className="mt-1 text-[18px] text-slate-500">Kelola dan lacak semua stock perlengkapan</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[316px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search here" className="h-[42px] rounded-xl border-slate-200 pl-11 shadow-sm" />
            </div>

            <div className="flex items-center gap-3 text-[16px] text-slate-800">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
                <SelectTrigger className="h-[42px] w-[58px] rounded-xl border-slate-200 shadow-sm">
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
            onClick={() => {
              setSelectedMaterial(null);
              setIsFormOpen(true);
            }}
            className="h-[40px] rounded-xl bg-[#1f4163] px-6 text-[18px] font-medium hover:bg-[#183552]"
          >
            Tambah
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-none">
          <Table>
            <TableHeader className="bg-slate-100/90">
              <TableRow className="border-slate-200">
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">NO</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE BARANG</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NAMA BARANG</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">HARGA BELI</TableHead>
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">QTY</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">LOKASI</TableHead>
                <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-950">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialsQuery.isLoading || materialsQuery.isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-500">Memuat data stock perlengkapan...</TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-500">Belum ada data stock perlengkapan.</TableCell>
                </TableRow>
              ) : (
                materials.map((item, index) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                    <TableCell className="px-5 py-4 text-center text-[15px] text-slate-800">{startData + index}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.code}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">{item.name}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">{formatCurrency(item.averagePrice ?? item.price)}</TableCell>
                    <TableCell className="px-5 py-4 text-center text-[15px] text-slate-800">{item.stock ?? 0}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">-</TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                            <MoreVertical className="h-4 w-4 text-slate-700" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-2xl border-slate-200 p-2 shadow-lg">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMaterial(item);
                              setIsFormOpen(true);
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMaterial(item);
                              setIsDeleteOpen(true);
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600"
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[14px] text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
          <div className="flex items-center gap-1 text-[16px]">
            <Button variant="ghost" onClick={() => setPage(page - 1)} disabled={page <= 1}>Previous</Button>
            {pageNumbers.map((pageNumber) => (
              <Button key={pageNumber} variant={pageNumber === page ? 'outline' : 'ghost'} onClick={() => setPage(pageNumber)} className={pageNumber === page ? 'h-10 min-w-10 rounded-xl border-slate-200 bg-white' : 'h-10 min-w-10 rounded-xl'}>
                {pageNumber}
              </Button>
            ))}
            {totalPages > 5 && !pageNumbers.includes(totalPages) ? <span className="px-2 text-slate-500">...</span> : null}
            {totalPages > 5 && !pageNumbers.includes(totalPages) ? (
              <Button variant="ghost" onClick={() => setPage(totalPages)} className="h-10 min-w-10 rounded-xl">{totalPages}</Button>
            ) : null}
            <Button variant="ghost" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</Button>
          </div>
        </div>
      </div>

      <MaterialFormModal isOpen={isFormOpen && !selectedMaterial} onClose={() => setIsFormOpen(false)} onSave={handleSave} />

      {selectedMaterial ? (
        <EditMaterialModal
          isOpen={isFormOpen && !!selectedMaterial}
          onClose={() => {
            setIsFormOpen(false);
            setTimeout(() => setSelectedMaterial(null), 300);
          }}
          onSave={handleSave}
          initialData={selectedMaterial}
        />
      ) : null}

      <DeleteMaterialModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} isDeleting={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
