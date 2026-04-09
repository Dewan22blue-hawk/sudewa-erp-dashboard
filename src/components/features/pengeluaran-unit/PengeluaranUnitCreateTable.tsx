'use client';

import { useMemo, useState } from 'react';
import { Check, Search, SendHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DispatchUnitTableRow } from '@/@types/pengeluaran-unit.types';
import { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';

interface Props {
  data: DispatchUnitTableRow[];
  meta: PaginationMeta;
  search: string;
  perPage: number;
  page: number;
  selectedIds: number[];
  isLoading: boolean;
  isError: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onSelectedIdsChange: (ids: number[]) => void;
  onKirim: (ids: number[]) => Promise<void>;
  onCancel?: () => void;
  onRetry?: () => void;
}

export default function PengeluaranUnitCreateTable({
  data,
  meta,
  search,
  perPage,
  page,
  selectedIds,
  isLoading,
  isError,
  isSubmitting,
  errorMessage,
  onSearchChange,
  onPerPageChange,
  onPageChange,
  onSelectedIdsChange,
  onKirim,
  onCancel,
  onRetry,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'issued'>('all');
  const totalPages = Math.max(1, meta.lastPage);
  const filteredData = useMemo(() => {
    if (statusFilter === 'issued') {
      return data.filter((item) => item.isDispatched);
    }

    if (statusFilter === 'pending') {
      return data.filter((item) => !item.isDispatched);
    }

    return data;
  }, [data, statusFilter]);

  const issuedCount = data.filter((item) => item.isDispatched).length;
  const pendingCount = data.length - issuedCount;

  const effectiveSelectedCount = selectedIds.length + issuedCount;

  const toggleSelect = (id: number) => {
    const row = data.find((item) => item.unitTransactionItemDetailId === id);
    if (!row || row.isDispatched) return;

    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((item) => item !== id));
      return;
    }

    onSelectedIdsChange([...selectedIds, id]);
  };

  const toggleAllOnPage = () => {
    if (filteredData.length === 0) return;

    const pageIds = filteredData.filter((item) => !item.isDispatched).map((item) => item.unitTransactionItemDetailId);
    if (pageIds.length === 0) return;

    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      onSelectedIdsChange(selectedIds.filter((id) => !pageIds.includes(id)));
      return;
    }

    onSelectedIdsChange(Array.from(new Set([...selectedIds, ...pageIds])));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let index = 1; index <= totalPages; index += 1) pages.push(index);
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  const startIndex = meta.total === 0 || filteredData.length === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1;
  const endIndex = meta.total === 0 || filteredData.length === 0 ? 0 : Math.min(startIndex + filteredData.length - 1, meta.total);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-60 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(event) => onSearchChange(event.target.value)} className="pl-9 h-10 border-gray-200 rounded-lg focus-visible:ring-1" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
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
            <span>Status</span>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'issued') => setStatusFilter(value)}>
              <SelectTrigger className="h-10 w-[190px] border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="pending">Belum Dikeluarkan</SelectItem>
                <SelectItem value="issued">Sudah Dikeluarkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-gray-200 text-gray-700">Total tampil: {filteredData.length}</Badge>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Sudah Dikeluarkan: {issuedCount}</Badge>
        <Badge variant="outline" className="border-amber-200 text-amber-700">Belum Dikeluarkan: {pendingCount}</Badge>
      </div>

      <div className="flex items-center justify-between min-h-[40px]">
        <div className="flex items-center gap-2 text-[15px] text-gray-500">
          <Check size={20} className="text-[#1FBE78]" strokeWidth={2.5} />
          <span>{effectiveSelectedCount} data tercentang ({selectedIds.length} siap dikirim)</span>
        </div>

        <div className="flex items-center gap-3">
          {onCancel ? (
            <Button variant="ghost" size="sm" className="h-10 px-6 font-medium text-gray-600 hover:text-gray-900 bg-transparent" onClick={onCancel}>
              Batal
            </Button>
          ) : null}
          <Button
            size="sm"
            className="h-10 px-5 bg-[#1FBE78] hover:bg-[#19ac6c] font-medium rounded-lg gap-2 text-white"
            onClick={() => void onKirim(selectedIds)}
            disabled={selectedIds.length === 0 || isSubmitting || isLoading || isError}
          >
            <SendHorizontal size={16} /> {isSubmitting ? 'Mengirim...' : 'Kirim'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f7fa] text-xs font-medium text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3 text-center w-[48px]">
                <Checkbox
                  checked={
                    filteredData.filter((item) => !item.isDispatched).length > 0 &&
                    filteredData.filter((item) => !item.isDispatched).every((item) => selectedIds.includes(item.unitTransactionItemDetailId))
                  }
                  onCheckedChange={toggleAllOnPage}
                />
              </th>
              <th className="px-4 py-2 text-left">NO</th>
              <th className="px-4 py-2 text-left">KODE JUAL</th>
              <th className="px-4 py-2 text-left">TIPE UNIT</th>
              <th className="px-4 py-2 text-left">WARNA</th>
              <th className="px-4 py-2 text-left">NO MESIN</th>
              <th className="px-4 py-2 text-left">NO RANGKA</th>
              <th className="px-4 py-2 text-left">STATUS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Memuat data unit...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-red-600">
                  <div className="space-y-2">
                    <p>{errorMessage ?? 'Gagal memuat data unit'}</p>
                    {onRetry ? (
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        Coba Lagi
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    <Checkbox checked={item.isDispatched || selectedIds.includes(item.unitTransactionItemDetailId)} disabled={item.isDispatched} onCheckedChange={() => toggleSelect(item.unitTransactionItemDetailId)} />
                  </td>
                  <td className="px-4 py-3">{startIndex + index}</td>
                  <td className="px-4 py-3">{item.salesCode}</td>
                  <td className="px-4 py-3">{item.unitTypeName}</td>
                  <td className="px-4 py-3">{item.color}</td>
                  <td className="px-4 py-3">{item.machineNumber}</td>
                  <td className="px-4 py-3">{item.chassisNumber}</td>
                  <td className="px-4 py-3">
                    {item.isDispatched ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Dikeluarkan</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-200 text-amber-700">Belum Dikeluarkan</Badge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
        <div>
          Showing {startIndex === 0 && endIndex === 0 ? 0 : startIndex}-{endIndex} of {meta.total} data
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent hover:text-gray-900 px-3" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          {getPageNumbers().map((pageNumber, index) => (
            <Button
              key={`${String(pageNumber)}-${index}`}
              variant={pageNumber === page ? 'outline' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 border-gray-200 ${pageNumber === page ? 'text-gray-900 hover:bg-gray-50' : 'text-gray-600 hover:bg-transparent hover:text-gray-900 border-transparent'}`}
              onClick={() => {
                if (typeof pageNumber === 'number') onPageChange(pageNumber);
              }}
              disabled={typeof pageNumber !== 'number'}
            >
              {pageNumber}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent hover:text-gray-900 px-3" disabled={page >= totalPages || meta.total === 0} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
