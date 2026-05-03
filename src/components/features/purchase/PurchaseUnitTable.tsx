'use client';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { UnitTransactionItem } from '@/@types/unit-transaction.types';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useBulkDeleteUnitItem, useDeleteUnitItem, usePurchaseUnitItems } from '@/hooks/useUnitTransactionItem';
import { useTypeUnits } from '@/hooks/useTypeUnit';
import { formatCurrency } from '@/lib/utils/currency';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  purchaseId: string;
  slug: string;
}

export default function PurchaseUnitTable({ purchaseId, slug }: Props) {
  const router = useRouter();
  const { data, isLoading, isError } = usePurchaseUnitItems(purchaseId);
  const { data: typeUnits } = useTypeUnits();
  const deleteMutation = useDeleteUnitItem();
  const bulkDeleteMutation = useBulkDeleteUnitItem();

  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const items: UnitTransactionItem[] = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [currentPage, perPage, items]);

  const getUnitTypeName = (id?: string | number) => {
    if (!id) return '-';
    return typeUnits?.data?.find((type) => String(type.id) === String(id))?.name ?? String(id);
  };

  const allPageSelected = pagedData.length > 0 && pagedData.every((item) => selectedIds.has(item.id));

  const toggleAllPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        pagedData.forEach((item) => next.add(item.id));
      } else {
        pagedData.forEach((item) => next.delete(item.id));
      }
      return next;
    });
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // DELETE HANDLER
  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: unitToDelete, purchaseId });
      toast.success('Unit item berhasil dihapus');
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(unitToDelete); return next; });
      setUnitToDelete(null);
    } catch {
      toast.error('Gagal menghapus unit item');
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error('Pilih minimal satu item untuk dihapus');
      return;
    }
    try {
      await bulkDeleteMutation.mutateAsync({ ids, purchaseId });
      toast.success(`${ids.length} unit item berhasil dihapus`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch {
      toast.error('Gagal menghapus beberapa unit item');
    }
  };

  // ACTIONS
  const handleDetail = (unitId: string) => {
    router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchaseId}/unit/${unitId}`);
  };

  const handleEdit = (unitId: string) => {
    router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchaseId}/unit/${unitId}/edit`);
  };

  return (
    <div className="space-y-4">
      {/* Container — matches SalesUnitTable style */}
      <div className="rounded-xl border bg-white">

        {/* Header */}
        <div className="border-b px-6 py-5">
          <h3 className="text-xl font-semibold">Detail Pembelian Unit</h3>
          <p className="text-sm text-muted-foreground">Rincian lengkap unit yang dibeli</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
            <Select
              value={String(perPage)}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-18 bg-white">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm">Page</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.size === 0 || bulkDeleteMutation.isPending}
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Bulk Delete ({selectedIds.size})
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchaseId}/create-unit`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f5f6f8]">
              <TableRow>
                <TableHead className="px-4">No</TableHead>
                <TableHead className="px-4 text-center">
                  <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={(checked) => toggleAllPage(Boolean(checked))}
                    aria-label="Pilih semua"
                  />
                </TableHead>
                <TableHead className="px-4">TIPE UNIT</TableHead>
                <TableHead className="px-4">QTY</TableHead>
                <TableHead className="px-4">PRICE</TableHead>
                <TableHead className="px-4">BBN</TableHead>
                <TableHead className="px-4">EXPEDITION FEE</TableHead>
                <TableHead className="px-4">OTHER FEE</TableHead>
                <TableHead className="px-4">DPP TOTAL</TableHead>
                <TableHead className="px-4">PPN TOTAL</TableHead>
                <TableHead className="px-4 text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-20 text-center text-destructive">
                    Gagal memuat unit item
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-20 text-center text-muted-foreground">
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : pagedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-20 text-center text-muted-foreground">
                    Belum ada unit item.
                  </TableCell>
                </TableRow>
              ) : (
                pagedData.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-4">{(currentPage - 1) * perPage + idx + 1}</TableCell>
                    <TableCell className="px-4 text-center">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) => toggleOne(item.id, Boolean(checked))}
                        aria-label="Pilih baris"
                      />
                    </TableCell>
                    <TableCell className="px-4">{getUnitTypeName(item.unit_type_id)}</TableCell>
                    <TableCell className="px-4">{item.qty_total}</TableCell>
                    <TableCell className="px-4">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="px-4">{formatCurrency(item.bbn_price)}</TableCell>
                    <TableCell className="px-4">{formatCurrency(item.expedition_fee)}</TableCell>
                    <TableCell className="px-4">{formatCurrency(item.other_fee)}</TableCell>
                    <TableCell className="px-4">{formatCurrency(item.dpp_total_price)}</TableCell>
                    <TableCell className="px-4">{formatCurrency(item.ppn_total_price)}</TableCell>
                    <TableCell className="px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDetail(item.id)}>
                            <Eye className="mr-2 h-4 w-4" /> Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => setUnitToDelete(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
          <span>
            Showing {items.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, items.length)} of {items.length} data
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              {currentPage}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete single */}
      <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data unit?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data unit terpilih?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {bulkDeleteMutation.isPending ? 'Menghapus...' : 'Hapus Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
