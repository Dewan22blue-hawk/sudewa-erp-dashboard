import { useEffect, useMemo, useState } from 'react';
import { Check, Search, Trash, ArrowDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PenerimaanUnitDetail } from '@/@types/penerimaan-unit.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';
import { useCompany } from '@/contexts/CompanyContext';
import { usePenerimaanReceiptTable } from '@/hooks/usePenerimaanReceiptTable';

interface Props {
  data?: PenerimaanUnitDetail[];
  personId?: string;
  onTerima: (ids: number[]) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
}

export default function PenerimaanUnitDetailTable({ data, personId, onTerima, onDelete }: Props) {
  const { companyId } = useCompany();
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('25');
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
      perPage: Number(itemsPerPage),
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

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filteredRows,
  });

  const perPage = Number(itemsPerPage);
  const totalItems = isFallbackMode ? sortedData.length : meta.total || sortedData.length;
  const totalPages = isFallbackMode ? Math.max(1, Math.ceil(totalItems / perPage)) : Math.max(1, meta.lastPage || 1);
  const safeCurrentPage = isFallbackMode ? Math.min(currentPage, totalPages) : meta.currentPage;
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * (isFallbackMode ? perPage : meta.perPage);
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + (isFallbackMode ? perPage : sortedData.length), totalItems);
  const paginated = isFallbackMode ? sortedData.slice(startIndex, startIndex + perPage) : sortedData;
  const receivedCount = useMemo(() => tableRows.filter((item) => receivedIds.includes(item.id)).length, [tableRows, receivedIds]);
  const pendingCount = Math.max(0, tableRows.length - receivedCount);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, search, receivedFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSelect = (id: number) => {
    if (receivedIds.includes(id)) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (paginated.length === 0) return;
    const allIds = paginated.filter((d) => !receivedIds.includes(d.id)).map((d) => d.id);
    if (allIds.length === 0) return;
    const isAllSelected = allIds.every((id) => selected.includes(id));
    setSelected((prev) => (isAllSelected ? prev.filter((id) => !allIds.includes(id)) : Array.from(new Set([...prev, ...allIds]))));
  };

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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-60 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 border-gray-200 rounded-lg focus-visible:ring-1" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <Select value={itemsPerPage} onValueChange={(val) => setItemsPerPage(val)}>
              <SelectTrigger className="h-10 w-20 border-gray-200 rounded-lg">
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

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Filter</span>
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
        </div>

      </div>

      {isLoading ? <div className="text-sm text-gray-500">Memuat data unit transaksi...</div> : null}
      {isError ? <div className="text-sm text-red-500">{(error as { message?: string })?.message || 'Gagal memuat data unit transaksi'}</div> : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Diterima ke stock: {receivedCount}</span>
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Belum diterima: {pendingCount}</span>
      </div>

      <div className="flex items-center justify-between min-h-[40px]">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f7fa] text-xs font-medium text-gray-700">
            <tr>
              <th className="px-4 py-3 text-center w-[48px]">
                <Checkbox
                  checked={paginated.filter((d) => !receivedIds.includes(d.id)).length > 0 && paginated.filter((d) => !receivedIds.includes(d.id)).every((d) => selected.includes(d.id))}
                  onCheckedChange={() => toggleAll()}
                />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="NO" sortKey="id" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="NO PEMBELIAN" sortKey="purchaseCode" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="TIPE UNIT" sortKey="unitTypeName" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="WARNA" sortKey="color" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="NO MESIN" sortKey="machineNumber" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="NO RANGKA" sortKey="chassisNumber" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="STATUS" sortKey="status" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full" />
              </th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginated.length > 0 ? (
              paginated.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    <Checkbox checked={selected.includes(item.id) || receivedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} disabled={receivedIds.includes(item.id)} />
                  </td>
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">{item.purchaseCode}</td>
                  <td className="px-4 py-3">{item.unitTypeName}</td>
                  <td className="px-4 py-3">{item.color}</td>
                  <td className="px-4 py-3">{item.machineNumber}</td>
                  <td className="px-4 py-3">{item.chassisNumber}</td>
                  <td className="px-4 py-3">
                    {receivedIds.includes(item.id) ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Sudah Diterima</span>
                    ) : (
                      item.status
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteIds([item.id])}>
                      <Trash size={16} className="text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
        <div>
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} data
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent hover:text-gray-900 px-3" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </Button>
          {getPageNumbers().map((page, idx) => (
            <Button
              key={idx}
              variant={page === currentPage ? 'outline' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 border-gray-200 ${page === currentPage ? 'text-gray-900 hover:bg-gray-50' : 'text-gray-600 hover:bg-transparent hover:text-gray-900 border-transparent'}`}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={typeof page !== 'number'}
            >
              {page}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent hover:text-gray-900 px-3" disabled={currentPage === totalPages || totalItems === 0} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

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
