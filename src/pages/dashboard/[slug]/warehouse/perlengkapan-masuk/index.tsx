import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueries } from '@tanstack/react-query';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { materialTransactionKeys, useCreateMaterialTransaction, useDeleteMaterialTransaction, useMaterialTransactions, useUpdateMaterialTransaction, useUploadMaterialTransactionInvoice } from '@/hooks/useMaterialTransaction';
import { useWarehouseOptions } from '@/hooks/usePengeluaranUnit';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import type { MaterialTransactionFormValues } from '@/scheme/material-transaction.schema';
import { getMaterialTransactionById } from '@/services/material-transaction.service';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

const getWarehouseName = (item: MaterialTransaction) => item.warehouse?.name ?? (item.warehouseId ? `Warehouse #${item.warehouseId}` : '-');

export default function MaterialReceiptListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 10 });

  const transactionsQuery = useMaterialTransactions({
    page,
    perPage,
    type: 'purchase',
    code: search || undefined,
    supplier_name: search || undefined,
  });
  const warehousesQuery = useWarehouseOptions();
  const createMutation = useCreateMaterialTransaction();
  const updateMutation = useUpdateMaterialTransaction();
  const deleteMutation = useDeleteMaterialTransaction();
  const uploadInvoiceMutation = useUploadMaterialTransactionInvoice();

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
        toast.success('Data penerimaan perlengkapan berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({
          ...values,
          type: 'purchase',
        });
        toast.success('Data penerimaan perlengkapan berhasil dibuat');
      }

      setOpenForm(false);
      setEditingTransaction(null);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi gagal');
        return;
      }

      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal menyimpan data penerimaan perlengkapan');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Data penerimaan perlengkapan berhasil dihapus');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof ApiResponseError ? error.message : 'Gagal menghapus data penerimaan perlengkapan');
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
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">Data Penerimaan Perlengkapan</h1>
          <p className="mt-1 text-[18px] text-slate-500">Kelola dan lacak semua data penerimaan stock perlengkapan</p>
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
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditingTransaction(null);
              setOpenForm(true);
            }}
            className="h-[40px] rounded-xl bg-[#1f4163] px-6 text-[18px] font-medium hover:bg-[#183552]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-none">
          <Table>
            <TableHeader className="bg-slate-100/90">
              <TableRow className="border-slate-200">
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">TANGGAL TERIMA</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE BARANG</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NAMA BARANG / SUPPLIER</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">HARGA BELI</TableHead>
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">QTY</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">LOKASI</TableHead>
                <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-950">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsQuery.isLoading || transactionsQuery.isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-500">Memuat data penerimaan perlengkapan...</TableCell>
                </TableRow>
              ) : (transactionsQuery.data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-500">Belum ada data penerimaan perlengkapan.</TableCell>
                </TableRow>
              ) : (
                (transactionsQuery.data?.data ?? []).map((item) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                    {(() => {
                      const detail = detailMap.get(item.id);
                      const firstMaterial = detail?.materialTransactionDetails[0]?.material;
                      const totalQty = detail?.materialTransactionDetails.reduce((total, row) => total + row.qty, 0) ?? 0;
                      const firstPrice = detail?.materialTransactionDetails[0]?.price ?? item.totalAmount;

                      return (
                        <>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">{formatDate(item.transactionDate)}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">{firstMaterial?.code || item.code}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">
                      <div className="font-medium">{firstMaterial?.name || item.supplierName}</div>
                      <div className="text-sm text-slate-500">{item.supplierName}</div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">Rp {(firstPrice || 0).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="px-5 py-4 text-center text-[15px] text-slate-800">{totalQty || '-'}</TableCell>
                    <TableCell className="px-5 py-4 text-[15px] text-slate-800">{getWarehouseName(item)}</TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                            <MoreVertical className="h-4 w-4 text-slate-700" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-2xl border-slate-200 p-2 shadow-lg">
                          <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                            <Link href={`/dashboard/${slug}/warehouse/perlengkapan-masuk/${item.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                            <Link href={`/dashboard/${slug}/warehouse/perlengkapan-masuk/${item.id}`}>Detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setInvoiceTarget(item);
                              setOpenInvoiceModal(true);
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
                          >
                            Upload Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600">
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
        </Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[14px] text-slate-500">Showing {startData}-{endData} of {totalData} data</p>
          <div className="flex items-center gap-1 text-[16px]">
            <Button variant="ghost" onClick={() => setPage(page - 1)} disabled={page <= 1}>
              Previous
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? 'outline' : 'ghost'}
                onClick={() => setPage(pageNumber)}
                className={pageNumber === page ? 'h-10 min-w-10 rounded-xl border-slate-200 bg-white' : 'h-10 min-w-10 rounded-xl'}
              >
                {pageNumber}
              </Button>
            ))}
            {totalPages > 5 && !pageNumbers.includes(totalPages) ? <span className="px-2 text-slate-500">...</span> : null}
            {totalPages > 5 && !pageNumbers.includes(totalPages) ? (
              <Button variant="ghost" onClick={() => setPage(totalPages)} className="h-10 min-w-10 rounded-xl">
                {totalPages}
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
              Next
            </Button>
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
