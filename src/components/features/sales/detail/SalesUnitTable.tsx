import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { SalesLineItem } from '../sales.data';
import { Checkbox } from '@/components/ui/checkbox';
import { useBulkDeleteUnitItem, useDeleteUnitItem, usePurchaseUnitItems } from '@/hooks/useUnitTransactionItem';
import { useTypeUnits } from '@/hooks/useTypeUnit';
import { toast } from 'sonner';

interface Props {
  lineItems: SalesLineItem[];
  salesId: string;
  onAddUnit?: () => void;
}

export function SalesUnitTable({ lineItems, salesId, onAddUnit }: Props) {
  const router = useRouter();
  const { data: unitItemsData, isLoading, isError } = usePurchaseUnitItems(salesId);
  const { data: typeUnits } = useTypeUnits();
  const deleteMutation = useDeleteUnitItem();
  const bulkDeleteMutation = useBulkDeleteUnitItem();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
  const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';

  const items = useMemo(() => {
    return unitItemsData?.data ?? lineItems.map((item) => ({
      id: String(item.id),
      unit_transaction_id: String(salesId),
      unit_type_id: undefined,
      qty_total: Number(item.qty ?? 0),
      price: Number(item.hargaJual ?? 0),
      bbn_price: Number(item.biayaBbn ?? 0),
      expedition_fee: Number(item.biayaEkspedisi ?? 0),
      other_fee: Number(item.biayaLain ?? 0),
      hpp_total_price: Number(item.hpp ?? 0),
      dpp_total_price: Number(item.dpp ?? 0),
      ppn_total_price: Number(item.ppn ?? 0),
    }));
  }, [unitItemsData?.data, lineItems, salesId]);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [currentPage, perPage, items]);

  const getUnitTypeName = (id?: string) => {
    if (!id) return '-';
    return typeUnits?.data?.find((unitType) => String(unitType.id) === String(id))?.name ?? '-';
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
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync({ id: deleteId, purchaseId: salesId });
      toast.success('Unit item berhasil dihapus');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menghapus unit item');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error('Pilih minimal satu item');
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync({ ids, purchaseId: salesId });
      toast.success(`${ids.length} unit item berhasil dihapus`);
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal bulk delete unit item');
    }
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-6 py-5">
        <h3 className="text-xl font-semibold">Detail Penjualan Unit</h3>
        <p className="text-sm text-muted-foreground">Rincian lengkap unit yang dibeli</p>
      </div>

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
            onClick={() => setIsBulkDeleteOpen(true)}
          >
            Bulk Delete ({selectedIds.size})
          </Button>

          {onAddUnit && (
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={onAddUnit}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f5f6f8]">
            <TableRow>
              <TableHead className="px-4">No</TableHead>
              <TableHead className="px-4 text-center">
                <Checkbox checked={allPageSelected} onCheckedChange={(checked) => toggleAllPage(Boolean(checked))} aria-label="Pilih semua" />
              </TableHead>
              <TableHead className="px-4">TIPE UNIT</TableHead>
              <TableHead className="px-4">QTY</TableHead>
              <TableHead className="px-4">HARGA JUAL</TableHead>
              <TableHead className="px-4">BIAYA BBN</TableHead>
              <TableHead className="px-4">BIAYA EXPEDISI</TableHead>
              <TableHead className="px-4">BIAYA LAIN</TableHead>
              <TableHead className="px-4">HPP</TableHead>
              <TableHead className="px-4">DPP</TableHead>
              <TableHead className="px-4">PPN</TableHead>
              <TableHead className="px-4">JUMLAH</TableHead>
              <TableHead className="px-4 text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-20 text-center text-muted-foreground">
                  {isError ? 'Gagal memuat data' : isLoading ? 'Loading data...' : 'Tidak ada data'}
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4">{(currentPage - 1) * perPage + idx + 1}</TableCell>
                  <TableCell className="px-4 text-center">
                    <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={(checked) => toggleOne(item.id, Boolean(checked))} aria-label="Pilih baris" />
                  </TableCell>
                  <TableCell className="px-4">{getUnitTypeName(item.unit_type_id)}</TableCell>
                  <TableCell className="px-4">{item.qty_total}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.bbn_price)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.expedition_fee)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.other_fee)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.hpp_total_price ?? 0)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.dpp_total_price)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.ppn_total_price)}</TableCell>
                  <TableCell className="px-4">{formatCurrency((item.hpp_total_price ?? 0) + item.ppn_total_price + item.bbn_price + item.expedition_fee + item.other_fee)}</TableCell>
                  <TableCell className="px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`${basePath}/${salesId}/unit/${item.id}/edit`)}> <Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`${basePath}/${salesId}/unit/${item.id}`)}> <Eye className="mr-2 h-4 w-4" /> Detail</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => setDeleteId(item.id)}> <Trash2 className="mr-2 h-4 w-4" />
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
      </div>

      <div className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
        <span>
          Showing {items.length === 0 ? 0 : (currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, items.length)} of {items.length} data
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            {currentPage}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data unit?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data unit terpilih?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleBulkDelete}>
              {bulkDeleteMutation.isPending ? 'Menghapus...' : 'Hapus Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
