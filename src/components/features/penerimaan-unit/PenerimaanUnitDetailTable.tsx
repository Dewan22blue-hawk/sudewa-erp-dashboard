import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Trash, ArrowDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PenerimaanUnitDetail } from '@/@types/penerimaan-unit.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCompany } from '@/contexts/CompanyContext';
import { useRouter } from 'next/router';
import { usePenerimaanReceiptTable } from '@/hooks/usePenerimaanReceiptTable';
import { ReferenceLink } from '@/components/ui/reference-link';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { Badge } from '@/components/ui/badge';
import { CopyBox } from '@/components/ui/copy-box';

interface Props {
  data?: PenerimaanUnitDetail[];
  personId?: string;
  onTerima: (ids: number[]) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
}

export default function PenerimaanUnitDetailTable({ data, personId, onTerima, onDelete }: Props) {
  const { companyId } = useCompany();
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [receivedFilter, setReceivedFilter] = useState<'all' | 'received' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[]>([]);
  const [receivedIds, setReceivedIds] = useState<number[]>([]);

  const { rows, meta, isLoading, isError, error } = usePenerimaanReceiptTable(
    {
      companyId: companyId || '',
      personId,
      page: currentPage,
      perPage: itemsPerPage,
      search,
    },
    Boolean(companyId),
  );

  const mappedFallback = useMemo(() => {
    const source = data ?? [];
    return source.map((item) => ({
      id: item.id,
      purchaseCode: item.noPembelian,
      unitTypeName: item.tipeUnit,
      color: item.warna,
      machineNumber: item.noMesin,
      chassisNumber: item.noRangka,
      status: 'Belum Lunas' as const,
      unitTransactionId: Number(item.penerimaanId || 0),
      received: false,
    }));
  }, [data]);

  const isFallbackMode = mappedFallback.length > 0;
  const tableRows = isFallbackMode ? mappedFallback : rows;

  useEffect(() => {
    const serverReceivedIds = tableRows.filter((item) => item.received).map((item) => item.id);
    setReceivedIds((prev) => Array.from(new Set([...prev, ...serverReceivedIds])));
  }, [tableRows]);

  const filteredRows = useMemo(() => {
    if (receivedFilter === 'all') return tableRows;
    return tableRows.filter((item) => (receivedFilter === 'received' ? receivedIds.includes(item.id) : !receivedIds.includes(item.id)));
  }, [tableRows, receivedFilter, receivedIds]);

  useEffect(() => {
    setSelected([]);
  }, [filteredRows]);

  const receivedCount = useMemo(() => tableRows.filter((item) => receivedIds.includes(item.id)).length, [tableRows, receivedIds]);
  const pendingCount = useMemo(() => tableRows.filter((item) => (item.status === 'normal' || item.status === 'Belum Lunas') && !receivedIds.includes(item.id)).length, [tableRows, receivedIds]);
  const refundCount = useMemo(() => tableRows.filter((item) => item.status === 'refunded' || item.status === 'returned').length, [tableRows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, search, receivedFilter]);

  const isSelectionDisabled = useCallback((item: any) => {
    return receivedIds.includes(item.id) || item.status === 'refunded' || item.status === 'returned';
  }, [receivedIds]);

  const toggleSelect = useCallback((item: any) => {
    if (isSelectionDisabled(item)) return;
    const id = item.id;
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, [isSelectionDisabled]);

  const toggleAll = useCallback(() => {
    if (filteredRows.length === 0) return;
    const selectableRows = filteredRows.filter((d) => !isSelectionDisabled(d));
    const allIds = selectableRows.map((d) => d.id);
    if (allIds.length === 0) return;
    const isAllSelected = allIds.every((id) => selected.includes(id));
    setSelected((prev) => (isAllSelected ? prev.filter((id) => !allIds.includes(id)) : Array.from(new Set([...prev, ...allIds]))));
  }, [filteredRows, isSelectionDisabled, selected]);

  const handleTerima = async () => {
    if (selected.length === 0) return;
    await onTerima(selected);
    setReceivedIds((prev) => Array.from(new Set([...prev, ...selected])));
    setSelected([]);
  };

  const handleDeleteSelected = async () => {
    if (confirmDeleteIds.length === 0) return;
    await onDelete(confirmDeleteIds);
    setSelected((prev) => prev.filter((id) => !confirmDeleteIds.includes(id)));
    setReceivedIds((prev) => prev.filter((id) => !confirmDeleteIds.includes(id)));
    setConfirmDeleteIds([]);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: (
          <Checkbox
            checked={
              filteredRows.filter((d) => !isSelectionDisabled(d)).length > 0 &&
              filteredRows.filter((d) => !isSelectionDisabled(d)).every((d) => selected.includes(d.id))
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
      }
    ],
    [filteredRows, selected, receivedIds, slug, isSelectionDisabled, toggleAll, toggleSelect]
  );

  return (
    <div className="space-y-4">
      {isError ? <div className="text-sm text-red-500">{(error as { message?: string })?.message || 'Gagal memuat data unit transaksi'}</div> : null}

      <BaseTable
        data={filteredRows}
        columns={columns}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        showLimitChange
        perPage={itemsPerPage}
        onPerPageChange={setItemsPerPage}
        meta={
          meta && !isFallbackMode
            ? {
              currentPage: meta.currentPage,
              perPage: meta.perPage,
              lastPage: meta.lastPage,
              total: meta.total,
            }
            : undefined
        }
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
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Refund / Return: {refundCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between min-h-[40px] pt-3 border-t">
              <div className="flex items-center gap-2 text-[15px] text-gray-500">
                <Check size={20} className="text-[#1FBE78]" strokeWidth={2.5} />
                <span>{selected.length} data terpilih</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" className="h-10 px-5 bg-[#1FBE78] hover:bg-[#19ac6c] font-medium rounded-lg gap-2 text-white" onClick={handleTerima} disabled={selected.length === 0}>
                  <ArrowDown size={16} /> Terima
                </Button>

                <Button size="sm" variant="outline" className="h-10 px-6 border-red-400 text-red-500 hover:bg-red-50 font-medium rounded-lg bg-white" onClick={() => setConfirmDeleteIds(selected)} disabled={selected.length === 0}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        }
      />

      <AlertDialog open={confirmDeleteIds.length > 0} onOpenChange={(open) => !open && setConfirmDeleteIds([])}>
        <AlertDialogContent className="max-w-[420px] rounded-2xl p-6 gap-6">
          <AlertDialogHeader className="text-left space-y-3">
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Hapus Data Ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 font-normal">
              Apa anda yakin ingin menghapus data ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 sm:gap-3 sm:space-x-0">
            <AlertDialogCancel className="mt-0 h-10 px-6 rounded-lg font-medium border-gray-200 text-gray-900 hover:bg-gray-50">Batal</AlertDialogCancel>
            <AlertDialogAction className="h-10 px-6 rounded-lg font-medium bg-[#DC2626] text-white hover:bg-red-700" onClick={handleDeleteSelected}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
