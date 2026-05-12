import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MaterialReceiptItemModal } from '@/components/features/material-receipt/MaterialReceiptItemModal';
import { UploadInvoiceModal } from '@/components/features/material-receipt/UploadInvoiceModal';
import { SearchableSelect } from '@/components/features/vehicle-data/SearchableSelect';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { MaterialTransactionDetailItem } from '@/@types/material-transaction.types';
import { useMaterials } from '@/hooks/useMaterial';
import {
  useCreateMaterialTransactionItem,
  useDeleteMaterialTransactionItem,
  useMaterialTransaction,
  useMaterialTransactionItem,
  useMaterialTransactionItems,
  useUpdateMaterialTransaction,
  useUpdateMaterialTransactionItem,
  useUploadMaterialTransactionInvoice,
} from '@/hooks/useMaterialTransaction';
import { useWarehouseOptions } from '@/hooks/usePengeluaranUnit';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import { materialTransactionSchema, type MaterialTransactionFormValues, type MaterialTransactionItemFormValues } from '@/scheme/material-transaction.schema';

const toDateValue = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default function MaterialReleaseEditPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const rawId = typeof router.query.id === 'string' ? Number(router.query.id) : NaN;
  const transactionId = Number.isFinite(rawId) ? rawId : undefined;
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 25 });

  const transactionQuery = useMaterialTransaction(transactionId);
  const itemsQuery = useMaterialTransactionItems({
    page,
    perPage,
    search,
    materialTransactionId: transactionId,
    type: 'sales',
    enabled: !!transactionId,
  });
  const warehousesQuery = useWarehouseOptions();

  const [materialSearch, setMaterialSearch] = useState('');
  const materialsQuery = useMaterials({ page: 1, perPage: 100, search: materialSearch, sort_order: 'asc' });
  const [openItemModal, setOpenItemModal] = useState(false);
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialTransactionDetailItem | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | undefined>(undefined);
  const itemDetailQuery = useMaterialTransactionItem(editingItemId);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTargets, setDeleteTargets] = useState<MaterialTransactionDetailItem[]>([]);

  const updateTransactionMutation = useUpdateMaterialTransaction();
  const createItemMutation = useCreateMaterialTransactionItem();
  const updateItemMutation = useUpdateMaterialTransactionItem();
  const deleteItemMutation = useDeleteMaterialTransactionItem();
  const uploadInvoiceMutation = useUploadMaterialTransactionInvoice();

  const form = useForm<MaterialTransactionFormValues>({
    resolver: zodResolver(materialTransactionSchema),
    defaultValues: {
      warehouseId: 0,
      supplierName: '',
      transactionDate: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!transactionQuery.data) return;
    form.reset({
      warehouseId: transactionQuery.data.warehouseId,
      supplierName: transactionQuery.data.supplierName,
      transactionDate: transactionQuery.data.transactionDate,
      description: transactionQuery.data.description ?? '',
    });
  }, [transactionQuery.data, form]);

  useEffect(() => {
    if (itemDetailQuery.data) {
      setEditingItem(itemDetailQuery.data);
    }
  }, [itemDetailQuery.data]);

  const items = itemsQuery.data?.data ?? [];
  const totalPages = itemsQuery.data?.meta.lastPage ?? 1;
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);
  const totalData = itemsQuery.data?.meta.total ?? 0;
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const handleUpdateTransaction = async (values: MaterialTransactionFormValues) => {
    if (!transactionId) return;

    try {
      await updateTransactionMutation.mutateAsync({
        id: transactionId,
        payload: values,
      });
      toast.success('Informasi pengeluaran berhasil diperbarui');
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal memperbarui data pengeluaran');
    }
  };

  const handleSubmitItem = async (values: MaterialTransactionItemFormValues) => {
    if (!transactionId) return;

    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          payload: {
            orderCode: values.orderCode,
            materialTransactionId: transactionId,
            materialId: values.materialId,
            qty: values.qty,
            price: values.price,
            description: values.description,
          },
        });
        toast.success('Item material berhasil diperbarui');
      } else {
        await createItemMutation.mutateAsync({
          orderCode: values.orderCode,
          materialTransactionId: transactionId,
          materialId: values.materialId,
          qty: values.qty,
          price: values.price,
          description: values.description,
        });
        toast.success('Item material berhasil ditambahkan');
      }

      setOpenItemModal(false);
      setEditingItem(null);
      setEditingItemId(undefined);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal menyimpan item material');
    }
  };

  const handleDeleteItems = async () => {
    if (!transactionId || deleteTargets.length === 0) return;

    try {
      for (const item of deleteTargets) {
        await deleteItemMutation.mutateAsync({ id: item.id, materialTransactionId: transactionId });
      }
      toast.success(`${deleteTargets.length} item material berhasil dihapus`);
      setSelectedIds((current) => current.filter((id) => !deleteTargets.some((item) => item.id === id)));
      setDeleteTargets([]);
    } catch (error) {
      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal menghapus item material');
    }
  };

  const handleUploadInvoice = async (file: File | null) => {
    if (!transactionId) return;
    if (!file) {
      toast.error('Silakan pilih file invoice terlebih dahulu');
      return;
    }

    try {
      await uploadInvoiceMutation.mutateAsync({ id: transactionId, file });
      toast.success(`Invoice untuk ${transactionQuery.data?.code ?? 'transaksi ini'} berhasil diunggah`);
      setOpenInvoiceModal(false);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi upload invoice gagal');
        return;
      }

      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal mengunggah invoice');
    }
  };

  if (transactionQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Memuat data pengeluaran perlengkapan...</div>
      </DashboardLayout>
    );
  }

  if (!transactionQuery.data) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600">Data pengeluaran perlengkapan tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <Button variant="ghost" asChild className="h-auto px-0 text-slate-500 hover:bg-transparent hover:text-slate-900">
            <Link href={`/dashboard/${slug}/warehouse/perlengkapan-keluar`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">Data Pengeluaran Material</h1>
          <p className="text-[16px] text-slate-500">
            No Pengeluaran <span className="font-medium text-blue-600">{transactionQuery.data.code}</span>
          </p>
        </div>

        <Card className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-none">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-[20px] font-semibold text-slate-950">Informasi Pengeluaran</h2>
            </div>

            <form onSubmit={form.handleSubmit(handleUpdateTransaction)} className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-[15px] font-medium text-slate-900">No Pengeluaran</Label>
                  <Input value={transactionQuery.data.code} readOnly className="h-12 rounded-xl border-slate-200 bg-white text-[15px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[15px] font-medium text-slate-900">Tanggal Keluar</Label>
                  <Controller
                    control={form.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <DatePicker
                        value={toDateValue(field.value)}
                        onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        placeholder="Pilih tanggal"
                        className="h-12 rounded-xl border-slate-200 px-4 text-[15px]"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[15px] font-medium text-slate-900">Tujuan / Supplier</Label>
                  <Input {...form.register('supplierName')} className="h-12 rounded-xl border-slate-200 text-[15px]" />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="space-y-2">
                  <Label className="text-[15px] font-medium text-slate-900">Warehouse</Label>
                  <Controller
                    control={form.control}
                    name="warehouseId"
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value ? String(field.value) : ''}
                        onChange={(value) => field.onChange(Number(value))}
                        options={(warehousesQuery.data ?? []).map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name }))}
                        placeholder={warehousesQuery.isLoading ? 'Memuat warehouse...' : 'Pilih warehouse'}
                        searchPlaceholder="Cari warehouse..."
                        emptyText="Warehouse tidak ditemukan."
                        loading={warehousesQuery.isLoading}
                        className="h-12 rounded-xl border-slate-200 px-4 text-[15px]"
                      />
                    )}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setOpenInvoiceModal(true)} className="h-11 rounded-xl bg-[#1f4163] px-5 text-[16px] hover:bg-[#183552]">
                    Upload Invoice
                  </Button>
                  <Button type="submit" disabled={updateTransactionMutation.isPending} className="h-11 rounded-xl bg-emerald-500 px-5 text-[16px] hover:bg-emerald-600">
                    {updateTransactionMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[15px] font-medium text-slate-900">Keterangan</Label>
                <Textarea {...form.register('description')} rows={4} className="rounded-xl border-slate-200 px-4 py-3 text-[15px]" />
              </div>
            </form>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[304px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search here" className="h-[42px] rounded-xl border-slate-200 pl-11 shadow-sm" />
            </div>
            <div className="flex items-center gap-3 text-[16px] text-slate-800">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
                <SelectTrigger className="h-[42px] w-[60px] rounded-xl border-slate-200 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setEditingItem(null);
                setEditingItemId(undefined);
                setOpenItemModal(true);
              }}
              className="h-11 rounded-xl bg-[#00c443] px-6 text-[18px] hover:bg-[#00b13d]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
            <Button
              variant="outline"
              disabled={selectedIds.length === 0}
              onClick={() => setDeleteTargets(items.filter((item) => selectedIds.includes(item.id)))}
              className="h-11 rounded-xl border-red-300 px-6 text-[18px] text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Hapus
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[15px] text-slate-500">
          <span className="text-emerald-500">✓</span>
          <span>{selectedIds.length} data terpilih</span>
        </div>

        <Card className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-none">
          <Table>
            <TableHeader className="bg-slate-100/90">
              <TableRow className="border-slate-200">
                <TableHead className="w-12 px-4 py-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      setSelectedIds(checked ? items.map((item) => item.id) : []);
                    }}
                  />
                </TableHead>
                <TableHead className="px-4 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">NO</TableHead>
                <TableHead className="px-4 py-4 text-[14px] font-semibold uppercase text-slate-950">NO PENJUALAN</TableHead>
                <TableHead className="px-4 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE BARANG</TableHead>
                <TableHead className="px-4 py-4 text-[14px] font-semibold uppercase text-slate-950">NAMA BARANG</TableHead>
                <TableHead className="px-4 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">QTY</TableHead>
                <TableHead className="px-4 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsQuery.isLoading || itemsQuery.isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">Memuat item material...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">Belum ada item material.</TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id} className="border-slate-200">
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds((current) => (checked ? [...current, item.id] : current.filter((id) => id !== item.id)));
                        }}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-[15px] text-slate-800">{startData + index}</TableCell>
                    <TableCell className="px-4 py-3 text-[15px] text-slate-800">{item.orderCode ?? '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-[15px] text-slate-800">{item.material?.code ?? '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-[15px] text-slate-800">{item.material?.name ?? '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-center text-[15px] text-slate-800">{item.qty}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item);
                            setEditingItemId(item.id);
                            setOpenItemModal(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTargets([item])}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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

      <MaterialReceiptItemModal
        open={openItemModal}
        onOpenChange={(open) => {
          setOpenItemModal(open);
          if (!open) {
            setEditingItem(null);
            setEditingItemId(undefined);
            setMaterialSearch('');
          }
        }}
        initialData={itemDetailQuery.data ?? editingItem}
        materials={materialsQuery.data?.data ?? []}
        isLoadingMaterials={materialsQuery.isLoading || itemDetailQuery.isLoading}
        materialSearch={materialSearch}
        onMaterialSearchChange={setMaterialSearch}
        onSubmit={handleSubmitItem}
        isSubmitting={createItemMutation.isPending || updateItemMutation.isPending}
        addTitle="Input Pengeluaran Unit"
        editTitle="Edit Pengeluaran Unit"
        descriptionText="Masukkan detail pengeluaran unit baru"
        orderCodeLabel="Nomor Penjualan"
        orderCodePlaceholder="Masukkan nomor penjualan"
        priceLabel="Harga Jual"
      />

      <UploadInvoiceModal
        open={openInvoiceModal}
        onOpenChange={setOpenInvoiceModal}
        onSubmit={handleUploadInvoice}
        isSubmitting={uploadInvoiceMutation.isPending}
      />

      <AlertDialog open={deleteTargets.length > 0} onOpenChange={(open) => !open && setDeleteTargets([])}>
        <AlertDialogContent className="max-w-[680px] rounded-[28px] border-none p-10 shadow-2xl">
          <AlertDialogHeader className="space-y-5 text-left">
            <AlertDialogTitle className="text-[28px] font-semibold text-slate-950">Hapus Data Ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-[18px] text-slate-500">Apa anda yakin ingin menghapus data ini?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-4">
            <AlertDialogCancel className="h-14 rounded-2xl border-slate-300 px-7 text-[18px]">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItems} disabled={deleteItemMutation.isPending} className="h-14 rounded-2xl bg-red-600 px-7 text-[18px] hover:bg-red-700">
              {deleteItemMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
