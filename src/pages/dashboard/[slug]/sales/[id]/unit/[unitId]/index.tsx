import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
      unit_transaction_item_details: (hit.unit_transaction_item_details ?? []).map((detail) => ({
        id: Number(detail?.id ?? 0),
        color: String(detail?.color ?? '-'),
        machine_number: String(detail?.machine_number ?? '-'),
        chassis_number: String(detail?.chassis_number ?? '-'),
        in_stock: true,
      })),
      unit_transaction_item_sales: (hit.unit_transaction_item_sales ?? []).map((item) => ({
        id: Number(item?.id ?? 0),
        unit_transaction_item_id: Number(hit.id ?? 0),
        unit_transaction_item_detail_id: Number(item?.unit_transaction_item_detail_id ?? 0),
      })),
    };
  }, [salesData?.raw?.unit_transaction_items, selectedUnitId, salesId]);

  const companyId = String(salesData?.raw?.company_id ?? '1');
  const fallbackUnitTypeId = String(fallbackUnitItemFromSales?.unit_type_id ?? '');

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

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const assignMutation = useAssignUnitItemSales();
  const dispatchMutation = useDispatchStockLifecycle();
  const updateStateMutation = useUpdateUnitTransactionState();

  const requiredQty = Number(effectiveUnitItem?.qty_total ?? 0);

  const assignedDetailRows = useMemo<WarehouseStockUnit[]>(() => {
    const mappedFromItemDetails = (effectiveUnitItem?.unit_transaction_item_details ?? []).map((detail) => ({
      id: toNumberId(detail?.id),
      color: String(detail?.color ?? '-'),
      machine_number: String(detail?.machine_number ?? '-'),
      chassis_number: String(detail?.chassis_number ?? '-'),
      in_stock: detail?.in_stock,
    }));

    const detailLookup = new Map<number, WarehouseStockUnit>();
    stockUnits.forEach((detail) => {
      detailLookup.set(detail.id, detail);
    });
    mappedFromItemDetails.forEach((detail) => {
      detailLookup.set(detail.id, detail);
    });

    const assignedBySales = (effectiveUnitItem?.unit_transaction_item_sales ?? [])
      .map((row) => toNumberId(row?.unit_transaction_item_detail_id))
      .filter((detailId) => detailId > 0)
      .map((detailId) =>
        detailLookup.get(detailId) ?? {
          id: detailId,
          color: '-',
          machine_number: '-',
          chassis_number: '-',
          in_stock: false,
        },
      );

    if (assignedBySales.length > 0) {
      return assignedBySales;
    }

    return mappedFromItemDetails;
  }, [stockUnits, effectiveUnitItem?.unit_transaction_item_details, effectiveUnitItem?.unit_transaction_item_sales]);

  const assignedIds = useMemo(() => {
    return assignedDetailRows.map((item) => item.id).filter((item) => item > 0);
  }, [assignedDetailRows]);

  const pickerRows = useMemo(() => {
    const merged = new Map<number, WarehouseStockUnit>();

    stockUnits.forEach((item) => {
      merged.set(item.id, item);
    });

    assignedDetailRows.forEach((item) => {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    });

    return Array.from(merged.values());
  }, [stockUnits, assignedDetailRows]);

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

  const allItemsAssigned = useMemo(() => {
    const rows = salesData?.raw?.unit_transaction_items ?? [];
    if (rows.length === 0) return false;

    return rows.every((item) => {
      const required = Number(item?.qty_total ?? 0);
      const assigned = Math.max(item?.unit_transaction_item_details?.length ?? 0, item?.unit_transaction_item_sales?.length ?? 0);
      return required > 0 && assigned >= required;
    });
  }, [salesData?.raw?.unit_transaction_items]);

  const selectedCount = selectedIds.size;
  const stockState = String(salesData?.raw?.stock_state ?? 'draft');
  const hasPendingSelectionChanges = useMemo(() => {
    if (selectedIds.size !== assignedIds.length) return true;

    const assignedSet = new Set(assignedIds);
    for (const id of selectedIds) {
      if (!assignedSet.has(id)) return true;
    }

    return false;
  }, [selectedIds, assignedIds]);

  const selectedFromSalesCount = Array.isArray(effectiveUnitItem?.unit_transaction_item_sales) ? effectiveUnitItem.unit_transaction_item_sales.length : 0;
  const selectedFromDetailCount = Array.isArray(effectiveUnitItem?.unit_transaction_item_details) ? effectiveUnitItem.unit_transaction_item_details.length : 0;

  const canAssignStock = requiredQty > 0 && selectedCount === requiredQty;
  const canMoveToOutbound = allItemsAssigned && stockState === 'draft';
  const canDispatch =
    stockState === 'outbound_delivered' &&
    allItemsAssigned &&
    assignedIds.length === requiredQty &&
    requiredQty > 0;

  const salesCode = salesData?.raw?.code ?? '-';
  const slugValue = Array.isArray(slug) ? slug[0] : slug || '';
  const salesPath = slugValue ? `/dashboard/${slugValue}/sales` : '/sales';
  const hasRequiredRouteParams = Boolean(salesId && selectedUnitId);

  const toggleOne = (stockId: number, checked: boolean) => {
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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const filteredRows = pickerRows.filter((item) => {
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
        pageRows.forEach((item) => next.add(item.id));
      } else {
        pageRows.forEach((item) => next.delete(item.id));
      }

      return next;
    });
  };

  const handleAssignStock = async () => {
    if (!selectedUnitId) {
      toast.error('Unit transaction item tidak valid');
      return;
    }

    if (!requiredQty || requiredQty <= 0) {
      toast.error('Qty item tidak valid');
      return;
    }

    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error('Pilih minimal 1 stock unit');
      return;
    }

    if (ids.length !== requiredQty) {
      toast.error(`Jumlah unit yang dipilih harus sama dengan qty item (${requiredQty})`);
      return;
    }

    try {
      await assignMutation.mutateAsync({
        unitTransactionItemId: selectedUnitId,
        unitTransactionDetails: ids,
      });

      toast.success('Stock berhasil di-assign ke item sales');
    } catch (error: any) {
      toast.error(readApiError(error));
    }
  };

  const handleMoveToOutbound = async () => {
    if (!salesId) return;

    if (!allItemsAssigned) {
      toast.error('Semua item harus sudah assign stock sebelum update state');
      return;
    }

    try {
      await updateStateMutation.mutateAsync({ id: salesId, stockState: 'outbound_delivered' });
      toast.success('State transaksi berhasil diubah ke outbound_delivered');
    } catch (error: any) {
      toast.error(readApiError(error));
    }
  };

  const handleDispatch = async () => {
    if (!salesId) return;

    if (stockState !== 'outbound_delivered') {
      toast.error('Dispatch hanya bisa dilakukan saat state outbound_delivered');
      return;
    }

    if (!allItemsAssigned) {
      toast.error('Semua item harus sudah assign stock sebelum dispatch');
      return;
    }

    if (!salesData?.raw?.person?.id || !salesData?.raw?.warehouse?.id) {
      toast.error('Person atau warehouse transaksi tidak valid');
      return;
    }

    if (assignedIds.length !== requiredQty || requiredQty <= 0) {
      toast.error('Item ini belum memiliki stock assignment lengkap');
      return;
    }

    try {
      await dispatchMutation.mutateAsync({
        transactionId: salesId,
        personId: String(salesData.raw.person.id),
        warehouseId: String(salesData.raw.warehouse.id),
        unitTransactionDetails: assignedIds,
      });

      await updateStateMutation.mutateAsync({ id: salesId, stockState: 'completed' });
      toast.success('Dispatch stock berhasil dan transaksi diselesaikan');
    } catch (error: any) {
      toast.error(readApiError(error));
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Detail Penjualan Unit</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Jual</span>
              <span className="font-medium text-blue-600">{salesCode}</span>
            </div>
          </div>
        </div>

        <SalesDetailCards data={salesData.ui} />

        <Card className="rounded-xl">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Detail Penjualan Unit</h3>
                <p className="text-sm text-muted-foreground">Pilih stock unit dari warehouse, bukan input manual detail unit</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* <Button
                  size="sm"
                  variant="outline"
                  disabled={!canMoveToOutbound || updateStateMutation.isPending || dispatchMutation.isPending}
                  onClick={handleMoveToOutbound}
                >
                  {updateStateMutation.isPending && stockState === 'draft' ? 'Updating...' : 'Set Outbound'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canDispatch || dispatchMutation.isPending || updateStateMutation.isPending}
                  onClick={handleDispatch}
                >
                  {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Stock'}
                </Button> */}
              </div>
            </div>

            {/* <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-muted-foreground">
                State: <span className="font-medium text-foreground">{stockState}</span>
              </span>
              <span className="text-muted-foreground">
                Assigned Tersimpan:{' '}
                <span className="font-medium text-foreground">
                  {assignedIds.length}/{requiredQty}
                </span>
              </span>
              <span className="text-muted-foreground">
                Pilihan Saat Ini:{' '}
                <span className="font-medium text-foreground">
                  {selectedCount}/{requiredQty}
                </span>
              </span>
              <span className="text-muted-foreground">
                Sumber Sales Mapping:{' '}
                <span className="font-medium text-foreground">{selectedFromSalesCount}</span>
              </span>
              <span className="text-muted-foreground">
                Sumber Detail Legacy:{' '}
                <span className="font-medium text-foreground">{selectedFromDetailCount}</span>
              </span>
              <span className="text-muted-foreground">
                Semua Item Assigned: <span className="font-medium text-foreground">{allItemsAssigned ? 'Ya' : 'Belum'}</span>
              </span>
              {hasPendingSelectionChanges && (
                <span className="text-amber-600">Ada perubahan pilihan yang belum di-assign. Klik tombol Assign Stock untuk menyimpan.</span>
              )}
            </div> */}
            

            <StockPickerTable
              units={pickerRows}
              selectedIds={selectedIds}
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
                  onClick={handleAssignStock}
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
    </DashboardLayout>
  );
}
