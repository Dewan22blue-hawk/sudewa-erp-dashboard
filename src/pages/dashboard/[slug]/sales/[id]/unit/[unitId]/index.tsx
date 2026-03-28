import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft, Loader2, MoreVertical, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useSalesDetail } from '@/hooks/useSales';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useCreateUnitItemDetail, useDeleteUnitItemDetail, useImportUnitItemDetails, useUnitItemDetails } from '@/hooks/useUnitItemDetail';
import { UnitTransactionItemDetail } from '@/@types/unit-transaction.types';
import { useUpdateUnitItemDetail } from '@/hooks/useUnitItemDetail';

type UnitDetailRow = {
  id: string;
  no: number;
  color: string;
  machine: string;
  chassis: string;
  inStock: boolean;
};

export default function SalesUnitDetailPage() {
  const router = useRouter();
  const { id, unitId, slug } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const selectedUnitId = Array.isArray(unitId) ? unitId[0] : unitId;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: salesData, isLoading: salesLoading, isError: salesError } = useSalesDetail(salesId);
  const { data: detailResponse, isLoading: detailLoading, isError: detailError } = useUnitItemDetails(selectedUnitId);

  const createMutation = useCreateUnitItemDetail();
  const updateMutation = useUpdateUnitItemDetail();
  const deleteMutation = useDeleteUnitItemDetail();
  const importMutation = useImportUnitItemDetails();

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitTransactionItemDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnitTransactionItemDetail | null>(null);
  const [formValues, setFormValues] = useState({
    color: '',
    machine_number: '',
    chassis_number: '',
  });

  const parseApiError = (error: any): string => {
    const details = error?.details ?? error?.response?.data?.errors;

    if (typeof details === 'string' && details.trim()) {
      return details;
    }

    if (details && typeof details === 'object') {
      const text = Object.entries(details)
        .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : String(value)}`)
        .join(', ')
        .trim();

      if (text) return text;
    }

    return error?.message || 'Validation failed';
  };

  const details = useMemo(() => detailResponse?.data ?? [], [detailResponse?.data]);

  const rows = useMemo<UnitDetailRow[]>(() => {
    return details.map((item, index) => ({
      id: item.id,
      no: index + 1,
      color: item.color,
      machine: item.machine_number,
      chassis: item.chassis_number,
      inStock: Boolean(item.in_stock),
    }));
  }, [details]);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return rows.slice(start, start + perPage);
  }, [rows, currentPage, perPage]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormValues({ color: '', machine_number: '', chassis_number: '' });
    setOpenForm(true);
  };

  const openEditForm = (item: UnitTransactionItemDetail) => {
    setEditingItem(item);
    setFormValues({
      color: item.color ?? '',
      machine_number: item.machine_number ?? '',
      chassis_number: item.chassis_number ?? '',
    });
    setOpenForm(true);
  };

  const validateForm = (): string | null => {
    const color = formValues.color.trim();
    const machineNumber = formValues.machine_number.trim();
    const chassisNumber = formValues.chassis_number.trim();

    if (!color || !machineNumber || !chassisNumber) return 'Semua field wajib diisi';

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!selectedUnitId) {
      toast.error('Unit transaction item tidak valid');
      return;
    }

    const payload = {
      unit_transaction_item_id: selectedUnitId,
      color: formValues.color.trim(),
      machine_number: formValues.machine_number.trim(),
      chassis_number: formValues.chassis_number.trim(),
    };

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
        toast.success('Detail unit berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Detail unit berhasil ditambahkan');
      }
      setOpenForm(false);
      setEditingItem(null);
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedUnitId) return;

    try {
      await deleteMutation.mutateAsync({
        id: deleteTarget.id,
        unitItemId: selectedUnitId,
      });
      toast.success('Detail unit berhasil dihapus');
      setDeleteTarget(null);
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  const openImportPicker = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !selectedUnitId) return;

    try {
      await importMutation.mutateAsync({ unitItemId: selectedUnitId, file });
      toast.success('Import detail unit berhasil');
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  const salesCode = salesData?.raw?.code ?? '-';
  const slugValue = Array.isArray(slug) ? slug[0] : slug || '';
  const salesPath = slugValue ? `/dashboard/${slugValue}/sales` : '/sales';

  if (salesLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (salesError || !salesData?.ui) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Data penjualan tidak ditemukan</p>
          <Button onClick={() => router.push(salesPath)}>Kembali ke List Penjualan</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Detail Penjualan Unit</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Jual</span>
              <span className="text-blue-600 font-medium">{salesCode}</span>
            </div>
          </div>
        </div>

        <SalesDetailCards data={salesData.ui} />

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Detail Unit Item</h3>
                  <p className="text-sm text-muted-foreground">Rincian lengkap unit yang didistribusikan</p>
                </div>

                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
                  <Button size="sm" variant="outline" onClick={openImportPicker} disabled={importMutation.isPending}>
                    <Upload className="mr-2 h-4 w-4" />
                    {importMutation.isPending ? 'Importing...' : 'Import'}
                  </Button>
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={openCreateForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Unit
                  </Button>
                </div>
              </div>

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
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">Page</span>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Warna</TableHead>
                      <TableHead>Nomor Mesin</TableHead>
                      <TableHead>Nomor Rangka</TableHead>
                      <TableHead>Status Stock</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                          Memuat detail unit...
                        </TableCell>
                      </TableRow>
                    ) : detailError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-20 text-center text-destructive">
                          Gagal memuat detail unit
                        </TableCell>
                      </TableRow>
                    ) : pagedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                          Tidak ada detail unit
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRows.map((row) => {
                        const source = details.find((item) => item.id === row.id);
                        if (!source) return null;

                        return (
                          <TableRow key={row.id}>
                            <TableCell>{row.no}</TableCell>
                            <TableCell>{row.color}</TableCell>
                            <TableCell>{row.machine}</TableCell>
                            <TableCell>{row.chassis}</TableCell>
                            <TableCell>{row.inStock ? 'In Stock' : 'Out Stock'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditForm(source)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => setDeleteTarget(source)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {rows.length === 0 ? 0 : (currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, rows.length)} of {rows.length} data
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    {currentPage}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Detail Unit' : 'Tambah Detail Unit'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warna</label>
              <Input value={formValues.color} onChange={(event) => setFormValues((prev) => ({ ...prev, color: event.target.value }))} placeholder="Masukkan warna" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Mesin</label>
              <Input value={formValues.machine_number} onChange={(event) => setFormValues((prev) => ({ ...prev, machine_number: event.target.value }))} placeholder="Masukkan nomor mesin" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Rangka</label>
              <Input value={formValues.chassis_number} onChange={(event) => setFormValues((prev) => ({ ...prev, chassis_number: event.target.value }))} placeholder="Masukkan nomor rangka" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpenForm(false)}>
              Batal
            </Button>
            <Button
              type="button"
              className="bg-slate-900 hover:bg-slate-800 text-white"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Detail Unit</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
