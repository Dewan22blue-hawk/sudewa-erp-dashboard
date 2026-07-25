import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueries } from '@tanstack/react-query';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { MaterialReceiptFormModal } from '@/components/features/material-receipt/MaterialReceiptFormModal';
import { UploadInvoiceModal } from '@/components/features/material-receipt/UploadInvoiceModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MaterialTransaction } from '@/@types/material-transaction.types';
import {
  materialTransactionKeys,
  useCreateMaterialTransaction,
  useDeleteMaterialTransaction,
  useMaterialTransactions,
  useUpdateMaterialTransaction,
  useUploadMaterialTransactionInvoice,
} from '@/hooks/useMaterialTransaction';
import { useWarehouseOptions } from '@/hooks/usePengeluaranUnit';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import type { MaterialTransactionFormValues } from '@/scheme/material-transaction.schema';
import { getMaterialTransactionById } from '@/services/material-transaction.service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { id } from 'date-fns/locale';
import { LoadingState } from '@/components/ui/loading-state';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd MMMM yyyy', { locale: id });
};

const getWarehouseName = (item: MaterialTransaction) => item.warehouse?.name ?? (item.warehouseId ? `Warehouse #${item.warehouseId}` : '-');

export default function MaterialReleaseListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 25 });

  const transactionsQuery = useMaterialTransactions({
    page,
    perPage,
    type: 'sales',
    code: search || undefined,
    supplier_name: search || undefined,
  });
  const warehousesQuery = useWarehouseOptions();
  const createMutation = useCreateMaterialTransaction();
  const updateMutation = useUpdateMaterialTransaction();
  const deleteMutation = useDeleteMaterialTransaction();
  const uploadInvoiceMutation = useUploadMaterialTransactionInvoice();

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('warehouse:create');
  const canEdit = hasPermission('warehouse:edit');
  const canDelete = hasPermission('warehouse:delete');

  const [openForm, setOpenForm] = useState(false);
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<MaterialTransaction | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<MaterialTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaterialTransaction | null>(null);

  const totalPages = transactionsQuery.data?.meta.lastPage ?? 1;
  const pageNumbers = useMemo(() => getVisiblePageNumbers(totalPages, page, 5), [page, totalPages]);
  const totalData = transactionsQuery.data?.meta.total ?? 0;
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);
  const detailQueries = useQueries({
    queries: (transactionsQuery.data?.data ?? []).map((item) => ({
      queryKey: materialTransactionKeys.detail(item.id),
      queryFn: () => getMaterialTransactionById(item.id),
      enabled: !!item.id,
      staleTime: 60_000,
    })),
  });
  const detailMap = useMemo(() => {
    const map = new Map<number, Awaited<ReturnType<typeof getMaterialTransactionById>>>();
    (transactionsQuery.data?.data ?? []).forEach((item, index) => {
      const detail = detailQueries[index]?.data;
      if (detail) {
        map.set(item.id, detail);
      }
    });
    return map;
  }, [detailQueries, transactionsQuery.data?.data]);

  const handleSubmit = async (values: MaterialTransactionFormValues) => {
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction.id,
          payload: values,
        });
        toast.success('Data pengeluaran perlengkapan berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({
          ...values,
          type: 'sales',
        });
        toast.success('Data pengeluaran perlengkapan berhasil dibuat');
      }

      setOpenForm(false);
      setEditingTransaction(null);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi gagal');
        return;
      }

      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal menyimpan data pengeluaran perlengkapan');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Data pengeluaran perlengkapan berhasil dihapus');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal menghapus data pengeluaran perlengkapan');
    }
  };

  const handleUploadInvoice = async (file: File | null) => {
    if (!invoiceTarget) return;
    if (!file) {
      toast.error('Silakan pilih file invoice terlebih dahulu');
      return;
    }

    try {
      await uploadInvoiceMutation.mutateAsync({ id: invoiceTarget.id, file });
      toast.success(`Invoice untuk ${invoiceTarget.code} berhasil diunggah`);
      setOpenInvoiceModal(false);
      setInvoiceTarget(null);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi upload invoice gagal');
        return;
      }

      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal mengunggah invoice');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Data Pengeluaran Perlengkapan"
          subtitle="Kelola dan lacak semua data pengeluaran stock perlengkapan"
          actions={
            canCreate && (
              <Button onClick={() => { setEditingTransaction(null); setOpenForm(true); }} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            )
          }
        />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search here" className="pl-9 bg-white" />
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
          </div>

          <div className="rounded-md border border-gray-200 bg-white overflow-hidden shadow-none">
            <Table>
              <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                <TableRow className="hover:bg-[#f8f9fa]">
                  <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">TANGGAL KELUAR</TableHead>
                  <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">KODE BARANG</TableHead>
                  <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">NAMA BARANG / TUJUAN</TableHead>
                  <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">HARGA JUAL</TableHead>
                  <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">QTY</TableHead>
                  <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">LOKASI</TableHead>
                  <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsQuery.isLoading || transactionsQuery.isFetching ? (
                  <TableRow>
                    <TableCell colSpan={100} className="h-28 text-center"><LoadingState variant="section" text="Memuat data pengeluaran perlengkapan..." /></TableCell>
                  </TableRow>
                ) : (transactionsQuery.data?.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-slate-500">Belum ada data pengeluaran perlengkapan.</TableCell>
                  </TableRow>
                ) : (
                  (transactionsQuery.data?.data ?? []).map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      {(() => {
                        const detail = detailMap.get(item.id);
                        const firstMaterial = detail?.materialTransactionDetails[0]?.material;
                        const totalQty = detail?.materialTransactionDetails.reduce((total, row) => total + row.qty, 0) ?? 0;
                        const firstPrice = detail?.materialTransactionDetails[0]?.price ?? item.totalAmount;

                        return (
                          <>
                            <TableCell className="px-4 py-4 text-sm text-slate-600 text-center">{formatDate(item.transactionDate)}</TableCell>
                            <TableCell className="px-4 py-4 text-sm text-slate-600 text-left">{firstMaterial?.code || item.code}</TableCell>
                            <TableCell className="px-4 py-4 text-sm text-slate-600 text-left">
                              <div className="font-medium text-slate-900">{firstMaterial?.name || item.supplierName}</div>
                              <div className="text-xs text-slate-500">{item.supplierName}</div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm text-slate-600 text-center">Rp {(firstPrice || 0).toLocaleString('id-ID')}</TableCell>
                            <TableCell className="px-4 py-4 text-sm text-slate-600 text-center">{totalQty || '-'}</TableCell>
                            <TableCell className="px-4 py-4 text-sm text-slate-600 text-left">{getWarehouseName(item)}</TableCell>
                            <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[150px] rounded-md border-slate-200 p-1.5 shadow-lg">
                                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                                    <Link href={`/dashboard/${slug}/warehouse/perlengkapan-keluar/${item.id}/edit`}>Edit</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                                    <Link href={`/dashboard/${slug}/warehouse/perlengkapan-keluar/${item.id}`}>Detail</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setInvoiceTarget(item);
                                      setOpenInvoiceModal(true);
                                    }}
                                    className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                                  >
                                    Upload Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        );
                      })()}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
            <p>Showing {startData}-{endData} of {totalData} data</p>
            <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
              <Button variant="ghost" size="sm" className="h-9 rounded-md px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                Previous
              </Button>
              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(pageNumber)}
                  className={cn(
                    'h-9 min-w-9 rounded-md border px-3 text-sm font-medium shadow-none',
                    pageNumber === page
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                >
                  {pageNumber}
                </Button>
              ))}
              {totalPages > 5 && !pageNumbers.includes(totalPages) && <span className="px-2 text-slate-500">...</span>}
              {totalPages > 5 && !pageNumbers.includes(totalPages) && (
                <Button variant="ghost" size="sm" onClick={() => setPage(totalPages)} className="h-9 min-w-9 rounded-md border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white">
                  {totalPages}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-9 rounded-md px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MaterialReceiptFormModal
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditingTransaction(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editingTransaction}
        warehouses={warehousesQuery.data ?? []}
        isLoadingWarehouses={warehousesQuery.isLoading}
        addTitle="Input Pengeluaran Unit"
        editTitle="Edit Pengeluaran Perlengkapan"
        descriptionText="Masukkan detail pengeluaran unit baru"
        dateLabel="Tanggal Pengeluaran"
        descriptionPlaceholder="Masukkan keterangan pengeluaran"
      />

      <UploadInvoiceModal
        open={openInvoiceModal}
        onOpenChange={(open) => {
          setOpenInvoiceModal(open);
          if (!open) setInvoiceTarget(null);
        }}
        onSubmit={handleUploadInvoice}
        isSubmitting={uploadInvoiceMutation.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[680px] rounded-[28px] border-none p-10 shadow-2xl">
          <AlertDialogHeader className="space-y-5 text-left">
            <AlertDialogTitle className="text-[28px] font-semibold text-slate-950">Hapus Data Ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-[18px] text-slate-500">Apa anda yakin ingin menghapus data ini?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-4">
            <AlertDialogCancel className="h-14 rounded-2xl border-slate-300 px-7 text-[18px]">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending} className="h-14 rounded-2xl bg-red-600 px-7 text-[18px] hover:bg-red-700">
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
