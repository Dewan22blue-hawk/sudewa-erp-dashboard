import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, SendHorizontal } from 'lucide-react';
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
  onKirim: (ids: number[]) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
  isLoading?: boolean;
}

export default function PengeluaranUnitDetailTable({ data, onKirim, onDelete, isLoading = false }: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'issued' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [dispatchedIds, setDispatchedIds] = useState<number[]>([]);

  const rows = useMemo(() => {
    const source = data ?? [];
    return source.map((item) => ({
      id: item.id,
      salesCode: item.noPembelian,
      unitTypeName: item.tipeUnit,
      color: item.warna,
      machineNumber: item.noMesin,
      chassisNumber: item.noRangka,
      isDispatched: item.diterima,
      inStock: !item.diterima,
    }));
  }, [data]);

  useEffect(() => {
    const serverDispatchedIds = rows.filter((item) => item.isDispatched).map((item) => item.id);
    setDispatchedIds((prev) => Array.from(new Set([...prev, ...serverDispatchedIds])));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = rows;

    if (term) {
      result = result.filter((row) =>
        [row.salesCode, row.unitTypeName, row.color, row.machineNumber, row.chassisNumber]
          .map((val) => String(val ?? '').toLowerCase())
          .some((val) => val.includes(term))
      );
    }

    if (dispatchFilter === 'issued') {
      result = result.filter((item) => item.isDispatched);
    } else if (dispatchFilter === 'pending') {
      result = result.filter((item) => !item.isDispatched);
    }

    return result;
  }, [rows, search, dispatchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, safePage, itemsPerPage]);

  useEffect(() => {
    setSelected([]);
  }, [filteredRows]);

  const issuedCount = useMemo(() => rows.filter((item) => dispatchedIds.includes(item.id)).length, [rows, dispatchedIds]);
  const pendingCount = useMemo(() => rows.filter((item) => !dispatchedIds.includes(item.id)).length, [rows, dispatchedIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, search, dispatchFilter]);

  const isSelectionDisabled = useCallback((item: any) => {
    return dispatchedIds.includes(item.id);
  }, [dispatchedIds]);

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

  const handleKirim = async () => {
    if (selected.length === 0) return;
    await onKirim(selected);
    setDispatchedIds((prev) => Array.from(new Set([...prev, ...selected])));
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
            checked={selected.includes(item.id) || dispatchedIds.includes(item.id)}
            onCheckedChange={() => toggleSelect(item)}
            disabled={isSelectionDisabled(item)}
          />
        ),
      },
      {
        header: 'KODE JUAL',
        accessorKey: 'salesCode',
        sortable: true,
        cell: (item) => (
          <CopyBox text={item.salesCode || ""} />
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
        header: 'STATUS PENGELUARAN',
        accessorKey: 'isDispatched',
        sortable: true,
        cell: (item) => {
          if (item.isDispatched) {
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Dikeluarkan</Badge>;
          }
          return <Badge variant="outline" className="border-amber-200 text-amber-700">Belum Dikeluarkan</Badge>;
        },
      },
      {
        header: 'STATUS STOCK',
        accessorKey: 'inStock',
        sortable: true,
        cell: (item) => {
          if (item.inStock) {
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Tersedia</Badge>;
          }
          return <Badge variant="outline" className="border-amber-200 text-amber-700">Terjual</Badge>;
        }
      }
    ],
    [paginatedRows, selected, dispatchedIds, slug, isSelectionDisabled, toggleAll, toggleSelect]
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
                <Select value={dispatchFilter} onValueChange={(val) => setDispatchFilter(val as 'all' | 'issued' | 'pending')}>
                  <SelectTrigger className="h-10 w-[190px] border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Data</SelectItem>
                    <SelectItem value="pending">Belum Dikeluarkan</SelectItem>
                    <SelectItem value="issued">Sudah Dikeluarkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Dikeluarkan: {issuedCount}</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Belum Dikeluarkan: {pendingCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between min-h-[40px] pt-3 border-t">
              <div className="flex items-center gap-2 text-[15px] text-gray-500">
                <span>{selected.length} data terpilih</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" className="h-10 px-5 bg-[#1FBE78] hover:bg-[#19ac6c] font-medium rounded-lg gap-2 text-white" onClick={handleKirim} disabled={selected.length === 0}>
                  <SendHorizontal size={16} /> Kirim
                </Button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
