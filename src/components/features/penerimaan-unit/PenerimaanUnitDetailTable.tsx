import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ArrowDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WarehouseActivityUnitDetail } from '@/@types/warehouse.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/router';
import { ReferenceLink } from '@/components/ui/reference-link';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { Badge } from '@/components/ui/badge';
import { CopyBox } from '@/components/ui/copy-box';

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

  const rows = useMemo(() => {
    const source = data ?? [];
    return source.map((item) => ({
      id: item.id,
      purchaseCode: item.noPembelian,
      unitTypeName: item.tipeUnit,
      color: item.warna,
      machineNumber: item.noMesin,
      chassisNumber: item.noRangka,
      status: item.diterima ? 'normal' : 'Belum Diterima',
      unitTransactionId: Number(item.penerimaanId || 0),
      received: item.diterima,
      in_stock: item.diterima,
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
    return receivedIds.includes(item.id);
  }, [receivedIds]);

  const toggleSelect = useCallback((item: any) => {
    if (isSelectionDisabled(item)) return;
    const id = item.id;
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, [isSelectionDisabled]);

  const toggleAll = useCallback(() => {
    if (paginatedRows.length === 0) return;
    const selectableRows = paginatedRows.filter((d) => !isSelectionDisabled(d));
    const allIds = selectableRows.map((d) => d.id);
    if (allIds.length === 0) return;
    const isAllSelected = allIds.every((id) => selected.includes(id));
    setSelected((prev) => (isAllSelected ? prev.filter((id) => !allIds.includes(id)) : Array.from(new Set([...prev, ...allIds]))));
  }, [paginatedRows, isSelectionDisabled, selected]);

  const handleTerima = async () => {
    if (selected.length === 0) return;
    await onTerima(selected);
    setReceivedIds((prev) => Array.from(new Set([...prev, ...selected])));
    setSelected([]);
  };


  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: (
          <Checkbox
            checked={
              paginatedRows.filter((d) => !isSelectionDisabled(d)).length > 0 &&
              paginatedRows.filter((d) => !isSelectionDisabled(d)).every((d) => selected.includes(d.id))
            }
            onCheckedChange={() => toggleAll()}
          />
        ),
        alignment: 'center',
        cell: (item) => (
          <Checkbox
            checked={selected.includes(item.id) || receivedIds.includes(item.id)}
            onCheckedChange={() => toggleSelect(item)}
            disabled={isSelectionDisabled(item)}
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
        header: 'STATUS',
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
        header: 'STATUS STOCK',
        accessorKey: 'in_stock',
        sortable: true,
        cell: (item) => {
          if (item.in_stock === true) {
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Tersedia</Badge>;
          }
          if (item.in_stock === false) {
            return <Badge variant="outline" className="border-amber-200 text-amber-700">Terjual</Badge>;
          }
          return <Badge variant="outline" className="border-gray-200 text-gray-700">-</Badge>;
        }
      }
    ],
    [paginatedRows, selected, receivedIds, slug, isSelectionDisabled, toggleAll, toggleSelect]
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
                  <SelectTrigger className="h-10 w-[180px] border-gray-200 rounded-lg">
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
              </div>
            </div>

            <div className="flex items-center justify-between min-h-[40px] pt-3 border-t">
              <div className="flex items-center gap-2 text-[15px] text-gray-500">
                <span>{selected.length} data terpilih</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" className="h-10 px-5 bg-[#1FBE78] hover:bg-[#19ac6c] font-medium rounded-lg gap-2 text-white" onClick={handleTerima} disabled={selected.length === 0}>
                  <ArrowDown size={16} /> Terima
                </Button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
