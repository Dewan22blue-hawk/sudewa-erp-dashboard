import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, MoreVertical, Plus, Search, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompany } from '@/contexts/CompanyContext';
import { useKas } from '@/hooks/useKas';
import { useMaterials } from '@/hooks/useMaterial';
import {
  useCreateMaterialTransactionBilling,
  useCreateMaterialTransactionItem,
  useDeleteMaterialTransactionItem,
  useMaterialTransaction,
  useMaterialTransactionBillings,
  useMaterialTransactionItems,
  useUpdateMaterialTransactionItem,
} from '@/hooks/useMaterialTransaction';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import type { MaterialTransactionDetailItem } from '@/@types/material-transaction.types';
import { PurchaseMaterialDetailItemModal } from '@/components/features/material-purchase/PurchaseMaterialDetailItemModal';
import { PurchaseMaterialPaymentModal } from '@/components/features/material-purchase/PurchaseMaterialPaymentModal';
import type { MaterialTransactionBillingFormValues, MaterialTransactionItemFormValues } from '@/scheme/material-transaction.schema';

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (value: number) => `Rp${(value || 0).toLocaleString('id-ID')}`;

export default function PurchaseMaterialDetailPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const rawId = typeof router.query.id === 'string' ? Number(router.query.id) : NaN;
  const transactionId = Number.isFinite(rawId) ? rawId : undefined;

  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialTransactionDetailItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MaterialTransactionDetailItem | null>(null);
  const [materialSearch, setMaterialSearch] = useState('');

  const transactionQuery = useMaterialTransaction(transactionId);
  const itemsQuery = useMaterialTransactionItems({ page: 1, perPage: 1000, type: 'purchase', enabled: !!transactionId });
  const billingsQuery = useMaterialTransactionBillings({ page: 1, perPage: 1000, materialTransactionId: transactionId, enabled: !!transactionId });
  const materialsQuery = useMaterials({ page: 1, perPage: 100, search: materialSearch, sort_order: 'asc' });
  const kasQuery = useKas(companyId ?? undefined);

  const createItemMutation = useCreateMaterialTransactionItem();
  const updateItemMutation = useUpdateMaterialTransactionItem();
  const deleteItemMutation = useDeleteMaterialTransactionItem();
  const createBillingMutation = useCreateMaterialTransactionBilling();

  const transaction = transactionQuery.data;
  const allItems = useMemo(() => {
    const source = itemsQuery.data?.data ?? transaction?.materialTransactionDetails ?? [];
    if (!transactionId) return source;
    return source.filter((item) => item.materialTransactionId === transactionId);
  }, [itemsQuery.data?.data, transaction?.materialTransactionDetails, transactionId]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allItems;
    return allItems.filter((item) => {
      const materialName = item.material?.name?.toLowerCase() ?? '';
      const description = item.description?.toLowerCase() ?? '';
      return materialName.includes(term) || description.includes(term) || String(item.qty).includes(term) || String(item.price).includes(term);
    });
  }, [allItems, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * perPage, safePage * perPage);
  const startData = filteredItems.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const endData = Math.min(safePage * perPage, filteredItems.length);
  const pageNumbers = getVisiblePageNumbers(totalPages, safePage, 5);

  const totalPaidFromBillings = useMemo(() => {
    const billings = billingsQuery.data?.data ?? [];
    return billings.reduce((total, item) => total + item.amount, 0);
  }, [billingsQuery.data?.data]);

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
        toast.success('Detail pembelian material berhasil diperbarui');
      } else {
        await createItemMutation.mutateAsync({
          orderCode: values.orderCode,
          materialTransactionId: transactionId,
          materialId: values.materialId,
          qty: values.qty,
          price: values.price,
          description: values.description,
        });
        toast.success('Detail pembelian material berhasil ditambahkan');
      }

      setOpenItemModal(false);
      setEditingItem(null);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menyimpan detail pembelian material';
      toast.error(message);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem || !transactionId) return;

    try {
      await deleteItemMutation.mutateAsync({ id: deleteItem.id, materialTransactionId: transactionId });
      toast.success('Detail pembelian material berhasil dihapus');
      setDeleteItem(null);
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus detail pembelian material';
      toast.error(message);
    }
  };

  const handlePay = async (values: MaterialTransactionBillingFormValues) => {
    if (!transactionId || !transaction) return;
    if (values.amount > transaction.totalUnpaid) {
      toast.error('Nominal pembayaran melebihi sisa tagihan.');
      return;
    }

    try {
      await createBillingMutation.mutateAsync({
        materialTransactionId: transactionId,
        cashId: values.cashId,
        amount: values.amount,
        paymentDate: values.paymentDate,
        description: values.description,
      });
      toast.success('Pembayaran pembelian material berhasil disimpan');
      setOpenPaymentModal(false);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi gagal');
        return;
      }
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menyimpan pembayaran';
      toast.error(message);
    }
  };

  if (transactionQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Memuat detail pembelian material...</div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600">Detail pembelian material tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-3">
          <Button variant="ghost" asChild className="px-0 text-slate-500 hover:bg-transparent hover:text-slate-900">
            <Link href={`/dashboard/${slug}/pembelian-material`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-[24px] font-semibold text-slate-900">Detail Pembelian</h1>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[16px] font-medium text-slate-900">Nomor Pembelian</label>
              <Input value={transaction.code} readOnly className="h-12 rounded-xl border-slate-200 bg-white shadow-sm" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <div className="space-y-3">
                <label className="text-[16px] font-medium text-slate-900">Supplier</label>
                <Input value={transaction.supplierName} readOnly className="h-12 rounded-xl border-slate-200 bg-white shadow-sm" />
              </div>

              <div className="space-y-3">
                <label className="text-[16px] font-medium text-slate-900">Tanggal Tagih</label>
                <Input value={formatDate(transaction.transactionDate)} readOnly className="h-12 rounded-xl border-slate-200 bg-white shadow-sm" />
              </div>

              <Button
                onClick={() => setOpenPaymentModal(true)}
                disabled={transaction.totalUnpaid <= 0}
                className="h-11 rounded-xl bg-emerald-500 px-6 text-[18px] font-medium hover:bg-emerald-600"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Bayar
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-sm text-slate-500">Total Tagihan</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(transaction.totalAmount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-sm text-slate-500">Total Bayar</p>
                <p className="mt-1 text-xl font-semibold text-emerald-600">{formatCurrency(Math.max(transaction.totalPaid, totalPaidFromBillings))}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-sm text-slate-500">Sisa Tagihan</p>
                <p className="mt-1 text-xl font-semibold text-rose-600">{formatCurrency(transaction.totalUnpaid)}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[332px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search here" className="h-11 rounded-xl border-slate-200 bg-white pl-11 shadow-sm" />
            </div>
            <div className="flex items-center gap-3 text-[16px] text-slate-700">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }}>
                <SelectTrigger className="h-11 w-[68px] rounded-xl border-slate-200 bg-white shadow-sm">
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
              setEditingItem(null);
              setOpenItemModal(true);
            }}
            className="h-11 rounded-xl bg-[#1f4163] px-6 text-[18px] font-medium hover:bg-[#183552]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow className="border-slate-200">
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-900">NO</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">NAMA MATERIAL</TableHead>
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-900">QTY</TableHead>
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-900">HARGA SATUAN</TableHead>
                <TableHead className="px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-900">SUB TOTAL</TableHead>
                <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-900">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionQuery.isFetching && filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-slate-500">Memuat detail item...</TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-slate-500">Belum ada material pada transaksi ini.</TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item, index) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                    <TableCell className="px-5 py-4 text-center text-[16px] text-slate-800">{startData + index}</TableCell>
                    <TableCell className="px-5 py-4 text-[16px] text-slate-800">{item.material?.name ?? '-'}</TableCell>
                    <TableCell className="px-5 py-4 text-center text-[16px] text-slate-800">{item.qty}</TableCell>
                    <TableCell className="px-5 py-4 text-center text-[16px] text-slate-800">{item.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="px-5 py-4 text-center text-[16px] text-slate-800">{item.total.toLocaleString('id-ID')}</TableCell>
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
                              setEditingItem(item);
                              setOpenItemModal(true);
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteItem(item)} className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600">
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

        <div className="flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[14px] text-slate-500">Showing {startData}-{endData} of {filteredItems.length} data</p>
          <div className="flex items-center gap-1 text-[16px]">
            <Button variant="ghost" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="text-slate-700">
              Previous
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === safePage ? 'outline' : 'ghost'}
                onClick={() => setPage(pageNumber)}
                className={pageNumber === safePage ? 'h-10 min-w-10 rounded-xl border-slate-200 bg-white' : 'h-10 min-w-10 rounded-xl text-slate-700'}
              >
                {pageNumber}
              </Button>
            ))}
            {totalPages > 5 && safePage < totalPages - 2 ? <span className="px-2 text-slate-500">...</span> : null}
            {totalPages > 5 && !pageNumbers.includes(totalPages) ? (
              <Button variant="ghost" onClick={() => setPage(totalPages)} className="h-10 min-w-10 rounded-xl text-slate-700">
                {totalPages}
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="text-slate-700">
              Next
            </Button>
          </div>
        </div>
      </div>

      <PurchaseMaterialDetailItemModal
        open={openItemModal}
        onOpenChange={(open) => {
          setOpenItemModal(open);
          if (!open) {
            setEditingItem(null);
            setMaterialSearch('');
          }
        }}
        initialData={editingItem}
        transaction={transaction}
        materials={materialsQuery.data?.data ?? []}
        isLoadingMaterials={materialsQuery.isLoading}
        materialSearch={materialSearch}
        onMaterialSearchChange={setMaterialSearch}
        onSubmit={handleSubmitItem}
        isSubmitting={createItemMutation.isPending || updateItemMutation.isPending}
      />

      <PurchaseMaterialPaymentModal
        open={openPaymentModal}
        onOpenChange={setOpenPaymentModal}
        transaction={transaction}
        cashes={kasQuery.data?.data ?? []}
        isLoadingCashes={kasQuery.isLoading}
        onSubmit={handlePay}
        isSubmitting={createBillingMutation.isPending}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus detail pembelian?</AlertDialogTitle>
            <AlertDialogDescription>Detail material pada transaksi ini akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={deleteItemMutation.isPending} className="bg-red-600 hover:bg-red-700">
              {deleteItemMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
