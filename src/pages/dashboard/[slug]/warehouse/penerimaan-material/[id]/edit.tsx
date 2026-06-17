import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, MoreVertical, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { GoodsReceiptFormModal } from '@/components/features/goods-receipt/GoodsReceiptFormModal';
import { GoodsReceiptItemModal } from '@/components/features/goods-receipt/GoodsReceiptItemModal';
import type { GoodsReceiptItem } from '@/@types/goods-receipt.types';
import { useCompany } from '@/contexts/CompanyContext';
import { useMaterials } from '@/hooks/useMaterial';
import {
  useCreateGoodsReceiptItem,
  useDeleteGoodsReceiptItem,
  useGoodsReceipt,
  useUpdateGoodsReceipt,
  useUpdateGoodsReceiptItem,
} from '@/hooks/useGoodsReceipt';
import { useSuppliers } from '@/hooks/useSupplier';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import type { GoodsReceiptFormValues, GoodsReceiptItemFormValues } from '@/scheme/goods-receipt.schema';
import { formatCurrency, formatLongDate } from '@/components/features/goods-receipt/goods-receipt.utils';

export default function GoodsReceiptEditPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const companyIdValue = Number(companyId ?? '3') || 3;
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const rawId = typeof router.query.id === 'string' ? Number(router.query.id) : NaN;
  const id = Number.isFinite(rawId) ? rawId : undefined;

  const query = useGoodsReceipt(id);
  const suppliersQuery = useSuppliers(String(companyIdValue));
  const materialsQuery = useMaterials({ page: 1, perPage: 100, sort_order: 'asc' });
  const updateReceiptMutation = useUpdateGoodsReceipt();
  const createItemMutation = useCreateGoodsReceiptItem();
  const updateItemMutation = useUpdateGoodsReceiptItem();
  const deleteItemMutation = useDeleteGoodsReceiptItem();

  const [headerOpen, setHeaderOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GoodsReceiptItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoodsReceiptItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');

  const receipt = query.data;

  const filteredItems = useMemo(() => {
    const source = receipt?.goodsTransactionDetails ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter((item) =>
      [item.material?.code, item.material?.name, item.type, item.description, String(item.qty)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [receipt?.goodsTransactionDetails, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => {
    if (selectedIds.length === 0) return;
    const validIds = new Set((receipt?.goodsTransactionDetails ?? []).map((item) => item.id));
    setSelectedIds((current) => current.filter((item) => validIds.has(item)));
  }, [receipt?.goodsTransactionDetails, selectedIds.length]);

  const handleUpdateHeader = async (values: GoodsReceiptFormValues) => {
    if (!receipt) return;
    try {
      await updateReceiptMutation.mutateAsync({
        id: receipt.id,
        payload: {
          supplierId: values.supplierId,
          transactionDate: values.transactionDate,
          description: values.description,
          location: receipt.location,
          companyId: receipt.companyId || companyIdValue,
        },
      });
      toast.success('Header penerimaan material berhasil diperbarui');
      setHeaderOpen(false);
    } catch (error) {
      const message = error instanceof ApiValidationError || error instanceof ApiResponseError ? error.message : 'Gagal memperbarui data penerimaan material';
      toast.error(message);
    }
  };

  const handleSaveItem = async (values: GoodsReceiptItemFormValues) => {
    if (!receipt) return;
    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          payload: {
            goodsTransactionId: receipt.id,
            materialId: values.materialId,
            qty: values.qty,
            type: values.type,
            price: values.price,
            description: values.description,
          },
        });
        toast.success('Detail material berhasil diperbarui');
      } else {
        await createItemMutation.mutateAsync({
          goodsTransactionId: receipt.id,
          materialId: values.materialId,
          qty: values.qty,
          type: values.type,
          price: values.price,
          description: values.description,
        });
        toast.success('Detail material berhasil ditambahkan');
      }

      setItemOpen(false);
      setEditingItem(null);
    } catch (error) {
      const message = error instanceof ApiValidationError || error instanceof ApiResponseError ? error.message : 'Gagal menyimpan detail material';
      toast.error(message);
    }
  };

  const handleDeleteItem = async () => {
    if (!receipt) return;
    const targets = deleteTarget ? [deleteTarget.id] : selectedIds;
    if (targets.length === 0) return;

    try {
      await Promise.all(targets.map((targetId) => deleteItemMutation.mutateAsync({ id: targetId, goodsTransactionId: receipt.id })));
      toast.success('Detail material berhasil dihapus');
      setDeleteTarget(null);
      setSelectedIds([]);
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus detail material';
      toast.error(message);
    }
  };

  if (query.isLoading) {
    return <DashboardLayout><div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Memuat data edit penerimaan material...</div></DashboardLayout>;
  }

  if (!receipt) {
    return <DashboardLayout><div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600">Data penerimaan material tidak ditemukan.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="h-auto p-0 text-slate-600 hover:bg-transparent hover:text-slate-900">
            <Link href={`/dashboard/${slug}/warehouse/penerimaan-material`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-[24px] font-semibold text-slate-900">Data Penerimaan Material</h1>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <h2 className="text-[18px] font-semibold text-slate-900">Infromasi Penerimaan</h2>
              <Button onClick={() => setHeaderOpen(true)} className="h-10 rounded-[10px] bg-[#1f4163] px-5 text-[16px] hover:bg-[#183552]">Simpan Header</Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-slate-900">Kode Pembelian</label>
                <Input value={receipt.code} readOnly className="h-11 rounded-xl border-slate-200 text-[16px] text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-slate-900">Tanggal Pembelian</label>
                <Input value={formatLongDate(receipt.transactionDate)} readOnly className="h-11 rounded-xl border-slate-200 text-[16px]" />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-slate-900">Total Harga Beli</label>
                <Input value={formatCurrency(receipt.totalBrutto)} readOnly className="h-11 rounded-xl border-slate-200 text-[16px]" />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-slate-900">Supplier</label>
                <Input value={receipt.supplier?.name ?? '-'} readOnly className="h-11 rounded-xl border-slate-200 text-[16px]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] font-medium text-slate-900">Keterangan</label>
              <Textarea value={receipt.description ?? ''} readOnly rows={4} className="rounded-xl border-slate-200 text-[16px]" />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[328px]">
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
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>

          <Button onClick={() => { setEditingItem(null); setItemOpen(true); }} className="h-11 rounded-xl bg-[#0ec447] px-6 text-[18px] font-medium hover:bg-[#0ba63b]">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[14px] text-slate-500">{selectedIds.length > 0 ? `${selectedIds.length} data terpilih` : 'Pilih data untuk menghapus banyak item'}</p>
          <Button variant="outline" onClick={() => setDeleteTarget({ id: 0 } as GoodsReceiptItem)} disabled={selectedIds.length === 0} className="border-red-300 text-red-600 hover:text-red-700">
            Hapus
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow className="border-slate-200">
                <TableHead className="w-10 px-3 py-4">
                  <Checkbox
                    checked={pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(Array.from(new Set([...selectedIds, ...pageItems.map((item) => item.id)])));
                        return;
                      }
                      setSelectedIds((current) => current.filter((item) => !pageItems.some((pageItem) => pageItem.id === item)));
                    }}
                  />
                </TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">NO</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">KODE BARANG</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">NAMA BARANG</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">QTY</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">SATUAN</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">HARGA SATUAN</TableHead>
                <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-900">TOTAL</TableHead>
                <TableHead className="px-5 py-4 text-right text-[14px] font-semibold uppercase text-slate-900">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-slate-500">Belum ada detail material.</TableCell>
                </TableRow>
              ) : pageItems.map((item, index) => (
                <TableRow key={item.id} className="border-slate-200">
                  <TableCell className="px-3 py-4">
                    <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(checked) => setSelectedIds((current) => checked ? [...current, item.id] : current.filter((value) => value !== item.id))} />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{(safePage - 1) * perPage + index + 1}</TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{item.material?.code ?? '-'}</TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{item.material?.name ?? '-'}</TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{item.qty}</TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{item.type}</TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="px-5 py-4 text-[15px]">{formatCurrency(item.total)}</TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-2xl border-slate-200 p-2 shadow-lg">
                        <DropdownMenuItem onClick={() => { setEditingItem(item); setItemOpen(true); }} className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600">Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[14px] text-slate-500">Showing {filteredItems.length === 0 ? 0 : (safePage - 1) * perPage + 1}-{Math.min(safePage * perPage, filteredItems.length)} of {filteredItems.length} data</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1}>Previous</Button>
            <Button variant="outline" className="h-10 min-w-10 rounded-xl border-slate-200 bg-white">{safePage}</Button>
            <Button variant="ghost" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages}>Next</Button>
          </div>
        </div>
      </div>

      <GoodsReceiptFormModal
        open={headerOpen}
        onOpenChange={setHeaderOpen}
        onSubmit={handleUpdateHeader}
        isSubmitting={updateReceiptMutation.isPending}
        initialData={receipt}
        suppliers={suppliersQuery.data?.data ?? []}
        isLoadingSuppliers={suppliersQuery.isLoading}
        supplierSearch={supplierSearch}
        onSupplierSearchChange={setSupplierSearch}
      />

      <GoodsReceiptItemModal
        open={itemOpen}
        onOpenChange={(open) => { setItemOpen(open); if (!open) setEditingItem(null); }}
        onSubmit={handleSaveItem}
        isSubmitting={createItemMutation.isPending || updateItemMutation.isPending}
        initialData={editingItem}
        materials={materialsQuery.data?.data ?? []}
        isLoadingMaterials={materialsQuery.isLoading}
        materialSearch={materialSearch}
        onMaterialSearchChange={setMaterialSearch}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus detail material?</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget?.id ? `Data ${deleteTarget.material?.name ?? deleteTarget.id} akan dihapus.` : `${selectedIds.length} data terpilih akan dihapus.`}</AlertDialogDescription>
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
