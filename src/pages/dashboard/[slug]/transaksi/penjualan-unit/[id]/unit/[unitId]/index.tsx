import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2, ChevronRight, Badge, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { WarehouseStockUnit } from '@/@types/unit-transaction.types';
import { StockPickerTable } from '@/components/features/sales/detail/StockPickerTable';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSalesDetail } from '@/hooks/useSales';
import { useStockUnits, useAssignUnitItemSales, useDispatchStockLifecycle } from '@/hooks/useUnitTransactionItemSales';
import { useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useTypeUnit } from '@/hooks/useTypeUnit';

const readApiError = (error: any): string => {
  const statusCode = error?.statusCode ?? error?.response?.status;

  if (statusCode === 422) {
    return 'Stock tidak mencukupi atau unit yang dipilih sudah tidak tersedia';
  }

  if (statusCode === 403) {
    return 'State transaksi tidak valid untuk aksi ini';
  }

  if (statusCode === 500) {
    return 'Terjadi kesalahan server. Silakan coba beberapa saat lagi';
  }

  const details = error?.details ?? error?.response?.data?.errors;
  if (typeof details === 'string' && details.trim()) return details;

  if (details && typeof details === 'object') {
    const text = Object.entries(details)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : String(value)}`)
      .join(', ')
      .trim();
    if (text) return text;
  }

  return error?.message || 'Validation failed';
};

const toNumberId = (value: unknown): number => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
};

export default function SalesUnitDetailPage() {
  const router = useRouter();
  const { id, unitId, slug } = router.query;

  const pathParts = String(router.asPath ?? '')
    .split('?')[0]
    .split('/')
    .filter(Boolean);
  const fallbackSalesId = pathParts[3];
  const fallbackUnitId = pathParts[5];

  const salesId = (Array.isArray(id) ? id[0] : id) ?? fallbackSalesId;
  const selectedUnitId = (Array.isArray(unitId) ? unitId[0] : unitId) ?? fallbackUnitId;

  const {
    data: salesData,
    isLoading: salesLoading,
    isError: salesError,
  } = useSalesDetail(salesId);

  const fallbackUnitItemFromSales = useMemo(() => {
    const rows = salesData?.raw?.unit_transaction_items ?? [];
    const hit = rows.find((item) => String(item?.id ?? '') === String(selectedUnitId ?? ''));
    if (!hit) return null;

    return {
      id: String(hit.id ?? ''),
      unit_transaction_id: String(salesId ?? ''),
      unit_type_id: String(hit.unit_type_id ?? ''),
      qty_total: Number(hit.qty_total ?? 0),
      unit_transaction_item_details: (hit.unit_transaction_item_details ?? []).map((detail: any) => ({
        id: Number(detail?.id ?? 0),
        color: String(detail?.color ?? '-'),
        machine_number: String(detail?.machine_number ?? '-'),
        chassis_number: String(detail?.chassis_number ?? '-'),
        in_stock: true,
      })),
      unit_transaction_item_sales: (hit.unit_transaction_item_sales ?? []).map((item: any) => ({
        id: Number(item?.id ?? 0),
        unit_transaction_item_id: Number(hit.id ?? 0),
        unit_transaction_item_detail_id: Number(item?.unit_transaction_item_detail_id ?? 0),
      })),
    };
  }, [salesData?.raw?.unit_transaction_items, selectedUnitId, salesId]);

  const companyId = String((salesData?.raw as any)?.company_id ?? '1');
  const fallbackUnitTypeId = String(fallbackUnitItemFromSales?.unit_type_id ?? selectedUnitId ?? '');

  const {
    unitItem,
    stockUnits,
    isUnitItemLoading,
    isStockLoading,
    isUnitItemError,
    isStockError,
    stockError,
  } = useStockUnits(selectedUnitId, { companyId, unitTypeIdFallback: fallbackUnitTypeId });

  const effectiveUnitItem = unitItem ?? fallbackUnitItemFromSales;

  const {
    data: unitTypeData,
    isLoading: unitTypeLoading,
  } = useTypeUnit(fallbackUnitTypeId);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const assignMutation = useAssignUnitItemSales();
  const dispatchMutation = useDispatchStockLifecycle();
  const updateStateMutation = useUpdateUnitTransactionState();

  const requiredQty = Number(effectiveUnitItem?.qty_total ?? 0);

  const assignedDetailRows = useMemo<WarehouseStockUnit[]>(() => {
    const mappedFromItemDetails = (effectiveUnitItem?.unit_transaction_item_details ?? []).map((detail: any) => ({
      id: toNumberId(detail?.id),
      color: String(detail?.color ?? '-'),
      machine_number: String(detail?.machine_number ?? '-'),
      chassis_number: String(detail?.chassis_number ?? '-'),
      in_stock: detail?.in_stock,
    }));

    const detailLookup = new Map<number, WarehouseStockUnit>();
    stockUnits.forEach((detail: WarehouseStockUnit) => {
      detailLookup.set(detail.id, detail);
    });
    mappedFromItemDetails.forEach((detail: any) => {
      detailLookup.set(detail.id, detail);
    });

    const assignedBySales = (effectiveUnitItem?.unit_transaction_item_sales ?? [])
      .map((row: any) => toNumberId(row?.unit_transaction_item_detail_id))
      .filter((detailId: number) => detailId > 0)
      .map((detailId: number) =>
        detailLookup.get(detailId) ?? {
          id: detailId,
          color: '-',
          machine_number: '-',
          chassis_number: '-',
          in_stock: false,
        },
      );

    if (mappedFromItemDetails.length > 0) {
      return mappedFromItemDetails;
    }

    return assignedBySales;
  }, [stockUnits, effectiveUnitItem?.unit_transaction_item_details, effectiveUnitItem?.unit_transaction_item_sales]);

  const assignedIds = useMemo(() => {
    return assignedDetailRows.map((item: any) => item.id).filter((item: number) => item > 0);
  }, [assignedDetailRows]);

  const pickerRows = useMemo(() => {
    const merged = new Map<number, WarehouseStockUnit>();

    stockUnits.forEach((item: any) => {
      merged.set(item.id, item);
    });

    assignedDetailRows.forEach((item: any) => {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    });

    const result = Array.from(merged.values());
    result.sort((a, b) => {
      const aSelected = selectedIds.has(a.id) ? 1 : 0;
      const bSelected = selectedIds.has(b.id) ? 1 : 0;
      return bSelected - aSelected;
    });
    
    return result;
  }, [stockUnits, assignedDetailRows, selectedIds]);

  useEffect(() => {
    const next = new Set(assignedIds);
    setSelectedIds((prev) => {
      if (prev.size === next.size) {
        let isSame = true;
        for (const id of prev) {
          if (!next.has(id)) {
            isSame = false;
            break;
          }
        }
        if (isSame) return prev;
      }

      return next;
    });
  }, [assignedIds]);

  useEffect(() => {
    if (!isStockError) return;
    toast.error(readApiError(stockError));
  }, [isStockError, stockError]);

  const selectedCount = selectedIds.size;

  const canAssignStock = requiredQty > 0 && selectedCount === requiredQty;

  const salesCode = salesData?.raw?.code ?? '-';
  const slugValue = Array.isArray(slug) ? slug[0] : slug || '';
  const salesPath = slugValue ? `/dashboard/${slugValue}/transaksi/penjualan-unit` : '/transaksi/penjualan-unit';
  const hasRequiredRouteParams = Boolean(salesId && selectedUnitId);

  const toggleOne = (stockId: number, checked: boolean) => {
    if (checked && selectedIds.size >= requiredQty) {
      toast.error(`Maksimal ${requiredQty} unit yang dapat dipilih`);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(stockId);
      } else {
        next.delete(stockId);
      }
      return next;
    });
  };

  const toggleAllPage = (checked: boolean) => {
    if (checked && selectedIds.size >= requiredQty) {
      toast.error(`Maksimal ${requiredQty} unit yang dapat dipilih`);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const filteredRows = pickerRows.filter((item: any) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;

        return [item.color, item.machine_number, item.chassis_number].some((field) =>
          String(field ?? '')
            .toLowerCase()
            .includes(query),
        );
      });

      const start = (currentPage - 1) * perPage;
      const pageRows = filteredRows.slice(start, start + perPage);

      if (checked) {
        let remaining = requiredQty - next.size;
        pageRows.forEach((item) => {
          if (!next.has(item.id) && remaining > 0) {
            next.add(item.id);
            remaining--;
          }
        });
        if (remaining === 0 && pageRows.length > 0 && next.size === requiredQty) {
          toast.success(`Berhasil memilih ${requiredQty} unit (maksimal)`);
        }
      } else {
        pageRows.forEach((item) => next.delete(item.id));
      }

      return next;
    });
  };

  const handleAssignStock = async () => {
    if (!selectedUnitId) {
      toast.error('Unit transaction item tidak valid');
      setIsAssignDialogOpen(false);
      return;
    }

    if (!requiredQty || requiredQty <= 0) {
      toast.error('Qty item tidak valid');
      setIsAssignDialogOpen(false);
      return;
    }

    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error('Pilih minimal 1 stock unit');
      setIsAssignDialogOpen(false);
      return;
    }

    if (ids.length !== requiredQty) {
      toast.error(`Jumlah unit yang dipilih harus sama dengan qty item (${requiredQty})`);
      setIsAssignDialogOpen(false);
      return;
    }

    try {
      const isUpdate = assignedIds.length > 0;
      await assignMutation.mutateAsync({
        unitTransactionItemId: selectedUnitId,
        unitTransactionDetails: ids,
        isUpdate,
      });

      toast.success('Stock berhasil di-assign ke item sales');
      setIsAssignDialogOpen(false);
    } catch (error: any) {
      toast.error(readApiError(error));
      setIsAssignDialogOpen(false);
    }
  };

  if (!router.isReady && !hasRequiredRouteParams) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hasRequiredRouteParams) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">URL detail penjualan tidak valid</p>
          <Button onClick={() => router.push(salesPath)}>Kembali ke List Penjualan</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (salesLoading || isUnitItemLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (salesError || !salesData?.ui || !salesData?.raw || (isUnitItemError && !fallbackUnitItemFromSales) || !effectiveUnitItem) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Data penjualan atau item unit tidak ditemukan</p>
          <Button onClick={() => router.push(salesPath)}>Kembali ke List Penjualan</Button>
        </div>
      </DashboardLayout>
    );
  }

  const resolvedBillingHistories = (salesData?.raw?.unit_transaction_billing?.unit_transaction_billing_histories ?? []).map((history: any) => ({
    id: String((history as any).id ?? ''),
    unit_transaction_billing_id: String((history as any).unit_transaction_billing_id ?? salesData?.raw?.unit_transaction_billing?.id ?? ''),
    unit_transaction_id: String(salesId ?? ''),
    payment_proof: (history as any).payment_proof ?? null,
    bca_payment_amount: Number((history as any).bca_payment_amount ?? (history as any).bca_payment ?? 0),
    cash_payment_amount: Number((history as any).cash_payment_amount ?? (history as any).cash_payment ?? 0),
    bca_payment_usd_amount: Number((history as any).bca_payment_usd_amount ?? (history as any).bca_payment_2 ?? 0),
    payment_at: String((history as any).payment_at ?? ''),
    note: (history as any).note,
    created_at: (history as any).created_at,
    updated_at: (history as any).updated_at,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit`)}>
            Penjualan Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit/${salesId}`)}>
            Detail Penjualan
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-800">Detail Unit</span>
        </div>

        {/* Title Section */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit/${salesId}`)} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Data Penjualan</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Kode Jual:</span>
                <span className="font-semibold text-blue-600">{salesCode}</span>
              </div>
            </div>
          </div>
        </div>

        <SalesDetailCards data={salesData.ui} billingHistories={resolvedBillingHistories} unitType={unitTypeData} />

        <Card className="rounded-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Detail Penjualan Unit</h3>
                <p className="text-sm text-muted-foreground">Pilih stock unit yang tersedia untuk dijual</p>
              </div>
            </div>

            <StockPickerTable
              units={pickerRows}
              selectedIds={selectedIds}
              unitType={unitTypeData}
              onToggleOne={toggleOne}
              onToggleAllPage={toggleAllPage}
              currentPage={currentPage}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
              isLoading={isStockLoading}
              isError={isStockError}
              searchValue={search}
              searchAction={(
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!canAssignStock || assignMutation.isPending || dispatchMutation.isPending || updateStateMutation.isPending}
                  onClick={() => setIsAssignDialogOpen(true)}
                >
                  {assignMutation.isPending ? 'Menyimpan...' : `Unit Terjual (${selectedCount}/${requiredQty})`}
                </Button>
              )}
              onSearchChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* CONFIRMATION DIALOG ASSIGN UNIT */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Unit Terjual</DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menetapkan unit ini sebagai barang terjual?
            </DialogDescription>
            <div className="border border-slate-200 bg-slate-50 text-slate-700 text-sm rounded-md p-2 text-justify">
              <div className="flex gap-2">
                <span>
                  <Info />
                </span>
                <span>
                  Dengan memilih <b>Unit Terjual</b>, unit stock ini akan dialokasikan untuk transaksi ini dan tidak bisa dipilih oleh transaksi penjualan lainnya.
                </span>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={assignMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAssignStock}
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Memproses...' : 'Ya, Tetapkan Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
