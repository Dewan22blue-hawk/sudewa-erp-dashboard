import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ArrowDown, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WarehouseActivityUnitDetail } from '@/@types/warehouse.types';
import { useRouter } from 'next/router';
import { ReferenceLink } from '@/components/ui/reference-link';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { Badge } from '@/components/ui/badge';
import { CopyBox } from '@/components/ui/copy-box';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useBulkUpdateUnitItemDetails, useWarehouseSubBlocks } from '@/hooks/useUnitItemDetail';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  data?: WarehouseActivityUnitDetail[];
  personId?: string;
  onTerima: (ids: number[]) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
  isLoading?: boolean;
}

export default function PenerimaanUnitDetailTable({ data, onTerima, onDelete, isLoading = false }: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [receivedFilter, setReceivedFilter] = useState<'all' | 'received' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [receivedIds, setReceivedIds] = useState<number[]>([]);

  // Modal State
  const [isOpenProcessModal, setIsOpenProcessModal] = useState(false);
  const [stockState, setStockState] = useState<string>('receipt');
  const [warehouseSubBlockId, setWarehouseSubBlockId] = useState<string>('');

  const { data: subBlocksResponse, isLoading: subBlocksLoading } = useWarehouseSubBlocks({ is_active: true });
  const bulkUpdateMutation = useBulkUpdateUnitItemDetails();

  const rows = useMemo(() => {
    const source = data ?? [];
    return source.map((item) => ({
      id: item.id,
      purchaseCode: item.noPembelian,
      unitTypeName: item.tipeUnit,
      color: item.warna,
      machineNumber: item.noMesin,
      chassisNumber: item.noRangka,
      status: item.status,
      in_stock: item.in_stock,
      stockStatus: item.in_stock,
      unitTransactionId: Number(item.penerimaanId || 0),
      state: item?.stockState,
      warehouseSubBlock: item?.warehouseSubBlock,
      received: item.diterima,
    }));
  }, [data]);

  useEffect(() => {
    const serverReceivedIds = rows.filter((item) => item.received).map((item) => item.id);
    setReceivedIds((prev) => Array.from(new Set([...prev, ...serverReceivedIds])));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = rows;

    if (term) {
      result = result.filter((row) =>
        [row.purchaseCode, row.unitTypeName, row.color, row.machineNumber, row.chassisNumber]
          .map((val) => String(val ?? '').toLowerCase())
          .some((val) => val.includes(term))
      );
    }

    if (receivedFilter === 'received') {
      result = result.filter((item) => item.received);
    } else if (receivedFilter === 'pending') {
      result = result.filter((item) => !item.received);
    }

    return result;
  }, [rows, search, receivedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, safePage, itemsPerPage]);

  useEffect(() => {
    setSelected([]);
  }, [filteredRows]);

  const receivedCount = useMemo(() => rows.filter((item) => receivedIds.includes(item.id)).length, [rows, receivedIds]);
  const pendingCount = useMemo(() => rows.filter((item) => !receivedIds.includes(item.id)).length, [rows, receivedIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, search, receivedFilter]);

  const isSelectionDisabled = useCallback((item: any) => {
    return false; // Enable checkbox for all items to allow bulk process
  }, []);

  const toggleSelect = useCallback((item: any) => {
    const id = item.id;
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const toggleAll = useCallback(() => {
    if (paginatedRows.length === 0) return;
    const allIds = paginatedRows.map((d) => d.id);
    const isAllSelected = allIds.every((id) => selected.includes(id));
    setSelected((prev) => (isAllSelected ? prev.filter((id) => !allIds.includes(id)) : Array.from(new Set([...prev, ...allIds]))));
  }, [paginatedRows, selected]);

  const handleSubmitProcess = async () => {
    if (selected.length === 0) return;
    try {
      await bulkUpdateMutation.mutateAsync({
        unit_transaction_item_details_ids: selected,
        stock_state: stockState,
        warehouse_sub_block_id: warehouseSubBlockId ? Number(warehouseSubBlockId) : null,
      });
      toast.success('Berhasil memproses status dan sub-blok unit');
      setSelected([]);
      setIsOpenProcessModal(false);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memproses data unit');
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: (
          <Checkbox
            checked={
              paginatedRows.length > 0 &&
              paginatedRows.every((d) => selected.includes(d.id))
            }
            onCheckedChange={() => toggleAll()}
          />
        ),
        alignment: 'center',
        sticky: 'left',
        className: 'w-[50px] min-w-[50px] max-w-[50px]',
        headerClassName: 'w-[50px] min-w-[50px] max-w-[50px]',
        cell: (item) => (
          <Checkbox
            checked={selected.includes(item.id)}
            onCheckedChange={() => toggleSelect(item)}
          />
        ),
      },
      {
        header: 'NO PEMBELIAN',
        accessorKey: 'purchaseCode',
        sortable: true,
        cell: (item) => (
          <CopyBox text={item.purchaseCode || ""} />
        )
      },
      {
        header: 'TIPE UNIT',
        accessorKey: 'unitTypeName',
        sortable: true,
        cell: (item) => (
          <ReferenceLink href={`/dashboard/${slug}/master/type-unit?search=${item.unitTypeName}`}>
            {item.unitTypeName}
          </ReferenceLink>
        ),
      },
      {
        header: 'WARNA',
        accessorKey: 'color',
        sortable: true,
      },
      {
        header: 'NO MESIN',
        accessorKey: 'machineNumber',
        sortable: true,
        cell: (item) => (
          <CopyBox text={item?.machineNumber || ""} />
        )
      },
      {
        header: 'NO RANGKA',
        accessorKey: 'chassisNumber',
        sortable: true,
        cell: (item) => (
          <CopyBox text={item?.chassisNumber || ""} />
        )
      },
      {
        header: 'SUB BLOK',
        accessorKey: 'warehouseSubBlock',
        sortable: true,
        cell: (item) => item.warehouseSubBlock ? <CopyBox text={item.warehouseSubBlock} /> : <Badge variant='outline' className={`font-semibold bg-white`}>Belum Ditambahkan</Badge>
      },
      {
        header: 'STATUS UNIT',
        accessorKey: 'status',
        sortable: true,
        cell: (item) => {
          let text = '-';
          let background = 'border-slate-200 bg-slate-50 text-slate-700';
          switch (item?.status) {
            case 'returned':
              text = 'Return';
              background = 'border-rose-200 bg-rose-50 text-rose-700';
              break;
            case 'refunded':
              text = 'Refund';
              background = 'border-rose-200 bg-rose-50 text-rose-700';
              break;
            case 'normal':
              text = 'Normal';
              background = 'border-emerald-200 bg-emerald-50 text-emerald-700';
              break;
            default:
              text = 'Belum Diterima';
              background = 'border-amber-200 bg-amber-50 text-amber-700';
              break;
          }

          return (
            <Badge variant='outline' className={`font-semibold ${background}`}>
              {text}
            </Badge>
          );
        },
      },
      {
        header: 'STATUS STOK',
        accessorKey: 'in_stock',
        sortable: true,
        cell: (item) => {
          if (item.in_stock === true) {
            return <Badge className="border-amber-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Tersedia</Badge>;
          }
          if (item.in_stock === false) {
            return <Badge variant="outline" className="border-amber-200 text-amber-700">Tidak Tersedia</Badge>;
          }
          return <Badge variant="outline" className="border-gray-200 text-gray-700">-</Badge>;
        }
      },
      {
        header: 'STATUS PENERIMAAN',
        accessorKey: 'state',
        sortable: true,
        cell: (item) => {
          const config: Record<string, { label: string; name: string; className: string }> = {
            draft: { label: 'Draft', name: 'Draft', className: 'border-slate-200 bg-slate-50 text-slate-600' },
            cancel: { label: 'Cancel', name: 'Batal', className: 'border-rose-200 bg-rose-50 text-rose-700' },
            prepare: { label: 'Prepare', name: 'Disiapkan', className: 'border-amber-200 bg-amber-50 text-amber-700' },
            purchase_order: { label: 'Purchase Order', name: 'Purchase Order', className: 'border-blue-200 bg-blue-50 text-blue-700' },
            in_transit: { label: 'In Transit', name: 'Dalam Perjalanan', className: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
            receipt: { label: 'Receipt', name: 'Diterima', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
          };

          const stateVal = item?.state ?? 'draft';
          const match = config[stateVal] ?? {
            label: stateVal.replace(/_/g, ' '),
            className: 'border-slate-200 bg-slate-50 text-slate-700',
          };

          return (
            <Badge variant="outline" className={cn('capitalize font-semibold', match.className)}>
              {match.name}
            </Badge>
          );
        }
      }
    ],
    [slug, selected, paginatedRows, toggleAll, toggleSelect]
  );

  return (
    <div className="space-y-4">
      <BaseTable
        data={paginatedRows}
        columns={columns}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        showLimitChange
        perPage={itemsPerPage}
        onPerPageChange={setItemsPerPage}
        meta={{
          currentPage: safePage,
          perPage: itemsPerPage,
          lastPage: totalPages,
          total: filteredRows.length,
        }}
        onPageChange={setCurrentPage}
        headerActions={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Filter Status</span>
                <Select value={receivedFilter} onValueChange={(val) => setReceivedFilter(val as 'all' | 'received' | 'pending')}>
                  <SelectTrigger className="h-10 w-[190px] border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Data</SelectItem>
                    <SelectItem value="pending">Belum Diterima</SelectItem>
                    <SelectItem value="received">Sudah Diterima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Diterima ke stock: {receivedCount}</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Belum diterima: {pendingCount}</span>

                <Button
                  onClick={() => setIsOpenProcessModal(true)}
                  disabled={selected.length === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs gap-1.5 font-medium rounded-lg ml-2 shadow-sm"
                >
                  <Settings size={14} className="animate-spin-hover" /> Proses Data ({selected.length})
                </Button>
              </div>
            </div>
          </div>
        }
      />

      <Dialog open={isOpenProcessModal} onOpenChange={setIsOpenProcessModal}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[90vw] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Proses Data Unit ({selected.length} Unit Terpilih)</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 my-4">
            {/* Selected Vehicles Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-[#f8f9fa] text-slate-600 uppercase text-xs font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">No Pembelian</th>
                      <th className="px-4 py-3">Tipe Unit</th>
                      <th className="px-4 py-3">Warna</th>
                      <th className="px-4 py-3">No Mesin</th>
                      <th className="px-4 py-3">No Rangka</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.filter((row) => selected.includes(row.id)).map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.purchaseCode || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{row.unitTypeName || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{row.color || '-'}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs"><CopyBox text={row.machineNumber || ''} /></td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs"><CopyBox text={row.chassisNumber || ''} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Posisi Stok</label>
                <Select value={stockState} onValueChange={setStockState}>
                  <SelectTrigger className="w-full bg-white border-slate-200 h-10 rounded-lg">
                    <SelectValue placeholder="Pilih posisi stok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase_order">Purchase Order (PO)</SelectItem>
                    <SelectItem value="in_transit">In Transit (Dalam Perjalanan)</SelectItem>
                    <SelectItem value="receipt">Receipt (Diterima / Tersedia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Sub Blok Gudang</label>
                <Select value={warehouseSubBlockId} onValueChange={setWarehouseSubBlockId}>
                  <SelectTrigger className="w-full bg-white border-slate-200 h-10 rounded-lg">
                    <SelectValue placeholder={subBlocksLoading ? "Memuat sub blok..." : "Pilih sub blok gudang"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subBlocksResponse?.data?.data?.map((sb: any) => (
                      <SelectItem key={sb.id} value={String(sb.id)}>
                        {sb.name}
                      </SelectItem>
                    )) || (
                        <SelectItem value="none" disabled>
                          Tidak ada sub blok aktif
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button variant="outline" className="rounded-lg" onClick={() => setIsOpenProcessModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitProcess}
              disabled={bulkUpdateMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5"
            >
              {bulkUpdateMutation.isPending ? 'Memproses...' : 'Proses Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
